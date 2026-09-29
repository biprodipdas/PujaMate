require('dotenv').config();
const { query, pool } = require('../src/db/pool');
const { VERIFIED_2026 } = require('./verifiedPujas2026.data');

/**
 * Non-destructive 2026 pandal seed.
 *
 * Only map-linked 2026 records in the shared verification set are seeded.
 * Existing rows are never deleted or overwritten.
 */
function facilitiesFor(name, area) {
  const base = { toilet: false, seniorSeating: false, parking: false, medical: false, metro: true, bus: false };
  if (area === 'Serampore') return { ...base, metro: false, bus: true };
  if (area === 'Chandannagar') return { ...base, metro: false, bus: true, toilet: true, medical: true, parking: true };
  return base;
}

async function seed() {
  let inserted = 0;

  for (const [name, area, latitude, longitude] of VERIFIED_2026) {
    const result = await query(`
      INSERT INTO pujas (
        name,
        description,
        area,
        latitude,
        longitude,
        pujo_type,
        facilities
      )
      SELECT
        $1::varchar,
        $2::text,
        $3::varchar,
        $4::double precision,
        $5::double precision,
        'THEME',
        $6::jsonb
      WHERE NOT EXISTS (
        SELECT 1
        FROM pujas
        WHERE LOWER(name::text) = LOWER($1::text)
          AND LOWER(area::text) = LOWER($3::text)
      )
      RETURNING id
    `, [
      name,
      '2026 Durga Puja listing. Map location verified from a current public 2026 pandal directory/map source.',
      area,
      latitude,
      longitude,
      JSON.stringify(facilitiesFor(name, area)),
    ]);

    if (result.rowCount) {
      inserted += 1;
    }
  }

  console.log(
    `PujaMate verified 2026 seed complete. Inserted ${inserted} new pandals; existing records were left untouched.`
  );
}

seed()
  .catch((err) => {
    console.error('Puja seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });