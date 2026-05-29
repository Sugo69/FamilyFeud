// Trail theme registry — maps lesson IDs to board art + stop positions.
// Each theme lives in its own file; add new curricula by creating a new
// trail-positions-{key}.js and importing it here.

import { THEME as OT }       from './trail-positions-ot.js';
import { THEME as NT }       from './trail-positions-nt.js';
import { THEME as BOM }      from './trail-positions-bom.js';
import { THEME as DC }       from './trail-positions-dc.js';
import { THEME as MOSES }    from './trail-positions-moses.js';
import { THEME as ABRAHAM }  from './trail-positions-abraham.js';

export const TRAIL_THEMES = { ot: OT, nt: NT, bom: BOM, dc: DC, moses: MOSES, abraham: ABRAHAM };

// Derive a theme key from a lesson ID string.
export function resolveTrailTheme(lessonId = '') {
  const id = lessonId.toLowerCase();
  if (id.includes('new-testament') || id.includes('new_testament')) return 'nt';
  if (id.includes('book-of-mormon') || id.includes('book_of_mormon'))  return 'bom';
  if (id.includes('doctrine-and-covenants') || id.includes('doctrine_and_covenants')) return 'dc';
  if (id.includes('abraham')) return 'abraham';
  if (id.includes('moses'))   return 'moses';
  return 'ot'; // default — covers CFM OT and anything unrecognised
}

// Pick `count` stop positions evenly distributed across all positions in
// the theme. Ensures stops always span the full trail regardless of count.
// Works for any count between 1 and theme.positions.length.
export function getPositionsForCount(theme, count) {
  const all = theme.positions;
  if (count >= all.length) return all;
  if (count === 1) return [all[0]];
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(all[Math.round(i * (all.length - 1) / (count - 1))]);
  }
  return picks;
}
