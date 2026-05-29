// Seminary daily lesson schedule.
// ──────────────────────────────────────────────────────────────────────────
// ⚠ STUB / PROOF-OF-CONCEPT DATA — replace with the full NT 2026–27
//   Seminary Teacher Manual lesson list before Aug 2026 launch.
//
// Seminary differs from Come Follow Me on three axes:
//   1. Daily (Mon–Fri school days), not weekly Sundays
//   2. Organized by scripture chapter progression, not annual themes
//   3. Has a separate Doctrinal Mastery curriculum of 25 passages/year
//
// Source URLs follow the same pattern as cfm-schedule:
//   https://www.churchofjesuschrist.org/study/manual/new-testament-seminary-teacher-manual-2024/lesson-{nnn}?lang=eng
//
// The `type` field drives the smart-recommendation engine on the portal
// (same matrix as CFM lessons — see cfm-schedule.js).
//
// `dmPassage` marks lessons that focus on one of the 25 Doctrinal
// Mastery passages — these are the lessons that should also recommend
// the "By Heart" memorization game (Phase A, not yet built).

const SEMINARY_2026_NT_STUB = [
  // ── Week 1 — opening of NT Seminary year ──
  { slug: '001', date: '2026-08-17', title: 'Introduction to the New Testament', scriptures: 'Overview',                 type: 'doctrinal', dmPassage: null },
  { slug: '002', date: '2026-08-18', title: 'Joseph Smith — Matthew 1',          scriptures: 'JS-Matthew 1; Matthew 1',  type: 'mixed',     dmPassage: null },
  { slug: '003', date: '2026-08-19', title: 'The Birth of Jesus Christ',         scriptures: 'Matthew 1–2',              type: 'narrative', dmPassage: null },
  { slug: '004', date: '2026-08-20', title: 'Gabriel’s Annunciation',       scriptures: 'Luke 1',                   type: 'narrative', dmPassage: null },
  { slug: '005', date: '2026-08-21', title: 'Christ Is Born in Bethlehem',       scriptures: 'Luke 2',                   type: 'narrative', dmPassage: null },

  // ── Week 2 — John the Baptist, calling of the disciples ──
  { slug: '006', date: '2026-08-24', title: 'John the Baptist Prepares the Way', scriptures: 'Matthew 3; Mark 1; Luke 3', type: 'narrative', dmPassage: null },
  { slug: '007', date: '2026-08-25', title: 'The Temptation of Jesus',           scriptures: 'Matthew 4; Luke 4',         type: 'narrative', dmPassage: null },
  { slug: '008', date: '2026-08-26', title: 'The Word Made Flesh',               scriptures: 'John 1',                    type: 'mixed',     dmPassage: 'John 1:1-3, 14' },
  { slug: '009', date: '2026-08-27', title: 'Cana and the Cleansing of the Temple', scriptures: 'John 2',                 type: 'narrative', dmPassage: null },
  { slug: '010', date: '2026-08-28', title: 'Born Again — Nicodemus',            scriptures: 'John 3',                    type: 'mixed',     dmPassage: 'John 3:5' },
];

// Identifier and URL plumbing — mirrors cfm-schedule's contract so the
// portal's renderer can treat both schedules through one interface.
const MANUAL_SLUG = 'new-testament-seminary-teacher-manual-2024';
const MANUAL_BASE = `https://www.churchofjesuschrist.org/study/manual/${MANUAL_SLUG}`;

export function getAllSeminaryLessons() {
  return SEMINARY_2026_NT_STUB.map(toResolvedLesson);
}

// Returns today's Seminary lesson (Mon–Fri only). On weekends or after
// the school year ends, returns the next school-day lesson. Outside the
// stub date range, returns the first lesson.
export function getCurrentSeminaryLesson(date = new Date()) {
  const today = toUtcMidnight(date);
  for (const lesson of SEMINARY_2026_NT_STUB) {
    if (toUtcMidnight(lesson.date) >= today) return toResolvedLesson(lesson);
  }
  return toResolvedLesson(SEMINARY_2026_NT_STUB[0]);
}

// Returns the next `count` Seminary lessons starting from today, skipping
// weekends. Used by the "Upcoming" strip on the portal.
export function getUpcomingSeminaryLessons(date = new Date(), count = 5) {
  const today = toUtcMidnight(date);
  const upcoming = SEMINARY_2026_NT_STUB
    .filter(l => toUtcMidnight(l.date) >= today)
    .slice(0, count);
  return upcoming.map(toResolvedLesson);
}

// Flag indicating this is still placeholder content. The UI surfaces a
// "stub" banner when this is true so teachers know it's not the live
// curriculum yet.
export const SEMINARY_IS_STUB = true;

// ── Internals ──────────────────────────────────────────────────────────
function toResolvedLesson(lesson) {
  const d = parseIsoDate(lesson.date);
  return {
    ...lesson,
    url: `${MANUAL_BASE}/lesson-${lesson.slug}?lang=eng`,
    lessonId: `${MANUAL_SLUG}-${lesson.slug}`,
    displayDate: formatSeminaryDate(d),
    weekday: WEEKDAYS[d.getUTCDay()],
  };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function formatSeminaryDate(d) {
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function parseIsoDate(iso) {
  return new Date(iso + 'T00:00:00Z');
}
function toUtcMidnight(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
