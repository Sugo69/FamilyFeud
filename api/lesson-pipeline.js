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
            .slice(0, 10000)

        if (lessonText.length < 100) {
            res.status(422).json({ error: 'Could not extract readable text from this URL. Try a direct lesson page.' }); return
        }

        // Step 2: Generate questions with lesson pipeline prompt
        const prompt = buildLessonPipelinePrompt(lessonText, url, gameType, questionType)

        const claudeBody = JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 6000,
            messages: [{ role: 'user', content: prompt }]
        })
        const claudeHeaders = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        }

        let claudeResp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST', headers: claudeHeaders, body: claudeBody
        })
        if (!claudeResp.ok) {
            const errText = await claudeResp.text()
            const isRetryable = claudeResp.status === 529 || claudeResp.status === 500 ||
                claudeResp.status === 503 || errText.includes('timeout') || errText.includes('overloaded')
            if (isRetryable) {
                await new Promise(r => setTimeout(r, 5000))
                claudeResp = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST', headers: claudeHeaders, body: claudeBody
                })
                if (!claudeResp.ok) {
                    const t2 = await claudeResp.text()
                    res.status(500).json({ error: `Claude API error (retry failed): ${t2.slice(0, 200)}` }); return
                }
            } else {
                res.status(500).json({ error: `Claude API error: ${errText.slice(0, 200)}` }); return
            }
        }

        const claudeData = await claudeResp.json()
        const rawContent = claudeData.content[0].text

        let parsed
        try {
            parsed = JSON.parse(rawContent)
        } catch {
            const match = rawContent.match(/\{[\s\S]*\}/)
            if (match) {
                try { parsed = JSON.parse(match[0]) }
                catch { res.status(502).json({ error: 'AI returned malformed JSON' }); return }
            } else {
                res.status(502).json({ error: 'AI did not return JSON' }); return
            }
        }

        if (!parsed.rounds?.length && !parsed.pairs?.length) {
            res.status(502).json({ error: 'AI response missing rounds/pairs' }); return
        }

        parsed.sourceUrl = url
        parsed.generatedAt = new Date().toISOString()
        parsed.pipeline = 'lesson-pipeline'

        res.status(200).json(parsed)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

function buildLessonPipelinePrompt(lessonText, sourceUrl, gameType, questionType) {
    const isMemory = gameType === 'memory'

    if (isMemory) {
        return `You are the Kindred Gamemaster — an expert at designing scripture memory matching games for LDS youth Sunday School (ages 13–16).

You have been given a lesson from The Church of Jesus Christ of Latter-day Saints:

Source: ${sourceUrl}

Lesson content:
---
${lessonText}
---

## Your task
Generate exactly 12 matching pairs for a Scripture Scout memory card game. Each pair has two cards that match:
- Card A: A scripture reference and short title (e.g., "Deuteronomy 6:5 — Love with all your heart")
- Card B: A key phrase, concept, or modern application from that scripture (e.g., "The greatest commandment")

Each pair must also have a discussion question that a teacher can ask when the match is found.

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
      "question": "Discussion question for class",
      "christConnection": "One sentence connecting this to Jesus Christ",
      "icon": "emoji representing the concept",
      "iconLabel": "2-3 word label"
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

Return ONLY valid JSON, no markdown:
{
  "topic": "lesson title",
  "rounds": [
    {
      "question": "...",
      "type": "scripture_based|scripture_application|family_feud",
      "christConnection": "one sentence connecting to Jesus Christ",
      "answers": [
        {"text": "...", "points": 40}
      ]
    }
  ]
}`
}
