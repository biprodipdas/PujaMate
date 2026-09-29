const { query } = require('../db/pool');

const ALLOWED_REGIONS = ['KOLKATA', 'HOWRAH', 'SERAMPORE', 'CHANDANNAGAR', 'OTHER'];

async function createPandalSuggestion(req, res) {
  const { name, area, description = '', latitude, longitude, region = 'OTHER' } = req.body || {};
  if (!name || !area || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return res.status(400).json({ error: 'name, area, latitude and longitude are required.' });
  }
  const safeRegion = ALLOWED_REGIONS.includes(String(region).toUpperCase()) ? String(region).toUpperCase() : 'OTHER';
  const result = await query(`
    INSERT INTO pandal_suggestions (name, area, description, latitude, longitude, region, status)
    VALUES ($1::varchar, $2::varchar, $3::text, $4::double precision, $5::double precision, $6::varchar, 'PENDING')
    RETURNING id, name, area, latitude, longitude, region, status, created_at
  `, [String(name).trim(), String(area).trim(), String(description || '').trim(), Number(latitude), Number(longitude), safeRegion]);
  return res.status(201).json({ suggestion: result.rows[0], message: 'Pandal suggestion submitted for verification.' });
}

module.exports = { createPandalSuggestion };
