const { query } = require('../db/pool');

async function createGroup(req, res) {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Group name is required.' });

  const result = await query(
    `INSERT INTO friend_groups (owner_id, name, plan)
     VALUES ($1, $2, $3)
     RETURNING id, owner_id, name, plan, created_at, updated_at`,
    [req.user.id, name, JSON.stringify({ pujaIds: [], stops: [] })]
  );
  const group = result.rows[0];
  await query(
    `INSERT INTO friend_group_members (group_id, user_id) VALUES ($1, $2)
     ON CONFLICT (group_id, user_id) DO NOTHING`,
    [group.id, req.user.id]
  );
  return res.status(201).json({ group });
}

async function listGroups(req, res) {
  const result = await query(
    `SELECT g.id, g.name, g.plan, g.created_at, g.updated_at,
            COUNT(m.id)::int AS member_count
     FROM friend_groups g
     LEFT JOIN friend_group_members m ON m.group_id = g.id
     WHERE g.owner_id = $1 OR EXISTS (
       SELECT 1 FROM friend_group_members gm WHERE gm.group_id = g.id AND gm.user_id = $1
     )
     GROUP BY g.id
     ORDER BY g.updated_at DESC`,
    [req.user.id]
  );
  return res.json({ groups: result.rows });
}

async function updateGroup(req, res) {
  const { id } = req.params;
  const name = req.body.name !== undefined ? String(req.body.name).trim() : undefined;
  const plan = req.body.plan !== undefined ? req.body.plan : undefined;
  const access = await query(
    `SELECT g.id FROM friend_groups g
     WHERE g.id = $1 AND (g.owner_id = $2 OR EXISTS (
       SELECT 1 FROM friend_group_members gm WHERE gm.group_id = g.id AND gm.user_id = $2
     ))`,
    [id, req.user.id]
  );
  if (!access.rowCount) return res.status(404).json({ error: 'Group not found.' });

  const result = await query(
    `UPDATE friend_groups
     SET name = COALESCE($1, name), plan = COALESCE($2, plan), updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, owner_id, name, plan, created_at, updated_at`,
    [name || null, plan === undefined ? null : JSON.stringify(plan), id]
  );
  return res.json({ group: result.rows[0] });
}

async function addMember(req, res) {
  const groupId = req.params.id;
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Member email is required.' });

  const owner = await query(`SELECT id FROM friend_groups WHERE id = $1 AND owner_id = $2`, [groupId, req.user.id]);
  if (!owner.rowCount) return res.status(403).json({ error: 'Only the group owner can add members.' });

  const user = await query(`SELECT id, name, email FROM users WHERE email = $1`, [email]);
  if (!user.rowCount) return res.status(404).json({ error: 'No PujaMate user found with that email.' });

  const result = await query(
    `INSERT INTO friend_group_members (group_id, user_id) VALUES ($1, $2)
     ON CONFLICT (group_id, user_id) DO NOTHING
     RETURNING group_id, user_id`,
    [groupId, user.rows[0].id]
  );
  return res.status(201).json({ member: { ...user.rows[0], added: result.rowCount > 0 } });
}

async function getGroup(req, res) {
  const { id } = req.params;
  const group = await query(
    `SELECT g.id, g.name, g.plan, g.created_at, g.updated_at, g.owner_id
     FROM friend_groups g
     WHERE g.id = $1 AND (g.owner_id = $2 OR EXISTS (
       SELECT 1 FROM friend_group_members gm WHERE gm.group_id = g.id AND gm.user_id = $2
     ))`,
    [id, req.user.id]
  );
  if (!group.rowCount) return res.status(404).json({ error: 'Group not found.' });
  const members = await query(
    `SELECT u.id, u.name, u.email FROM friend_group_members gm
     JOIN users u ON u.id = gm.user_id WHERE gm.group_id = $1 ORDER BY u.name`,
    [id]
  );
  return res.json({ group: group.rows[0], members: members.rows });
}

module.exports = { createGroup, listGroups, updateGroup, addMember, getGroup };
