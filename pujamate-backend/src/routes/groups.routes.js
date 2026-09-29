const express = require('express');
const { createGroup, listGroups, updateGroup, addMember, getGroup } = require('../controllers/groups.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(listGroups));
router.post('/', asyncHandler(createGroup));
router.get('/:id', asyncHandler(getGroup));
router.put('/:id', asyncHandler(updateGroup));
router.post('/:id/members', asyncHandler(addMember));

module.exports = router;
