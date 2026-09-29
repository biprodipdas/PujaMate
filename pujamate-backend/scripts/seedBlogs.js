require('dotenv').config();
const { query, pool } = require('../src/db/pool');

const samples = [
  {
    title: 'A Night of Puja in North Kolkata',
    content: `This was my first proper night walk through North Kolkata during Durga Puja. I started around Shobhabazar and slowly made my way towards Kumartuli and Bagbazar. The narrow lanes, old houses, dhaak and lights made the whole evening feel different from a regular city walk.

What I enjoyed most was taking my time instead of trying to cover too many pandals. A short break for a cup of tea and a quiet look at the pratima became one of my favourite moments of the night.

If you are visiting North Kolkata, keep some extra time for walking between the bigger stops. The journey between the pandals is part of the experience.`,
    isSample: true
  },
  {
    title: 'My Favourite Puja Memories',
    content: `Every Puja has a different memory. One year it was a late-night pandal visit with friends, another year it was an early morning walk before the streets became crowded. This year I want to keep the same spirit—visit a few places slowly, take some photographs, eat something local and spend time with people.

For me, Puja is not only about counting how many pandals I visited. It is also about the little things: the sound of dhaak from a nearby para, the lights on a quiet road, meeting an old friend unexpectedly and finding a new place that was never on the original plan.

That is the kind of Puja journey I want to remember.`,
    isSample: true
  }
];

async function seed() {
  for (const item of samples) {
    await query(`
      INSERT INTO blog_posts (
        title,
        content,
        is_sample
      )
      SELECT
        $1::varchar,
        $2::text,
        TRUE
      WHERE NOT EXISTS (
        SELECT 1
        FROM blog_posts
        WHERE title::text = $1::text
          AND is_sample = TRUE
      )
    `, [
      item.title,
      item.content
    ]);
  }

  console.log('PujaMate sample blogs are ready.');
}

seed()
  .catch(err => {
    console.error('Blog seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());