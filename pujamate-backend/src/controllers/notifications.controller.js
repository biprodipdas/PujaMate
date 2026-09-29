const { query } = require('../db/pool');

let webPush = null;
try { webPush = require('web-push'); } catch (_) { webPush = null; }

function configurePush() {
  if (!webPush || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) return false;
  webPush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  return true;
}

async function saveSubscription(req, res) {
  const { endpoint, keys, pujaId = null } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) return res.status(400).json({ error: 'A valid push subscription is required.' });
  await query(
    `INSERT INTO notification_subscriptions (user_id, puja_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id, puja_id = EXCLUDED.puja_id,
       p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
    [req.user.id, pujaId || null, endpoint, keys.p256dh, keys.auth]
  );
  return res.status(201).json({ subscribed: true });
}

async function removeSubscription(req, res) {
  if (!req.body?.endpoint) return res.status(400).json({ error: 'endpoint is required.' });
  await query(`DELETE FROM notification_subscriptions WHERE endpoint = $1 AND user_id = $2`, [req.body.endpoint, req.user.id]);
  return res.json({ subscribed: false });
}

async function notifyPujaSubscribers(pujaId, title, body) {
  if (!configurePush()) return;
  const result = await query(
    `SELECT id, endpoint, p256dh, auth FROM notification_subscriptions
     WHERE puja_id = $1 OR puja_id IS NULL`,
    [pujaId]
  );
  const payload = JSON.stringify({ title, body, pujaId });
  await Promise.all(result.rows.map(async (row) => {
    try {
      await webPush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload);
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await query(`DELETE FROM notification_subscriptions WHERE id = $1`, [row.id]);
      }
    }
  }));
}

module.exports = { saveSubscription, removeSubscription, notifyPujaSubscribers };
