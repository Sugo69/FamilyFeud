// Trail stop positions — New Testament (Seminary 2026-27)
// ──────────────────────────────────────────────────────────────────────────
// STUB — positions and board art are placeholders until the NT trail board
// is commissioned. See the Gemini prompt in CLAUDE.md / chat history.
// Replace boardSrc and all 10 positions once the art is finalised.
// Shape to follow: src/lib/trail-positions-ot.js

export const THEME = {
  key: 'nt',
  boardSrc: '/games/assets/scripture-trail-board-nt.png',
  tokenStart: { x: 120, y: 820 },

  // TODO: replace with positions calibrated against NT board art
  positions: [
    { x:  230, y: 760 },
    { x:  400, y: 790 },
    { x:  570, y: 820 },
    { x:  740, y: 560 },
    { x:  935, y: 695 },
    { x: 1130, y: 830 },
    { x: 1320, y: 710 },
    { x: 1410, y: 770 },
    { x: 1500, y: 830 },
    { x: 1860, y: 550 },
  ],

  // TODO: replace with NT geography (Galilee, Jerusalem, etc.)
  regions: [
    { label: 'GALILEE',    x:  120, y: 1020 },
    { label: 'CAPERNAUM',  x:  560, y: 1070 },
    { label: 'JUDEA',      x: 1180, y: 1070 },
    { label: 'JERUSALEM',  x: 1780, y: 1020 },
  ],
};
