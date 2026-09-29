const { query } = require('../db/pool');
const { haversineDistanceMeters } = require('../utils/geo');

const WALK_SPEED_KMPH = 4.5;
const DRIVE_SPEED_KMPH = 20;
const CYCLE_SPEED_KMPH = 12;
const TRANSIT_SPEED_KMPH = 18;
const DEFAULT_VISIT_MINUTES = 45;
const DEFAULT_TIME_WINDOW_MINUTES = 240;
const CANDIDATE_POOL_SIZE = 8;

function pickTransitMode(distanceKm, walkingPreference, travelMode) {
  if (travelMode === 'DRIVING') return 'DRIVING';
  if (travelMode === 'CYCLING') return 'CYCLING';
  if (travelMode === 'TRANSIT') return distanceKm <= 1.5 ? 'WALKING' : 'TRANSIT';
  const threshold = walkingPreference === 'LESS_WALKING' ? 0.6 : 2.5;
  if (distanceKm <= threshold) return 'WALKING';
  if (distanceKm <= 6) return 'TRANSIT';
  return 'DRIVING';
}

function speedFor(mode) {
  if (mode === 'DRIVING') return DRIVE_SPEED_KMPH;
  if (mode === 'CYCLING') return CYCLE_SPEED_KMPH;
  if (mode === 'TRANSIT') return TRANSIT_SPEED_KMPH;
  return WALK_SPEED_KMPH;
}

function orderCandidates(candidates, start, smartOrder) {
  if (!smartOrder) return [...candidates];
  const remaining = [...candidates];
  const ordered = [];
  let current = start;
  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < remaining.length; i += 1) {
      const d = haversineDistanceMeters(current.latitude, current.longitude, Number(remaining[i].latitude), Number(remaining[i].longitude));
      if (d < bestDistance) { bestDistance = d; bestIndex = i; }
    }
    const [picked] = remaining.splice(bestIndex, 1);
    ordered.push(picked);
    current = { latitude: Number(picked.latitude), longitude: Number(picked.longitude) };
  }
  return ordered;
}

/**
 * POST /planner/generate
 * Supports explicit Start -> Stops -> End, manual order, smart order and
 * round-trip. Coordinates are used for a reliable server-side estimate;
 * the frontend can additionally draw a road-following Mapbox route.
 */
async function generateRoute(req, res) {
  const {
    startLat, startLng, startName = 'Start',
    endLat = null, endLng = null, endName = null,
    timeWindowMinutes = DEFAULT_TIME_WINDOW_MINUTES,
    walkingPreference = 'HIGH_MOBILITY',
    visitDurationMinutes = DEFAULT_VISIT_MINUTES,
    budget = null,
    pujaIds,
    stopIds,
    travelMode = 'WALKING',
    smartOrder = true,
    roundTrip = false,
  } = req.body || {};

  if (startLat === undefined || startLng === undefined) return res.status(400).json({ error: 'startLat and startLng are required.' });
  if (!['LESS_WALKING', 'HIGH_MOBILITY'].includes(walkingPreference)) return res.status(400).json({ error: 'walkingPreference must be LESS_WALKING or HIGH_MOBILITY.' });
  if (!['WALKING', 'DRIVING', 'CYCLING', 'TRANSIT'].includes(travelMode)) return res.status(400).json({ error: 'travelMode must be WALKING, DRIVING, CYCLING or TRANSIT.' });
  if (budget !== null && budget !== '' && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) return res.status(400).json({ error: 'budget must be a non-negative number.' });

  const requestedIds = Array.isArray(stopIds) && stopIds.length ? stopIds : (Array.isArray(pujaIds) ? pujaIds : []);
  let candidates;
  if (requestedIds.length) {
    const result = await query(`SELECT id, name, area, latitude, longitude, pujo_type, facilities FROM pujas WHERE id = ANY($1::int[])`, [requestedIds]);
    const byId = new Map(result.rows.map((row) => [Number(row.id), row]));
    candidates = requestedIds.map((id) => byId.get(Number(id))).filter(Boolean);
  } else {
    const result = await query(`
      SELECT id, name, area, latitude, longitude, pujo_type, facilities,
        (6371 * acos(GREATEST(-1, LEAST(1,
          cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )))) AS distance_km
      FROM pujas ORDER BY distance_km ASC LIMIT $3
    `, [Number(startLat), Number(startLng), CANDIDATE_POOL_SIZE]);
    candidates = result.rows;
  }

  if (!candidates.length) return res.status(404).json({ error: 'No pandals found to build a route from.' });

  const ordered = orderCandidates(candidates, { latitude: Number(startLat), longitude: Number(startLng) }, Boolean(smartOrder));
  let current = { latitude: Number(startLat), longitude: Number(startLng) };
  let cumulativeMinutes = 0;
  const stops = [];
  const remaining = [...ordered];

  while (remaining.length) {
    const candidate = remaining.shift();
    const distanceKm = haversineDistanceMeters(current.latitude, current.longitude, Number(candidate.latitude), Number(candidate.longitude)) / 1000;
    const transitMode = pickTransitMode(distanceKm, walkingPreference, travelMode);
    const transitMinutes = Math.max(1, Math.round((distanceKm / speedFor(transitMode)) * 60));
    const projected = cumulativeMinutes + transitMinutes + Number(visitDurationMinutes);
    if (projected > Number(timeWindowMinutes) && stops.length) break;
    stops.push({
      pujaId: candidate.id, name: candidate.name, area: candidate.area,
      latitude: Number(candidate.latitude), longitude: Number(candidate.longitude),
      pujoType: candidate.pujo_type, facilities: candidate.facilities || {},
      transitMode, transitMinutes, visitMinutes: Number(visitDurationMinutes),
      distanceFromPreviousKm: Number(distanceKm.toFixed(2)),
      arrivalMinutesFromStart: cumulativeMinutes + transitMinutes,
    });
    cumulativeMinutes = projected;
    current = { latitude: Number(candidate.latitude), longitude: Number(candidate.longitude) };
    if (cumulativeMinutes >= Number(timeWindowMinutes)) break;
  }

  const hasEnd = Number.isFinite(Number(endLat)) && Number.isFinite(Number(endLng));
  let end = hasEnd ? { name: endName || 'Destination', latitude: Number(endLat), longitude: Number(endLng) } : null;
  if (roundTrip) end = { name: startName || 'Start', latitude: Number(startLat), longitude: Number(startLng), roundTrip: true };
  let endLeg = null;
  if (end && stops.length) {
    const d = haversineDistanceMeters(current.latitude, current.longitude, end.latitude, end.longitude) / 1000;
    const mode = pickTransitMode(d, walkingPreference, travelMode);
    endLeg = { transitMode: mode, distanceKm: Number(d.toFixed(2)), transitMinutes: Math.max(1, Math.round((d / speedFor(mode)) * 60)) };
  }

  return res.json({
    start: { name: startName, latitude: Number(startLat), longitude: Number(startLng) },
    stops,
    end,
    endLeg,
    roundTrip: Boolean(roundTrip),
    travelMode,
    smartOrder: Boolean(smartOrder),
    totalMinutes: cumulativeMinutes + (endLeg?.transitMinutes || 0),
    timeWindowMinutes: Number(timeWindowMinutes),
    walkingPreference,
    budget: budget === '' || budget === null ? null : Number(budget),
    unableToFit: remaining.map((r) => ({ pujaId: r.id, name: r.name, area: r.area })),
  });
}

module.exports = { generateRoute, generateAIPlan };

async function generateAIPlan(req, res) {
  const {
    startLat,
    startLng,
    timeWindowMinutes = 300,
    visitDurationMinutes = 45,
    vibe = 'BALANCED',
    maxStops = 5,
  } = req.body || {};

  if (startLat === undefined || startLng === undefined) {
    return res.status(400).json({ error: 'startLat and startLng are required.' });
  }
  const allowedVibes = ['BALANCED', 'LOW_CROWD', 'TOP_RATED', 'TRADITIONAL', 'THEME'];
  if (!allowedVibes.includes(vibe)) return res.status(400).json({ error: `vibe must be one of: ${allowedVibes.join(', ')}` });

  const result = await query(
    `SELECT p.id, p.name, p.area, p.latitude, p.longitude, p.pujo_type,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.id)::int AS review_count,
            COALESCE((
              SELECT cr.crowd_level FROM crowd_reports cr
              WHERE cr.puja_id = p.id AND cr.created_at > NOW() - INTERVAL '60 minutes'
              ORDER BY cr.created_at DESC LIMIT 1
            ), 'UNKNOWN') AS crowd_level,
            (6371 * acos(
              cos(radians($1)) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(p.latitude))
            )) AS distance_km
     FROM pujas p
     LEFT JOIN reviews r ON r.puja_id = p.id
     GROUP BY p.id
     ORDER BY distance_km ASC
     LIMIT 30`,
    [Number(startLat), Number(startLng)]
  );

  const crowdPenalty = { LOW: 0, MODERATE: 0.12, HEAVY: 0.28, UNKNOWN: 0.05 };
  const ranked = result.rows.map((p) => {
    const ratingScore = Number(p.avg_rating) / 5;
    const distanceScore = Math.max(0, 1 - Number(p.distance_km) / 12);
    const crowdScore = 1 - (crowdPenalty[p.crowd_level] ?? 0.05);
    let vibeScore = 0.5;
    if (vibe === 'LOW_CROWD') vibeScore = crowdScore;
    if (vibe === 'TOP_RATED') vibeScore = ratingScore;
    if (vibe === 'TRADITIONAL') vibeScore = p.pujo_type === 'TRADITIONAL' ? 1 : 0.25;
    if (vibe === 'THEME') vibeScore = p.pujo_type === 'THEME' ? 1 : 0.25;
    const score = ratingScore * 0.38 + distanceScore * 0.27 + vibeScore * 0.25 + crowdScore * 0.10;
    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  const stops = [];
  let current = { latitude: Number(startLat), longitude: Number(startLng) };
  let totalMinutes = 0;
  const limit = Math.min(8, Math.max(1, Number(maxStops) || 5));

  while (ranked.length && stops.length < limit) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < ranked.length; i++) {
      const distance = haversineDistanceMeters(current.latitude, current.longitude, Number(ranked[i].latitude), Number(ranked[i].longitude));
      const adjusted = distance * (1 + (1 - ranked[i].score) * 0.35);
      if (adjusted < bestDistance) { bestDistance = adjusted; bestIndex = i; }
    }
    const candidate = ranked.splice(bestIndex, 1)[0];
    const distanceKm = haversineDistanceMeters(current.latitude, current.longitude, Number(candidate.latitude), Number(candidate.longitude)) / 1000;
    const transitMinutes = Math.max(1, Math.round((distanceKm / 4.5) * 60));
    const projected = totalMinutes + transitMinutes + Number(visitDurationMinutes);
    if (projected > Number(timeWindowMinutes) && stops.length) break;
    stops.push({
      pujaId: candidate.id,
      name: candidate.name,
      area: candidate.area,
      latitude: Number(candidate.latitude),
      longitude: Number(candidate.longitude),
      pujoType: candidate.pujo_type,
      rating: Number(candidate.avg_rating || 0),
      crowdLevel: candidate.crowd_level,
      distanceFromPreviousKm: Number(distanceKm.toFixed(2)),
      transitMinutes,
      visitMinutes: Number(visitDurationMinutes),
      arrivalMinutesFromStart: totalMinutes + transitMinutes,
    });
    totalMinutes = projected;
    current = { latitude: Number(candidate.latitude), longitude: Number(candidate.longitude) };
  }

  return res.json({
    plan: {
      title: 'Your AI Puja Plan',
      vibe,
      stops,
      totalMinutes,
      timeWindowMinutes: Number(timeWindowMinutes),
      summary: stops.length
        ? `A ${vibe.toLowerCase().replace('_', ' ')} route built from nearby pandals, ratings and recent crowd signals.`
        : 'No route could fit inside your selected time window.',
    },
  });
}

module.exports.generateAIPlan = generateAIPlan;
