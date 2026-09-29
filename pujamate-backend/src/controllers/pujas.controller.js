// src/controllers/pujas.controller.js
const { query } = require('../db/pool');

const VALID_TYPES = ['THEME', 'TRADITIONAL', 'BIG_BUDGET', 'AWARD_WINNING', 'FAMILY_FRIENDLY'];
const MAX_LIMIT = 500; // Metro/Bus route views need the full curated 2026 directory without depending on client GPS
const DEFAULT_LIMIT = 20;
const LIST_DESCRIPTION_CHARS = 160; // list/card view only needs a preview, not the full text

function parsePagination(limit, offset) {
  const parsedLimit = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const parsedOffset = Math.max(0, Number(offset) || 0);
  return { parsedLimit, parsedOffset };
}

/**
 * GET /pujas
 * Supports: ?search=&area=&type=&lat=&lng=&radiusKm=&limit=&offset=
 * Uses the Haversine formula for simple distance filtering (no PostGIS dependency).
 */
async function listPujas(req, res) {
  const { search, area, type, lat, lng, radiusKm, limit, offset } = req.query;
  const { parsedLimit, parsedOffset } = parsePagination(limit, offset);

  const conditions = [];
  const params = [];

  if (search) {
    // Requires pg_trgm + a GIN trigram index on name/description (see migrations.sql)
    // for ILIKE '%term%' to use an index instead of a full table scan.
    params.push(`%${search}%`);
    conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  if (area) {
    params.push(area);
    conditions.push(`p.area ILIKE $${params.length}`);
  }
  if (type) {
    if (!VALID_TYPES.includes(type.toUpperCase())) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }
    params.push(type.toUpperCase());
    conditions.push(`p.pujo_type = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let sql;
  if (lat && lng) {
    // Distance is computed once in an inner query, then filtered/sorted in the
    // outer query — Postgres can't reference a SELECT-list alias in WHERE, and
    // faking that with GROUP BY on a non-aggregate, single-table query (the
    // previous approach) forces an unnecessary sort/hash step on every request.
    params.push(Number(lat));
    const latParam = params.length;
    params.push(Number(lng));
    const lngParam = params.length;

    let radiusClause = '';
    if (radiusKm) {
      params.push(Number(radiusKm));
      radiusClause = `WHERE distance_km <= $${params.length}`;
    }

    params.push(parsedLimit);
    const limitParam = params.length;
    params.push(parsedOffset);
    const offsetParam = params.length;

    sql = `
      SELECT * FROM (
        SELECT p.id, p.name, LEFT(p.description, ${LIST_DESCRIPTION_CHARS}) AS description,
               p.area, p.latitude, p.longitude, p.pujo_type, p.facilities, p.created_at,
               crowd.crowd_level AS current_crowd_level,
               crowd.created_at AS crowd_updated_at,
               (6371 * acos(
                 cos(radians($${latParam})) * cos(radians(p.latitude)) *
                 cos(radians(p.longitude) - radians($${lngParam})) +
                 sin(radians($${latParam})) * sin(radians(p.latitude))
               )) AS distance_km
        FROM pujas p
        LEFT JOIN LATERAL (
          SELECT cr.crowd_level, cr.created_at
          FROM crowd_reports cr
          WHERE cr.puja_id = p.id
            AND cr.created_at > NOW() - INTERVAL '30 minutes'
          ORDER BY cr.created_at DESC
          LIMIT 1
        ) crowd ON TRUE
        ${whereClause}
      ) sub
      ${radiusClause}
      ORDER BY distance_km ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
  } else {
    params.push(parsedLimit);
    const limitParam = params.length;
    params.push(parsedOffset);
    const offsetParam = params.length;

    sql = `
      SELECT p.id, p.name, LEFT(p.description, ${LIST_DESCRIPTION_CHARS}) AS description,
             p.area, p.latitude, p.longitude, p.pujo_type, p.facilities, p.created_at,
             crowd.crowd_level AS current_crowd_level,
             crowd.created_at AS crowd_updated_at
      FROM pujas p
      LEFT JOIN LATERAL (
        SELECT cr.crowd_level, cr.created_at
        FROM crowd_reports cr
        WHERE cr.puja_id = p.id
          AND cr.created_at > NOW() - INTERVAL '30 minutes'
        ORDER BY cr.created_at DESC
        LIMIT 1
      ) crowd ON TRUE
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
  }

  const result = await query(sql, params);
  return res.json({ pujas: result.rows, count: result.rowCount });
}

/**
 * GET /pujas/:id
 * Returns pandal detail including average rating and current crowd level.
 */
async function getPujaById(req, res) {
  const { id } = req.params;

  const pujaResult = await query(`SELECT * FROM pujas WHERE id = $1`, [id]);
  const puja = pujaResult.rows[0];
  if (!puja) {
    return res.status(404).json({ error: 'Puja not found.' });
  }

  const ratingResult = await query(
    `SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS review_count
     FROM reviews WHERE puja_id = $1`,
    [id]
  );

  const crowdResult = await query(
    `SELECT crowd_level, created_at FROM crowd_reports
     WHERE puja_id = $1 AND created_at > NOW() - INTERVAL '30 minutes'
     ORDER BY created_at DESC LIMIT 1`,
    [id]
  );

  return res.json({
    puja,
    rating: ratingResult.rows[0],
    currentCrowdLevel: crowdResult.rows[0]?.crowd_level || 'UNKNOWN',
  });
}

/**
 * POST /pujas (Admin only — enforced via requireRole middleware on the route)
 */
async function createPuja(req, res) {
  const { name, description, area, latitude, longitude, pujo_type, facilities } = req.body;

  if (!name || !area || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'name, area, latitude and longitude are required.' });
  }
  if (pujo_type && !VALID_TYPES.includes(pujo_type.toUpperCase())) {
    return res.status(400).json({ error: `pujo_type must be one of: ${VALID_TYPES.join(', ')}` });
  }

  const result = await query(
    `INSERT INTO pujas (name, description, area, latitude, longitude, pujo_type, facilities)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name,
      description || null,
      area,
      latitude,
      longitude,
      (pujo_type || 'THEME').toUpperCase(),
      facilities ? JSON.stringify(facilities) : '{}',
    ]
  );

  return res.status(201).json({ puja: result.rows[0] });
}

// Facilities are stored on each puja as a JSONB blob, e.g.:
// { "toilet": true, "seniorSeating": true, "parking": false,
//   "medical": true, "metro": { "name": "Rabindra Sadan", "distanceMeters": 350 } }
const BOOLEAN_FACILITY_TYPES = ['toilet', 'seniorSeating', 'parking', 'medical'];
const OBJECT_FACILITY_TYPES = ['metro']; // presence-of-key rather than boolean
const VALID_FACILITY_TYPES = [...BOOLEAN_FACILITY_TYPES, ...OBJECT_FACILITY_TYPES];

/**
 * GET /pujas/facilities
 * Supports: ?types=toilet,medical,parking,metro,seniorSeating&area=&lat=&lng=&radiusKm=
 * Returns pandals that have AT LEAST ONE of the requested facility types
 * (an OR, not an AND) — matches a toggle-based map overlay where turning
 * on "Toilet" and "Medical" should show pins with either.
 */
async function listFacilities(req, res) {
  const { types, area, lat, lng, radiusKm } = req.query;

  if (!types) {
    return res.status(400).json({
      error: `types query param is required (comma-separated, any of: ${VALID_FACILITY_TYPES.join(', ')})`,
    });
  }

  const requestedTypes = types.split(',').map((t) => t.trim()).filter(Boolean);
  const invalidTypes = requestedTypes.filter((t) => !VALID_FACILITY_TYPES.includes(t));
  if (invalidTypes.length) {
    return res.status(400).json({ error: `Invalid facility types: ${invalidTypes.join(', ')}` });
  }

  const conditions = [];
  const params = [];

  // Uses jsonb containment (@>) and key-existence (?) operators rather than
  // ->> casts, so this can be served by a GIN index on the facilities column
  // (see idx_pujas_facilities_gin in migrations.sql) instead of a full scan.
  const facilityOrClauses = requestedTypes.map((type) => {
    if (OBJECT_FACILITY_TYPES.includes(type)) {
      return `p.facilities ? '${type}'`;
    }
    return `p.facilities @> '{"${type}": true}'::jsonb`;
  });
  conditions.push(`(${facilityOrClauses.join(' OR ')})`);

  if (area) {
    params.push(area);
    conditions.push(`p.area ILIKE $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  let sql;
  if (lat && lng) {
    params.push(Number(lat));
    const latParam = params.length;
    params.push(Number(lng));
    const lngParam = params.length;

    let radiusClause = '';
    if (radiusKm) {
      params.push(Number(radiusKm));
      radiusClause = `WHERE distance_km <= $${params.length}`;
    }

    sql = `
      SELECT * FROM (
        SELECT p.id, p.name, p.area, p.latitude, p.longitude, p.facilities,
               (6371 * acos(
                 cos(radians($${latParam})) * cos(radians(p.latitude)) *
                 cos(radians(p.longitude) - radians($${lngParam})) +
                 sin(radians($${latParam})) * sin(radians(p.latitude))
               )) AS distance_km
        FROM pujas p
        LEFT JOIN LATERAL (
          SELECT cr.crowd_level, cr.created_at
          FROM crowd_reports cr
          WHERE cr.puja_id = p.id
            AND cr.created_at > NOW() - INTERVAL '30 minutes'
          ORDER BY cr.created_at DESC
          LIMIT 1
        ) crowd ON TRUE
        ${whereClause}
      ) sub
      ${radiusClause}
      ORDER BY distance_km ASC
      LIMIT 100
    `;
  } else {
    sql = `
      SELECT p.id, p.name, p.area, p.latitude, p.longitude, p.facilities
      FROM pujas p
      ${whereClause}
      ORDER BY p.name ASC
      LIMIT 100
    `;
  }

  const result = await query(sql, params);
  return res.json({ pujas: result.rows, count: result.rowCount });
}

module.exports = { listPujas, getPujaById, createPuja, listFacilities };
