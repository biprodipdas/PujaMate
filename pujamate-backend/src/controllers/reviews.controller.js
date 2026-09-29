const { query } = require('../db/pool');

/**
 * GET /pujas/:pujaId/reviews
 * Public review list for a puja.
 */
async function listReviews(req, res) {
  const { pujaId } = req.params;
  const result = await query(
    `SELECT r.id, r.puja_id, r.user_id, u.name AS user_name,
            r.rating, r.comment, r.created_at
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.puja_id = $1
     ORDER BY r.created_at DESC
     LIMIT 100`,
    [pujaId]
  );

  return res.json({ reviews: result.rows, count: result.rowCount });
}

/**
 * POST /pujas/:pujaId/reviews
 * Authenticated users can leave one review per puja.
 */
async function createReview(req, res) {
  const { pujaId } = req.params;
  const { rating, comment } = req.body;
  const parsedRating = Number(rating);

  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5.' });
  }
  if (comment !== undefined && comment !== null && typeof comment !== 'string') {
    return res.status(400).json({ error: 'comment must be a string.' });
  }

  const pujaResult = await query(`SELECT id FROM pujas WHERE id = $1`, [pujaId]);
  if (pujaResult.rowCount === 0) {
    return res.status(404).json({ error: 'Puja not found.' });
  }

  const existingReview = await query(
    `SELECT id FROM reviews WHERE puja_id = $1 AND user_id = $2`,
    [pujaId, req.user.id]
  );
  if (existingReview.rowCount > 0) {
    return res.status(409).json({ error: 'You have already reviewed this puja.' });
  }

  const result = await query(
    `INSERT INTO reviews (puja_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id, puja_id, user_id, rating, comment, created_at`,
    [pujaId, req.user.id, parsedRating, comment?.trim() || null]
  );

  return res.status(201).json({ review: result.rows[0] });
}

module.exports = { listReviews, createReview };