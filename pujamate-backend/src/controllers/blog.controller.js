const { query } = require('../db/pool');

async function listBlogs(req, res) {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const result = await query(`
    SELECT b.id, b.title, b.content, b.cover_image_url, b.is_sample, b.puja_id,
           b.created_at, b.updated_at,
           u.name AS author_name, p.name AS puja_name
    FROM blog_posts b
    LEFT JOIN users u ON u.id = b.user_id
    LEFT JOIN pujas p ON p.id = b.puja_id
    ORDER BY b.created_at DESC
    LIMIT $1
  `, [limit]);
  res.json({ blogs: result.rows });
}

async function getBlog(req, res) {
  const result = await query(`
    SELECT b.id, b.title, b.content, b.cover_image_url, b.is_sample, b.puja_id,
           b.created_at, b.updated_at,
           u.name AS author_name, p.name AS puja_name
    FROM blog_posts b
    LEFT JOIN users u ON u.id = b.user_id
    LEFT JOIN pujas p ON p.id = b.puja_id
    WHERE b.id = $1
  `, [Number(req.params.id)]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Blog not found.' });
  res.json({ blog: result.rows[0] });
}

async function createBlog(req, res) {
  const { title, content, coverImageUrl, pujaId } = req.body;
  const cleanTitle = typeof title === 'string' ? title.trim().slice(0, 180) : '';
  const cleanContent = typeof content === 'string' ? content.trim() : '';
  if (!cleanTitle || !cleanContent) {
    return res.status(400).json({ error: 'Title and experience are required.' });
  }
  if (cleanContent.length > 12000) {
    return res.status(400).json({ error: 'Blog content must be 12,000 characters or less.' });
  }
  const id = pujaId ? Number(pujaId) : null;
  if (id) {
    const puja = await query('SELECT id FROM pujas WHERE id = $1', [id]);
    if (!puja.rows[0]) return res.status(400).json({ error: 'Puja not found.' });
  }
  const image = typeof coverImageUrl === 'string' ? coverImageUrl.trim().slice(0, 2000) : null;
  const result = await query(`
    INSERT INTO blog_posts (user_id, puja_id, title, content, cover_image_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, content, cover_image_url, puja_id, created_at
  `, [req.user.id, id || null, cleanTitle, cleanContent, image || null]);
  res.status(201).json({ blog: result.rows[0] });
}

module.exports = { listBlogs, getBlog, createBlog };
