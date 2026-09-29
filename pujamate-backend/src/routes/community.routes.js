const express = require('express');
const { listPosts, createPost } = require('../controllers/community.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.get('/posts', asyncHandler(listPosts));
router.post('/posts', requireAuth, asyncHandler(createPost));
module.exports = router;
