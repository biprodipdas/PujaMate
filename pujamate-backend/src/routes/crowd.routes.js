// src/routes/crowd.routes.js
const express = require('express');
const { submitCrowdReport, getCrowdStatus } = require('../controllers/crowd.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/:pujaId', asyncHandler(getCrowdStatus));
router.post('/:pujaId', requireAuth, asyncHandler(submitCrowdReport));

module.exports = router;
