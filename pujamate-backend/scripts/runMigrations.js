// scripts/runMigrations.js
// Runs src/db/migrations.sql against DATABASE_URL.
// Usage: npm run migrate

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sqlPath = path.join(__dirname, '..', 'src', 'db', 'migrations.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running migrations against Neon PostgreSQL...');
  try {
    await pool.query(sql);
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
