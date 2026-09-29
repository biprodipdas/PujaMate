require('dotenv').config();
const { query, pool } = require('../src/db/pool');
const { VERIFIED_2026 } = require('./verifiedPujas2026.data');

function facilitiesFor(area) {
  const base = { toilet: false, seniorSeating: false, parking: false, medical: false, metro: true, bus: false };
  if (area === 'Serampore') return { ...base, metro: false, bus: true };
  if (area === 'Chandannagar') return { ...base, metro: false, bus: true, toilet: true, medical: true, parking: true };
  return base;
}

const SEED_DESCRIPTION = '2026 Durga Puja listing. Map location verified from a current public 2026 pandal directory/map source.';

// Applies only to PujaMate-owned 2026 seed records; unrelated user/admin records are not overwritten.
async function run() {
  let inserted = 0, updated = 0;
  for (const [name, area, latitude, longitude] of VERIFIED_2026) {
    const result = await query(`
      UPDATE pujas
      SET area=$2::varchar, latitude=$3::double precision, longitude=$4::double precision,
          description=$5::text, facilities=$6::jsonb
      WHERE LOWER(name::text)=LOWER($1::text)
        AND (description LIKE '2026 Kolkata Durga Puja listing.%' OR description LIKE '2026 Durga Puja listing.%')
      RETURNING id
    `, [name, area, latitude, longitude, SEED_DESCRIPTION, JSON.stringify(facilitiesFor(area))]);
    if (result.rowCount) { updated += result.rowCount; continue; }

    const insertedResult = await query(`
      INSERT INTO pujas (name, description, area, latitude, longitude, pujo_type, facilities)
      SELECT $1::varchar,$5::text,$2::varchar,$3::double precision,$4::double precision,'THEME',$6::jsonb
      WHERE NOT EXISTS (SELECT 1 FROM pujas WHERE LOWER(name::text)=LOWER($1::text) AND LOWER(area::text)=LOWER($2::text))
      RETURNING id
    `, [name, area, latitude, longitude, SEED_DESCRIPTION, JSON.stringify(facilitiesFor(area))]);
    if (insertedResult.rowCount) inserted += 1;
  }
  console.log(`Verified 2026 locations applied: ${updated} seed records updated, ${inserted} new records inserted.`);
}

run().catch(err => { console.error('Verification failed:', err); process.exitCode=1; }).finally(() => pool.end());
