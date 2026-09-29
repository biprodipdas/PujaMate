// src/controllers/emergency.controller.js
const { query } = require('../db/pool');

const VALID_CATEGORIES = ['POLICE', 'HOSPITAL', 'PHARMACY', 'FIRST_AID'];

// National/state emergency helplines (PRD 5.8 "Direct Dial Action").
// These are standard published numbers, not location-specific, so they're
// served as a static list rather than a DB row — always available even if
// the emergency_services table hasn't been populated for a given area yet.
const HELPLINES = [
  { id: 'police', label: 'Police', phone: '100' },
  { id: 'ambulance', label: 'Ambulance', phone: '102' },
  { id: 'disaster_management', label: 'Disaster Management', phone: '108' },
  { id: 'fire', label: 'Fire Services', phone: '101' },
  { id: 'women_helpline', label: "Women's Helpline", phone: '1091' },
  { id: 'child_helpline', label: 'Child Helpline', phone: '1098' },
  { id: 'national_emergency', label: 'National Emergency Number', phone: '112' },
];

/**
 * GET /emergency/helplines
 * Static, always-available quick-dial numbers.
 */
function getHelplines(req, res) {
  return res.json({ helplines: HELPLINES });
}

/**
 * GET /emergency/nearby
 * ?lat=&lng=&radiusKm=&category=
 * Returns verified emergency locations near a point. `verified` rows come
 * from the emergency_services table, which is expected to be populated
 * with locally confirmed data (see README) — this endpoint deliberately
 * does not fabricate or infer locations.
 */
async function getNearby(req, res) {
  const { lat, lng, radiusKm = 5, category } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required.' });
  }
  if (category && !VALID_CATEGORIES.includes(category.toUpperCase())) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  const params = [];
  params.push(Number(lat));
  const latParam = params.length;
  params.push(Number(lng));
  const lngParam = params.length;

  let categoryClause = '';
  if (category) {
    params.push(category.toUpperCase());
    categoryClause = `AND category = $${params.length}`;
  }

  params.push(Number(radiusKm));
  const radiusParam = params.length;

  // Distance computed once in the inner query; HAVING-without-GROUP-BY on a
  // plain (non-aggregate) column isn't valid SQL, so this filters in an outer
  // WHERE against the subquery's computed column instead.
  const sql = `
    SELECT * FROM (
      SELECT id, name, category, phone, area, latitude, longitude, verified,
        (6371 * acos(
          cos(radians($${latParam})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($${lngParam})) +
          sin(radians($${latParam})) * sin(radians(latitude))
        )) AS distance_km
      FROM emergency_services
      WHERE verified = TRUE
      ${categoryClause}
    ) sub
    WHERE distance_km <= $${radiusParam}
    ORDER BY distance_km ASC
    LIMIT 30
  `;

  const result = await query(sql, params);
  return res.json({ services: result.rows, count: result.rowCount });
}

/**
 * POST /emergency (Admin only)
 * Adds a verified emergency location. `verified` defaults to false so a
 * second admin/moderation step can confirm accuracy before it's surfaced
 * as trustworthy — this is safety-critical data.
 */
async function createEmergencyService(req, res) {
  const { name, category, phone, area, latitude, longitude, verified } = req.body;

  if (!name || !category || !phone || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'name, category, phone, latitude and longitude are required.' });
  }
  if (!VALID_CATEGORIES.includes(category.toUpperCase())) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  const result = await query(
    `INSERT INTO emergency_services (name, category, phone, area, latitude, longitude, verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, category.toUpperCase(), phone, area || null, latitude, longitude, !!verified]
  );

  return res.status(201).json({ service: result.rows[0] });
}

module.exports = { getHelplines, getNearby, createEmergencyService };
