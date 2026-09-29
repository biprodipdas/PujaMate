// src/routes/auth.routes.js
const express = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));

module.exports = router;
