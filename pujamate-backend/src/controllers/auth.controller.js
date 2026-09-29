// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.status(201).json({ user, token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const result = await query(
    `SELECT id, name, email, password_hash, role FROM users WHERE email = $1`,
    [normalizedEmail]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  delete user.password_hash;

  return res.json({ user, token });
}

async function me(req, res) {
  const result = await query(
    `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
    [req.user.id]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user });
}

module.exports = { register, login, me };
