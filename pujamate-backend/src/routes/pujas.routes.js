// src/routes/pujas.routes.js
const express = require('express');
const { listPujas, getPujaById, createPuja, listFacilities } = require('../controllers/pujas.controller');
const { listReviews, createReview } = require('../controllers/reviews.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { cacheControl } = require('../middleware/cacheControl');

const router = express.Router();

// Pandal listings change on the scale of admin edits, not seconds — a short
// cache lets a flaky 3G/4G connection skip the round trip on repeat views
// (e.g. going back to Explore after opening a detail sheet). Crowd status
// and passport routes are intentionally never cached this way.
router.get('/', cacheControl(60), asyncHandler(listPujas));
// Must be registered before '/:id' or Express would treat "facilities" as an :id
router.get('/facilities', cacheControl(60), asyncHandler(listFacilities));
router.get('/:id/reviews', asyncHandler(listReviews));
router.post('/:id/reviews', requireAuth, asyncHandler(createReview));
router.get('/:id', cacheControl(60), asyncHandler(getPujaById));
router.post('/', requireAuth, requireRole('ADMIN'), asyncHandler(createPuja));

module.exports = router;
