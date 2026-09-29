const express = require('express');
const { listBlogs, getBlog, createBlog } = require('../controllers/blog.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.get('/', asyncHandler(listBlogs));
router.get('/:id', asyncHandler(getBlog));
router.post('/', requireAuth, asyncHandler(createBlog));
module.exports = router;
