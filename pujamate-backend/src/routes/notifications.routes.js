const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { saveSubscription, removeSubscription } = require('../controllers/notifications.controller');

const router = express.Router();
router.use(requireAuth);
router.post('/subscribe', asyncHandler(saveSubscription));
router.post('/unsubscribe', asyncHandler(removeSubscription));

module.exports = router;
