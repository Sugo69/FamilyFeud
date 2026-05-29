// Trail stop positions — Old Testament (2026 CFM)
// ──────────────────────────────────────────────────────────────────────────
// Board art: public/games/assets/scripture-trail-board-ot.png  (2000×1116)
// Trail runs lower-left → upper-right in a zigzag.
//
// 10 canonical positions cover the full trail at maximum density.
// getPositionsForCount() in trail-themes.js picks an evenly-distributed
// subset for any lesson with 7–10 stops.
//
// Positions 0,2,3,5,6,8,9 are the original 7-stop art positions.
// Positions 1,4,7 fill the three largest gaps for 8–10 stop lessons.
// Update all 10 when the board art is regenerated for 10-stop density.

export const THEME = {
  key: 'ot',
  boardSrc: '/games/assets/scripture-trail-board-ot.png',
  tokenStart: { x: 120, y: 820 },

  // 10 positions ordered start → finish along the trail
  positions: [
    { x:  230, y: 760 },  // 0  — trail start
    { x:  400, y: 790 },  // 1  — gap fill (between 0 and 2)
    { x:  570, y: 820 },  // 2
    { x:  740, y: 560 },  // 3  — high arc-break (Ruth → Hannah)
    { x:  935, y: 695 },  // 4  — gap fill (between 3 and 5)
    { x: 1130, y: 830 },  // 5
    { x: 1320, y: 710 },  // 6
    { x: 1410, y: 770 },  // 7  — gap fill (between 6 and 8)
    { x: 1500, y: 830 },  // 8
    { x: 1860, y: 550 },  // 9  — trail end
  ],

  regions: [
    { label: 'MOAB',      x:  120, y: 1020 },
    { label: 'BETHLEHEM', x:  560, y: 1070 },
    { label: 'SHILOH',    x: 1180, y: 1070 },
    { label: 'MIZPAH',    x: 1780, y: 1020 },
  ],
};
