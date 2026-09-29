// src/controllers/crowd.controller.js
const { query } = require('../db/pool');
const { notifyPujaSubscribers } = require('./notifications.controller');

const LEVEL_WEIGHT = { LOW: 1, MODERATE: 2, HEAVY: 3 };
const WEIGHT_TO_LEVEL = ['LOW', 'LOW', 'MODERATE', 'HEAVY']; // index by rounded weight (1-3)

/**
 * POST /crowd/:pujaId  ("I'm here" report)
 */
async function submitCrowdReport(req, res) {
  const { pujaId } = req.params;
  const { crowd_level } = req.body;

  if (!['LOW', 'MODERATE', 'HEAVY'].includes((crowd_level || '').toUpperCase())) {
    return res.status(400).json({ error: 'crowd_level must be LOW, MODERATE, or HEAVY.' });
  }

  const pujaExists = await query(`SELECT id FROM pujas WHERE id = $1`, [pujaId]);
  if (pujaExists.rowCount === 0) {
    return res.status(404).json({ error: 'Puja not found.' });
  }

  const result = await query(
    `INSERT INTO crowd_reports (puja_id, user_id, crowd_level)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [pujaId, req.user.id, crowd_level.toUpperCase()]
  );

  const puja = await query(`SELECT name FROM pujas WHERE id = $1`, [pujaId]);
  notifyPujaSubscribers(
    Number(pujaId),
    'PujaMate Crowd Update',
    `${puja.rows[0]?.name || 'This Puja'} is now reported as ${crowd_level.toUpperCase()}.`
  ).catch(() => {});

  return res.status(201).json({ report: result.rows[0] });
}

/**
 * GET /crowd/:pujaId
 * Time-decay scoring: reports older than 60 minutes are ignored entirely.
 * Reports within the last 15 minutes carry full weight; reports between
 * 15-60 minutes decay linearly to near-zero influence.
 */
async function getCrowdStatus(req, res) {
  const { pujaId } = req.params;

  const result = await query(
    `SELECT crowd_level, created_at,
            EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS age_minutes
     FROM crowd_reports
     WHERE puja_id = $1 AND created_at > NOW() - INTERVAL '60 minutes'
     ORDER BY created_at DESC`,
    [pujaId]
  );

  if (result.rowCount === 0) {
    return res.json({ crowdLevel: 'UNKNOWN', estimatedWaitMinutes: null, sampleSize: 0 });
  }

  let weightedSum = 0;
  let weightTotal = 0;

  for (const row of result.rows) {
    const ageMinutes = Number(row.age_minutes);
    // Full weight for <=15 min old, linear decay to 0 by 60 min
    const decayFactor = ageMinutes <= 15 ? 1 : Math.max(0, 1 - (ageMinutes - 15) / 45);
    const levelWeight = LEVEL_WEIGHT[row.crowd_level];
    weightedSum += levelWeight * decayFactor;
    weightTotal += decayFactor;
  }

  const avgWeight = weightTotal > 0 ? weightedSum / weightTotal : 0;
  const roundedWeight = Math.min(3, Math.max(1, Math.round(avgWeight)));
  const crowdLevel = WEIGHT_TO_LEVEL[roundedWeight];

  // Rough estimated wait time heuristic, tunable per business logic
  const estimatedWaitMinutes = Math.round(roundedWeight * 20 * Math.min(1, weightTotal / 3));

  return res.json({
    crowdLevel,
    estimatedWaitMinutes,
    sampleSize: result.rowCount,
  });
}

module.exports = { submitCrowdReport, getCrowdStatus };
