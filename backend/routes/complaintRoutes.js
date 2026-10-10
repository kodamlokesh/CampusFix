const express = require('express');
const c = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.param('id', (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) return next(Object.assign(new Error('Invalid complaint id'), { status: 400 }));
  next();
});

router.route('/').get(c.getComplaints).post(authorize('student'), c.createComplaint);
router.get('/stats', c.getStats); // must stay above '/:id'
router.route('/:id').get(c.getComplaint).patch(c.updateComplaint).delete(c.deleteComplaint);

module.exports = router;
