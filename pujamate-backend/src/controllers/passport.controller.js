// src/controllers/passport.controller.js
const { query } = require('../db/pool');
const { haversineDistanceMeters } = require('../utils/geo');
const { computeBadges } = require('../utils/badges');

// How close (in meters) a user must be to a pandal's registered
// coordinates to be allowed to check in. Tune per GPS accuracy in the field.
const GEOFENCE_RADIUS_METERS = Number(process.env.GEOFENCE_RADIUS_METERS || 200);

/**
 * Shared helper: fetch a user's visited pandals (with area/type/time)
 * and derive zone progress from it. Used by multiple endpoints below.
 */
async function getVisitedAndZoneProgress(userId) {
  const visitedResult = await query(
    `SELECT vp.puja_id, vp.visited_at, p.name, p.area, p.pujo_type
     FROM visited_pujas vp
     JOIN pujas p ON p.id = vp.puja_id
     WHERE vp.user_id = $1
     ORDER BY vp.visited_at DESC`,
    [userId]
  );

  const zoneResult = await query(
    `SELECT p.area,
            COUNT(DISTINCT p.id) AS total_pujas,
            COUNT(DISTINCT vp.puja_id) FILTER (WHERE vp.user_id = $1) AS visited_count
     FROM pujas p
     LEFT JOIN visited_pujas vp ON vp.puja_id = p.id AND vp.user_id = $1
     GROUP BY p.area
     ORDER BY p.area`,
    [userId]
  );

  const zoneProgress = zoneResult.rows.map((row) => {
    const total = Number(row.total_pujas);
    const visited = Number(row.visited_count);
    return {
      area: row.area,
      totalPujas: total,
      visitedCount: visited,
      percent: total > 0 ? Math.round((visited / total) * 100) : 0,
    };
  });

  return { visitedRows: visitedResult.rows, zoneProgress };
}

/**
 * GET /passport
 * Full passport view: visited pandals, zone progress, and badges —
 * everything the Passport page needs in one call.
 */
async function getPassport(req, res) {
  const { visitedRows, zoneProgress } = await getVisitedAndZoneProgress(req.user.id);
  const badges = computeBadges(visitedRows, zoneProgress);

  return res.json({
    visited: visitedRows.map((row) => ({
      pujaId: row.puja_id,
      name: row.name,
      area: row.area,
      pujoType: row.pujo_type,
      visitedAt: row.visited_at,
    })),
    zoneProgress,
    badges,
  });
}

/**
 * POST /passport/checkin
 * body: { pujaId, latitude, longitude }
 * Geofenced "I'm Here" check-in. Rejects if the submitted coordinates
 * are farther than GEOFENCE_RADIUS_METERS from the pandal's registered
 * location. Returns any badges newly unlocked by this check-in so the
 * frontend can trigger the spring "unlock" animation only for those.
 */
async function checkIn(req, res) {
  const { pujaId, latitude, longitude } = req.body;

  if (!pujaId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'pujaId, latitude and longitude are required.' });
  }

  const pujaResult = await query(
    `SELECT id, name, area, pujo_type, latitude, longitude FROM pujas WHERE id = $1`,
    [pujaId]
  );
  const puja = pujaResult.rows[0];
  if (!puja) {
    return res.status(404).json({ error: 'Puja not found.' });
  }

  const distanceMeters = haversineDistanceMeters(
    Number(latitude),
    Number(longitude),
    Number(puja.latitude),
    Number(puja.longitude)
  );

  if (distanceMeters > GEOFENCE_RADIUS_METERS) {
    return res.status(403).json({
      error: `You're too far from ${puja.name} to check in.`,
      distanceMeters: Math.round(distanceMeters),
      requiredRadiusMeters: GEOFENCE_RADIUS_METERS,
    });
  }

  // Badges "before" this check-in, so we can diff against "after"
  const before = await getVisitedAndZoneProgress(req.user.id);
  const badgesBefore = computeBadges(before.visitedRows, before.zoneProgress);
  const unlockedBefore = new Set(badgesBefore.filter((b) => b.unlocked).map((b) => b.id));

  const insertResult = await query(
    `INSERT INTO visited_pujas (user_id, puja_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, puja_id) DO NOTHING
     RETURNING id, visited_at`,
    [req.user.id, pujaId]
  );

  const alreadyCheckedIn = insertResult.rowCount === 0;

  const after = await getVisitedAndZoneProgress(req.user.id);
  const badgesAfter = computeBadges(after.visitedRows, after.zoneProgress);
  const newlyUnlocked = badgesAfter.filter((b) => b.unlocked && !unlockedBefore.has(b.id));

  return res.status(alreadyCheckedIn ? 200 : 201).json({
    checkedIn: true,
    alreadyCheckedIn,
    puja: { id: puja.id, name: puja.name, area: puja.area },
    distanceMeters: Math.round(distanceMeters),
    zoneProgress: after.zoneProgress,
    newlyUnlockedBadges: newlyUnlocked,
  });
}

module.exports = { getPassport, checkIn };
