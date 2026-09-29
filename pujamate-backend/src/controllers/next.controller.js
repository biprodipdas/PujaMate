const { query } = require('../db/pool');

/**
 * GET /next-pandal
 *
 * Personalised recommendation based on the user's visited history.
 * GPS is optional: when supplied, the nearest unvisited pandal is returned;
 * when omitted, the most recently visited pandal is used as the starting point.
 * This keeps "Next Pandal" dependent on actual user activity rather than a
 * made-up static recommendation.
 */
async function getNextPuja(req, res) {
  let lat = Number(req.query.lat);
  let lng = Number(req.query.lng);

  const hasValidGps = Number.isFinite(lat) && Number.isFinite(lng);

  if (!hasValidGps) {
    const lastVisited = await query(`
      SELECT p.latitude, p.longitude, p.name
      FROM visited_pujas vp
      JOIN pujas p ON p.id = vp.puja_id
      WHERE vp.user_id = $1
      ORDER BY vp.visited_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (!lastVisited.rows[0]) {
      return res.status(409).json({
        error: 'Visit a pandal first to unlock your personalised Next Pandal.',
        code: 'NO_VISITED_PANDAL',
      });
    }

    lat = Number(lastVisited.rows[0].latitude);
    lng = Number(lastVisited.rows[0].longitude);
  }

  const result = await query(`
    SELECT p.id, p.name, p.area, p.latitude, p.longitude,
           ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
           crowd.crowd_level AS current_crowd_level,
           crowd.created_at AS crowd_updated_at,
           (6371 * acos(LEAST(1, GREATEST(-1,
             cos(radians($1)) * cos(radians(p.latitude)) *
             cos(radians(p.longitude) - radians($2)) +
             sin(radians($1)) * sin(radians(p.latitude))
           )))) AS distance_km
    FROM pujas p
    LEFT JOIN reviews r ON r.puja_id = p.id
    LEFT JOIN visited_pujas v ON v.puja_id = p.id AND v.user_id = $3
    LEFT JOIN LATERAL (
      SELECT cr.crowd_level, cr.created_at
      FROM crowd_reports cr
      WHERE cr.puja_id = p.id AND cr.created_at > NOW() - INTERVAL '30 minutes'
      ORDER BY cr.created_at DESC LIMIT 1
    ) crowd ON TRUE
    WHERE v.id IS NULL
    GROUP BY p.id, crowd.crowd_level, crowd.created_at
    ORDER BY distance_km ASC, avg_rating DESC NULLS LAST, p.id ASC
    LIMIT 1
  `, [lat, lng, req.user.id]);

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'No unvisited pandal found.' });
  }

  res.json({
    puja: result.rows[0],
    origin: hasValidGps ? 'current_location' : 'last_visited_pandal',
  });
}

module.exports = { getNextPuja };
