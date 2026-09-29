const { query } = require('../db/pool');

async function listPosts(req, res) {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 24));
  const result = await query(`
    SELECT pp.id, pp.image_url, pp.caption, pp.puja_id, pp.created_at,
           u.id AS user_id, u.name AS user_name,
           p.name AS puja_name
    FROM photo_posts pp
    JOIN users u ON u.id = pp.user_id
    LEFT JOIN pujas p ON p.id = pp.puja_id
    ORDER BY pp.created_at DESC
    LIMIT $1`, [limit]);
  res.json({ posts: result.rows });
}

async function createPost(req, res) {
  const { imageUrl, caption, pujaId } = req.body;
  if (!imageUrl || typeof imageUrl !== 'string') return res.status(400).json({ error: 'imageUrl is required.' });
  if (imageUrl.length > 2000) return res.status(400).json({ error: 'imageUrl is too long.' });
  const cleanCaption = typeof caption === 'string' ? caption.trim().slice(0, 280) : null;
  const id = pujaId ? Number(pujaId) : null;
  if (id) {
    const puja = await query('SELECT id FROM pujas WHERE id = $1', [id]);
    if (!puja.rows[0]) return res.status(400).json({ error: 'Puja not found.' });
  }
  const result = await query(`
    INSERT INTO photo_posts (user_id, puja_id, image_url, caption)
    VALUES ($1, $2, $3, $4)
    RETURNING id, image_url, caption, puja_id, created_at`, [req.user.id, id || null, imageUrl, cleanCaption]);
  res.status(201).json({ post: result.rows[0] });
}

module.exports = { listPosts, createPost };
