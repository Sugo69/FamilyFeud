// Trail stop positions — Book of Mormon
// STUB — replace boardSrc, positions, and regions when BOM board art lands.

export const THEME = {
  key: 'bom',
  boardSrc: '/games/assets/scripture-trail-board-ot.png', // ← swap to -bom.png
  tokenStart: { x: 120, y: 820 },
  positions: [
    { x:  230, y: 760 }, { x:  400, y: 790 }, { x:  570, y: 820 },
    { x:  740, y: 560 }, { x:  935, y: 695 }, { x: 1130, y: 830 },
    { x: 1320, y: 710 }, { x: 1410, y: 770 }, { x: 1500, y: 830 },
    { x: 1860, y: 550 },
  ],
  regions: [
    { label: 'JERUSALEM',  x:  120, y: 1020 },
    { label: 'WILDERNESS', x:  560, y: 1070 },
    { label: 'PROMISED',   x: 1180, y: 1070 },
    { label: 'LAND',       x: 1780, y: 1020 },
  ],
};
