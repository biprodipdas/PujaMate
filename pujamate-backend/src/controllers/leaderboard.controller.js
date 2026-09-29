const { query } = require('../db/pool');

async function getLeaderboard(req, res) {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const result = await query(
    `SELECT u.id, u.name, COUNT(v.id)::int AS visited_count
     FROM users u
     LEFT JOIN visited_pujas v ON v.user_id = u.id
     WHERE u.role = 'USER'
     GROUP BY u.id, u.name
     ORDER BY visited_count DESC, u.name ASC
     LIMIT $1`,
    [limit]
  );

  return res.json({
    leaderboard: result.rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      visitedCount: row.visited_count,
    })),
  });
}

module.exports = { getLeaderboard };
