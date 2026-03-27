const express = require('express');
const router = express.Router();
const { getMembers, getMember, createMember, updateMember, deleteMember, getMemberQR } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',           authorize('admin', 'trainer'), getMembers);
router.post('/',          authorize('admin'), createMember);
router.get('/:id',        getMember);
router.put('/:id',        authorize('admin'), updateMember);
router.delete('/:id',     authorize('admin'), deleteMember);
router.get('/:id/qr',     getMemberQR);

module.exports = router;
