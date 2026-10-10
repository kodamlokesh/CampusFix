const User = require('../models/User');
const { Complaint } = require('../models/Complaint');
const { asyncHandler, httpError, pickFields } = require('../utils/http');

exports.listWorkers = asyncHandler(async (req, res) => {
  const [workers, rows] = await Promise.all([
    User.find({ role: 'worker' }).sort({ name: 1 }).lean(),
    Complaint.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: { w: '$assignedTo', s: '$status' }, count: { $sum: 1 } } },
    ]),
  ]);
  const load = {};
  rows.forEach((r) => {
    const k = String(r._id.w);
    load[k] = load[k] || { open: 0, resolved: 0 };
    load[k][r._id.s === 'Resolved' ? 'resolved' : 'open'] += r.count;
  });
  res.json({
    workers: workers.map(({ password, __v, ...w }) => ({ ...w, openCount: load[String(w._id)]?.open || 0, resolvedCount: load[String(w._id)]?.resolved || 0 })),
  });
});

exports.createWorker = asyncHandler(async (req, res) => {
  const body = pickFields(req.body, ['name', 'email', 'password', 'specialty']);
  if (typeof body.password !== 'string') body.password = '';
  const worker = await User.create({ ...body, role: 'worker' });
  res.status(201).json({ worker });
});

exports.deleteWorker = asyncHandler(async (req, res) => {
  const worker = await User.findOne({ _id: req.params.id, role: 'worker' });
  if (!worker) throw httpError(404, 'Worker not found');
  // Return their reports to the queue
  await Complaint.updateMany({ assignedTo: worker._id, status: 'In Progress' }, { assignedTo: null, status: 'Pending' });
  await Complaint.updateMany({ assignedTo: worker._id }, { assignedTo: null });
  await worker.deleteOne();
  res.json({ message: 'Worker deleted', id: req.params.id });
});

exports.listStudents = asyncHandler(async (req, res) => {
  const [students, rows] = await Promise.all([
    User.find({ role: 'student' }).sort({ name: 1 }).lean(),
    Complaint.aggregate([{ $group: { _id: '$student', count: { $sum: 1 } } }]),
  ]);
  const counts = Object.fromEntries(rows.map((r) => [String(r._id), r.count]));
  res.json({ students: students.map(({ password, __v, ...s }) => ({ ...s, reportCount: counts[String(s._id)] || 0 })) });
});
