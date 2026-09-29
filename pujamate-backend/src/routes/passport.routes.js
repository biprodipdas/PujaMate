// src/routes/passport.routes.js
const express = require('express');
const { getPassport, checkIn } = require('../controllers/passport.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(getPassport));
router.post('/checkin', asyncHandler(checkIn));

module.exports = router;
