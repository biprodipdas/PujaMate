// src/utils/badges.js
// Achievement rules for the Puja Passport (PRD 5.4). Badges are computed
// on the fly from visited_pujas + pujas rather than stored, since they're
// a pure derived view of check-in history — no schema changes needed.

const NIGHT_HOPPER_THRESHOLD = 3; // check-ins between 8pm–2am
const THEME_HUNTER_THRESHOLD = 5; // THEME-type pandals visited
const MILESTONE_COUNT = 10; // total pandals visited

/**
 * @param {Array} visitedRows - rows from visited_pujas JOIN pujas, each with
 *   { area, pujo_type, visited_at } for the current user.
 * @param {Array} zoneProgress - [{ area, totalPujas, visitedCount, percent }]
 * @returns {Array<{ id, title, description, unlocked }>}
 */
function computeBadges(visitedRows, zoneProgress) {
  const totalVisited = visitedRows.length;

  const nightHops = visitedRows.filter((row) => {
    const hour = new Date(row.visited_at).getHours();
    return hour >= 20 || hour < 2;
  }).length;

  const themeVisits = visitedRows.filter((row) => row.pujo_type === 'THEME').length;

  const badges = [
    {
      id: 'ten_pujas_completed',
      title: '10 Pujas Completed',
      description: `Check in at 10 different pandals (${Math.min(totalVisited, MILESTONE_COUNT)}/${MILESTONE_COUNT}).`,
      unlocked: totalVisited >= MILESTONE_COUNT,
    },
    {
      id: 'night_pandal_hopper',
      title: 'Night Pandal Hopper',
      description: `Check in at ${NIGHT_HOPPER_THRESHOLD} pandals between 8 PM and 2 AM (${Math.min(nightHops, NIGHT_HOPPER_THRESHOLD)}/${NIGHT_HOPPER_THRESHOLD}).`,
      unlocked: nightHops >= NIGHT_HOPPER_THRESHOLD,
    },
    {
      id: 'theme_hunter',
      title: 'Theme Hunter',
      description: `Check in at ${THEME_HUNTER_THRESHOLD} Theme Puja pandals (${Math.min(themeVisits, THEME_HUNTER_THRESHOLD)}/${THEME_HUNTER_THRESHOLD}).`,
      unlocked: themeVisits >= THEME_HUNTER_THRESHOLD,
    },
  ];

  // One "<Zone> Explorer" badge per zone that has at least one pandal,
  // unlocked at 100% completion for that zone.
  for (const zone of zoneProgress) {
    badges.push({
      id: `zone_explorer_${zone.area.toLowerCase().replace(/\s+/g, '_')}`,
      title: `${zone.area} Explorer`,
      description: `Visit every pandal in ${zone.area} (${zone.visitedCount}/${zone.totalPujas}).`,
      unlocked: zone.totalPujas > 0 && zone.visitedCount >= zone.totalPujas,
    });
  }

  return badges;
}

module.exports = { computeBadges, NIGHT_HOPPER_THRESHOLD, THEME_HUNTER_THRESHOLD, MILESTONE_COUNT };
