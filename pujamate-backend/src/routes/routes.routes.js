// src/routes/routes.routes.js
const express = require('express');
const {
  listMyRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routes.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All route-planner endpoints require an authenticated user
router.use(requireAuth);

router.get('/', asyncHandler(listMyRoutes));
router.get('/:id', asyncHandler(getRouteById));
router.post('/', asyncHandler(createRoute));
router.put('/:id', asyncHandler(updateRoute));
router.delete('/:id', asyncHandler(deleteRoute));

module.exports = router;
