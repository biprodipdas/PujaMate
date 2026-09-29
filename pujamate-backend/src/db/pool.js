// src/db/pool.js
// Native 'pg' connection pool. Defaults to SSL for Neon; set PGSSL=false
// in .env to run against a local/self-hosted Postgres that doesn't have
// SSL configured (e.g. local development or CI).

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env file.');
}

const useSSL = process.env.PGSSL !== 'false';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires SSL. rejectUnauthorized:false is standard for Neon's
  // pooled connection string in most hosting environments (Render, etc.)
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Catches errors on idle clients so the process doesn't crash silently
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Simple query helper. Prefer this over pool.connect() for one-off queries.
 * @param {string} text - SQL query text with $1, $2... placeholders
 * @param {Array} params - query parameters
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV !== 'production') {
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: result.rowCount });
  }
  return result;
}

/**
 * Use this when you need a transaction (multiple statements, all-or-nothing).
 * Usage:
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     ...
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { pool, query, getClient };
