// Lesson Pipeline API
// Fetches a churchofjesuschrist.org lesson, extracts content, and generates game-ready questions
// using Youth Leader principles (Teaching in the Savior's Way, Handbook §13)
// Supports gameType: 'common-ground' (Family Feud format) | 'memory' (matching pairs)
// questionType: 'mixed' | 'scripture_based' | 'scripture_application' | 'family_feud'

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') { res.status(200).end(); return }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

    let body = ''
    await new Promise((resolve) => {
        req.on('data', chunk => body += chunk)
        req.on('end', resolve)
    })

    try {
        const { url, gameType = 'common-ground', questionType = 'mixed' } = JSON.parse(body)
        if (!url) { res.status(400).json({ error: 'Missing URL' }); return }

        let parsedUrl
        try { parsedUrl = new URL(url) } catch { res.status(400).json({ error: 'Invalid URL' }); return }
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            res.status(400).json({ error: 'HTTP/HTTPS only' }); return
        }

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' }); return }

        // Step 1: Fetch lesson page
        const pageResp = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (KindredYouth/1.0 lesson-pipeline)' },
            signal: AbortSignal.timeout(15000),
        })
        if (!pageResp.ok) { res.status(502).json({ error: `Lesson page returned ${pageResp.status}` }); return }

        const html = await pageResp.text()

        // --- Extract rich media BEFORE stripping tags ---

        // Conference talk links (general-conference and other talks)
        const talkSet = new Set()
        for (const m of html.matchAll(/href="((?:https?:\/\/www\.churchofjesuschrist\.org)?\/study\/(?:general-conference|manual|ensign|liahona|new-era)[^"#?]*?)(?:[#?][^"]*)?"[^>]*>([^<]{5,80})</g)) {
            const href = m[1].startsWith('http') ? m[1] : `https://www.churchofjesuschrist.org${m[1]}`
            const label = m[2].trim().replace(/\s+/g, ' ')
            talkSet.add(JSON.stringify({ url: href, label }))
        }
        const talkLinks = [...talkSet].slice(0, 12).map(s => JSON.parse(s))

        // Scripture links
        const scriptureSet = new Set()
        for (const m of html.matchAll(/href="((?:https?:\/\/www\.churchofjesuschrist\.org)?\/study\/scriptures\/[^"#?]*?)(?:[#?][^"]*)?"[^>]*>([^<]{3,60})</g)) {
            const href = m[1].startsWith('http') ? m[1] : `https://www.churchofjesuschrist.org${m[1]}`
            const label = m[2].trim().replace(/\s+/g, ' ')
            if (label.length > 3) scriptureSet.add(JSON.stringify({ url: href, label }))
        }
        const scriptureLinks = [...scriptureSet].slice(0, 20).map(s => JSON.parse(s))

        // Video embeds — YouTube and Church media player
        const videoSet = new Set()
        for (const m of html.matchAll(/(?:src|data-src)="(https?:\/\/(?:www\.youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/|www\.churchofjesuschrist\.org\/media\/video\/)[^"]+)"/g)) {
            videoSet.add(m[1])
        }
        // Also catch YouTube watch URLs linked in the page
        for (const m of html.matchAll(/href="(https?:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)[^"]+)"/g)) {
            videoSet.add(m[1])
        }
        const videoLinks = [...videoSet].slice(0, 6)

        // --- Strip HTML for plain text ---
        const lessonText = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[\s\S]*?<\/nav>/gi, '')
            .replace(/<footer[\s\S]*?<\/footer>/gi, '')
            .replace(/<header[\s\S]*?<\/header>/gi, '')
            .replace(/<aside[\s\S]*?<\/aside>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .slice(0, 9000)

        if (lessonText.length < 100) {
            res.status(422).json({ error: 'Could not extract readable text from this URL. Try a direct lesson page.' }); return
        }

        const claudeHeaders = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        }

        // ── Step 2: Extract rich lesson structure (mirrors extract-lesson skill) ──
        const extractPrompt = buildExtractionPrompt(lessonText, url, { talkLinks, scriptureLinks, videoLinks })
        const extractBody = JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            messages: [{ role: 'user', content: extractPrompt }]
        })

        let extractResp = await callClaude(claudeHeaders, extractBody)
        if (extractResp.error) { res.status(500).json({ error: `Extraction step: ${extractResp.error}` }); return }

        let lessonStructure
        try {
            lessonStructure = JSON.parse(extractResp.text)
        } catch {
            const m = extractResp.text.match(/\{[\s\S]*\}/)
            if (m) { try { lessonStructure = JSON.parse(m[0]) } catch { lessonStructure = null } }
        }
        if (!lessonStructure) { res.status(502).json({ error: 'Extraction step returned malformed JSON' }); return }

        console.log('[pipeline] STEP1 scriptureRefs:', JSON.stringify(
            (lessonStructure.scriptureRefs || []).map(s => ({ ref: s.ref, verseText: s.verseText?.slice(0,60) || 'EMPTY' }))
        ))

        // ── Step 3: Generate game content (mirrors youth-leader / gamemaster skills) ──
        const generatePrompt = buildGenerationPrompt(lessonStructure, url, gameType, questionType)
        const generateBody = JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 6000,
            messages: [{ role: 'user', content: generatePrompt }]
        })

        let generateResp = await callClaude(claudeHeaders, generateBody)
        if (generateResp.error) { res.status(500).json({ error: `Generation step: ${generateResp.error}` }); return }

        console.log('[pipeline] STEP2 raw response (first 2000 chars):', generateResp.text?.slice(0, 2000))

        let parsed
        try {
            parsed = JSON.parse(generateResp.text)
        } catch {
            const m = generateResp.text.match(/\{[\s\S]*\}/)
            if (m) { try { parsed = JSON.parse(m[0]) } catch { parsed = null } }
        }
        if (!parsed?.rounds?.length && !parsed?.pairs?.length) {
            res.status(502).json({ error: 'Generation step missing rounds/pairs' }); return
        }

        // Backfill and validate memory pairs
        if (parsed.pairs?.length) {
            console.log('[pipeline] STEP2 pairs BEFORE backfill:', JSON.stringify(
                parsed.pairs.map(p => ({ cardA: p.cardA, verse: p.verse?.slice(0,60) || 'EMPTY', scene: p.scene || 'EMPTY' }))
            ))

            // Build a lookup from Step 1 scripture refs: normalised ref → verseText
            const refLookup = {}
            for (const s of (lessonStructure.scriptureRefs || [])) {
                if (s.verseText?.trim()) {
                    refLookup[s.ref.toLowerCase().replace(/\s+/g, '')] = s.verseText.trim()
                }
            }
            console.log('[pipeline] refLookup keys:', Object.keys(refLookup))

            for (const p of parsed.pairs) {
                // If verse is missing, try to backfill from Step 1 scripture data
                if (!p.verse?.trim()) {
                    const refKey = (p.cardA || '').split('—')[0].trim().toLowerCase().replace(/\s+/g, '')
                    console.log(`[pipeline] BACKFILL attempt for "${p.cardA}" → key "${refKey}" → found: ${!!refLookup[refKey]}`)
                    p.verse = refLookup[refKey] || null
                }
                // If scene is missing, derive a minimal fallback
                if (!p.scene?.trim()) {
                    p.scene = (p.cardA || '').split('—')[0].trim() || null
                }
            }

            // Drop any pair where verse is still null after backfill
            const before = parsed.pairs.length
            parsed.pairs = parsed.pairs.filter(p => p.verse?.trim())
            console.log(`[pipeline] pairs AFTER filter: ${parsed.pairs.length}/${before} kept`)
            if (parsed.pairs.length === 0) {
                res.status(502).json({ error: `All ${before} pairs missing verse text even after backfill — try again` }); return
            }
        }

        parsed.sourceUrl = url
        parsed.generatedAt = new Date().toISOString()
        parsed.pipeline = 'lesson-pipeline-v2'
        if (lessonStructure.videoLinks?.length) parsed.videoLinks = lessonStructure.videoLinks
        if (lessonStructure.talkLinks?.length) parsed.talkLinks = lessonStructure.talkLinks

        res.status(200).json(parsed)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ── Shared Claude caller with one retry on overload ──────────────────────────
async function callClaude(headers, body) {
    const call = () => fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body })
    let resp = await call()
    if (!resp.ok) {
        const txt = await resp.text()
        const retry = resp.status === 529 || resp.status === 500 || resp.status === 503 ||
            txt.includes('overloaded') || txt.includes('timeout')
        if (retry) {
            await new Promise(r => setTimeout(r, 5000))
            resp = await call()
            if (!resp.ok) { return { error: (await resp.text()).slice(0, 200) } }
        } else {
            return { error: txt.slice(0, 200) }
        }
    }
    const data = await resp.json()
    return { text: data.content[0].text }
}

// ── Step 1 prompt: mirrors extract-lesson skill ───────────────────────────────
function buildExtractionPrompt(lessonText, sourceUrl, media = {}) {
    const { talkLinks = [], scriptureLinks = [], videoLinks = [] } = media
    let mediaBlock = ''
    if (videoLinks.length) mediaBlock += `\nVideos found:\n${videoLinks.map(v=>`- ${v}`).join('\n')}\n`
    if (talkLinks.length) mediaBlock += `\nConference talks/articles linked:\n${talkLinks.map(t=>`- ${t.label}: ${t.url}`).join('\n')}\n`
    if (scriptureLinks.length) mediaBlock += `\nScripture links found:\n${scriptureLinks.map(s=>`- ${s.label}: ${s.url}`).join('\n')}\n`

    return `You are extracting structured lesson data from a Come Follow Me lesson page for LDS youth Sunday School.

Source URL: ${sourceUrl}

Lesson text (HTML stripped):
---
${lessonText}
---
${mediaBlock}
## Your task
Extract the following and return as JSON only (no markdown):

1. **title** — lesson title
2. **weekLabel** — date range (e.g. "May 11–17")
3. **scriptureRefs** — array of every scripture reference found. For each:
   - ref: human-readable reference (e.g. "Deuteronomy 6:5")
   - verseText: quote the actual verse text verbatim from your knowledge of the KJV scriptures and LDS standard works. For ranges, quote all verses. Max 400 chars. This is critical — always provide verse text.
   - url: construct the Gospel Library URL: https://www.churchofjesuschrist.org/study/scriptures/{volume}/{slug}/{chapter}?lang=eng#{anchor} (use p1, p2... for verse anchors). Use any matching URL from the scripture links above if available.
   - section: which lesson section this appeared in
4. **videoLinks** — all video URLs found (YouTube, Church media). Use the video list above plus any in the lesson text.
5. **talkLinks** — all conference talk / article links. Use the talk list above plus any in the lesson text. Each: { title, speaker (if known), url }
6. **discussionQuestions** — key discussion questions from the lesson text (max 8)
7. **keyThemes** — 3–5 core spiritual themes of this lesson

Return ONLY valid JSON:
{
  "title": "...",
  "weekLabel": "...",
  "scriptureRefs": [
    { "ref": "...", "verseText": "...", "url": "...", "section": "..." }
  ],
  "videoLinks": ["..."],
  "talkLinks": [{ "title": "...", "speaker": "...", "url": "..." }],
  "discussionQuestions": ["..."],
  "keyThemes": ["..."]
}`
}

// ── Step 2 prompt: mirrors youth-leader + gamemaster skills ───────────────────
function buildGenerationPrompt(lessonStructure, sourceUrl, gameType, questionType) {
    const isMemory = gameType === 'memory'
    const scriptureList = (lessonStructure.scriptureRefs || [])
        .map(s => `- ${s.ref}: "${s.verseText?.trim() || '[supply verbatim from your KJV knowledge]'}" [${s.url || ''}]`).join('\n')
    const talkList = (lessonStructure.talkLinks || [])
        .map(t => `- ${t.title}${t.speaker ? ` (${t.speaker})` : ''}: ${t.url}`).join('\n')
    const videoList = (lessonStructure.videoLinks || []).map(v => `- ${v}`).join('\n')

    if (isMemory) {
        return `You are the Kindred Gamemaster designing a Scripture Scout memory matching game for LDS youth (ages 13–16).

Lesson: ${lessonStructure.title} (${lessonStructure.weekLabel || ''})
Source: ${sourceUrl}

Key themes: ${(lessonStructure.keyThemes || []).join(', ')}

Scriptures with verse texts:
${scriptureList}

Conference talks:
${talkList || 'None found'}

Videos:
${videoList || 'None found'}

Discussion questions from lesson:
${(lessonStructure.discussionQuestions || []).map(q => `- ${q}`).join('\n')}

## Your task
Generate exactly 12 matching pairs. Use the verse texts above verbatim — do NOT paraphrase or invent scripture text.

Rules:
- Every pair connects back to Jesus Christ
- Questions answerable by any youth regardless of testimony level
- Assign the most relevant Gospel Library URL or talk URL to each pair for QR codes
- scene: describe where/when in the story this scripture takes place (1 short phrase)

Return ONLY valid JSON:
{
  "topic": "...",
  "pairs": [
    {
      "id": "p1",
      "cardA": "Scripture ref — Short title",
      "cardB": "Key phrase or modern application",
      "scene": "Where/when this happens",
      "verse": "Verbatim verse text from the scriptures above",
      "question": "Discussion question for class",
      "christConnection": "One sentence connecting to Jesus Christ",
      "icon": "emoji",
      "iconLabel": "2-3 word label",
      "url": "https://www.churchofjesuschrist.org/..."
    }
  ]
}`
    }

    const typeInstructions = {
        mixed: 'Generate exactly 8 rounds: 2 scripture_based + 2 scripture_application + 4 family_feud.',
        scripture_based: 'Generate exactly 6 scripture_based rounds.',
        scripture_application: 'Generate exactly 6 scripture_application rounds.',
        family_feud: 'Generate exactly 6 family_feud rounds.',
    }

    return `You are the Kindred Gamemaster designing Common Ground (survey-style) game questions for LDS youth (ages 13–16).

Lesson: ${lessonStructure.title} (${lessonStructure.weekLabel || ''})
Source: ${sourceUrl}

Key themes: ${(lessonStructure.keyThemes || []).join(', ')}

Scriptures with verse texts:
${scriptureList}

Conference talks:
${talkList || 'None found'}

Discussion questions from lesson:
${(lessonStructure.discussionQuestions || []).map(q => `- ${q}`).join('\n')}

## Your task
${typeInstructions[questionType] || typeInstructions.mixed}

Rules:
- scripture_based: quote verseText verbatim, ask factual question. 4 answers (40/30/20/10).
- scripture_application: quote verseText verbatim, ask how it applies to youth today. 4 answers (40/30/20/10).
- family_feud: survey style. 6 answers (38/22/14/10/9/7). Real youth behaviors, not just idealized answers.
- Every question connects to Jesus Christ
- Include url field (scripture or talk link) for scripture-based and application questions

Return ONLY valid JSON:
{
  "topic": "...",
  "rounds": [
    {
      "question": "...",
      "type": "scripture_based|scripture_application|family_feud",
      "verseText": "verbatim verse (null for family_feud)",
      "christConnection": "one sentence",
      "url": "https://... or null",
      "answers": [{ "text": "...", "points": 40 }]
    }
  ]
}`
}

// ── Legacy single-step prompt (kept for reference, no longer called) ──────────
function buildLessonPipelinePrompt(lessonText, sourceUrl, gameType, questionType, media = {}) {
    const { talkLinks = [], scriptureLinks = [], videoLinks = [] } = media
    const isMemory = gameType === 'memory'

    // Build media context block
    let mediaBlock = ''
    if (videoLinks.length) {
        mediaBlock += `\n## Videos found in this lesson\n${videoLinks.map(v => `- ${v}`).join('\n')}\n`
    }
    if (talkLinks.length) {
        mediaBlock += `\n## Conference talks and articles linked in this lesson\n${talkLinks.map(t => `- ${t.label}: ${t.url}`).join('\n')}\n`
    }
    if (scriptureLinks.length) {
        mediaBlock += `\n## Scripture links found in this lesson\n${scriptureLinks.map(s => `- ${s.label}: ${s.url}`).join('\n')}\n`
    }

    if (isMemory) {
        return `You are the Kindred Gamemaster — an expert at designing scripture memory matching games for LDS youth Sunday School (ages 13–16).

You have been given a lesson from The Church of Jesus Christ of Latter-day Saints:

Source: ${sourceUrl}

Lesson content:
---
${lessonText}
---
${mediaBlock}
## Your task
Generate exactly 12 matching pairs for a Scripture Scout memory card game. Each pair has two cards that match:
- Card A: A scripture reference and short title (e.g., "Deuteronomy 6:5 — Love with all your heart")
- Card B: A key phrase, concept, or modern application from that scripture (e.g., "The greatest commandment")

Each pair MUST include ALL of the following — no field may be null or empty:
- scene: where/when this scripture takes place (e.g. "The shores of the Red Sea") — REQUIRED
- verse: the ACTUAL scripture text quoted verbatim from the KJV or standard works. This MUST be a real, complete quote. Do NOT leave this blank. Max 120 words. — REQUIRED
- question: a class discussion question connecting the verse to modern youth life — REQUIRED
- url: a Gospel Library URL for the scripture. Construct as https://www.churchofjesuschrist.org/study/scriptures/{volume}/{book}/{chapter}?lang=eng#{verseAnchor} if not found above — REQUIRED

If a conference talk is clearly connected to a pair, use its URL as the pair's url. Otherwise use the scripture URL.

## Rules
- Every pair must connect back to Jesus Christ
- Questions must be answerable by any youth regardless of testimony level
- Use only content from published Church scriptures and lesson materials
- Do NOT use personal testimonies, struggles, or family situations as content

Return ONLY valid JSON, no markdown:
{
  "topic": "lesson title",
  "pairs": [
    {
      "id": "p1",
      "cardA": "Scripture ref — Short title",
      "cardB": "Key phrase or modern application",
      "scene": "Brief scene description (where/when this happens)",
      "verse": "Quoted scripture text (1-3 sentences, in quotes)",
      "question": "Discussion question for class",
      "christConnection": "One sentence connecting this to Jesus Christ",
      "icon": "emoji representing the concept",
      "iconLabel": "2-3 word label",
      "url": "https://www.churchofjesuschrist.org/..."
    }
  ]
}`
    }

    // Common Ground (Family Feud format)
    const typeInstructions = {
        mixed: `Generate exactly 8 rounds: 2 scripture_based + 2 scripture_application + 4 family_feud.`,
        scripture_based: `Generate exactly 6 scripture_based rounds.`,
        scripture_application: `Generate exactly 6 scripture_application rounds.`,
        family_feud: `Generate exactly 6 family_feud rounds.`,
    }

    return `You are the Kindred Gamemaster — an expert at designing Common Ground (survey-style) game questions for LDS youth Sunday School (ages 13–16).

You have been given a lesson from The Church of Jesus Christ of Latter-day Saints:

Source: ${sourceUrl}

Lesson content:
---
${lessonText}
---
${mediaBlock}
## Your task
${typeInstructions[questionType] || typeInstructions.mixed}

## Question types
- scripture_based: Quote a verse verbatim, ask a FACTUAL question about what it says. 4 answers (40/30/20/10 pts).
- scripture_application: Quote a verse, ask how that principle applies to youth TODAY. 4 answers (40/30/20/10 pts). Must be answerable without a testimony.
- family_feud: Classic survey style ("We surveyed 100 LDS youth… Name something…"). 6 answers (38/22/14/10/9/7 pts). Use real youth behaviors, not just idealized answers.

## Rules — Teaching in the Savior's Way
- Every question connects back to Jesus Christ
- Answerable by any youth regardless of testimony depth
- Clear, unambiguous language for ages 13–16
- No question may expose personal struggles or require testimony to answer
- Family Feud answers should include realistic, honest youth responses (not just "pray" and "read scriptures" every time)
- For scripture_based and scripture_application questions, include a url field pointing to the scripture or conference talk (use extracted links above where possible)

Return ONLY valid JSON, no markdown:
{
  "topic": "lesson title",
  "rounds": [
    {
      "question": "...",
      "type": "scripture_based|scripture_application|family_feud",
      "christConnection": "one sentence connecting to Jesus Christ",
      "url": "https://www.churchofjesuschrist.org/... (optional, for scripture/talk rounds)",
      "answers": [
        {"text": "...", "points": 40}
      ]
    }
  ]
}`
}
