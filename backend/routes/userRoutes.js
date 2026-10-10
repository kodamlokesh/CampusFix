const express = require('express');
const u = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

router.route('/workers').get(u.listWorkers).post(u.createWorker);
router.delete('/workers/:id', (req, res, next) =>
  /^[a-f\d]{24}$/i.test(req.params.id) ? u.deleteWorker(req, res, next) : next(Object.assign(new Error('Invalid worker id'), { status: 400 })));
router.get('/students', u.listStudents);

module.exports = router;
