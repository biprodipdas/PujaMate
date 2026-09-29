const express = require('express');
const { getNextPuja } = require('../controllers/next.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const router = express.Router();
router.get('/', requireAuth, asyncHandler(getNextPuja));
module.exports = router;
