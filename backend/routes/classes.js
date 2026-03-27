const express = require('express');
const router = express.Router();
const { getClasses, getClass, createClass, updateClass, deleteClass, enrollMember, unenrollMember } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',                  getClasses);
router.post('/',                 authorize('admin'), createClass);
router.get('/:id',               getClass);
router.put('/:id',               authorize('admin', 'trainer'), updateClass);
router.delete('/:id',            authorize('admin'), deleteClass);
router.post('/:id/enroll',       authorize('member'), enrollMember);
router.delete('/:id/unenroll',   authorize('member'), unenrollMember);

module.exports = router;
