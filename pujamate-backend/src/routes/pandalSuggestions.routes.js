const express = require('express');
const { createPandalSuggestion } = require('../controllers/pandalSuggestions.controller');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.post('/', asyncHandler(createPandalSuggestion));
module.exports = router;
