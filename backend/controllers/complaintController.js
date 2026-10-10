const { Complaint, CATEGORIES, PRIORITIES, STATUSES } = require('../models/Complaint');
const User = require('../models/User');
const { asyncHandler, httpError, str, pickFields, isObjectId } = require('../utils/http');

const POPULATE = [
  { path: 'student', select: 'name email' },
  { path: 'assignedTo', select: 'name specialty' },
];
// What each role is allowed to see
const scope = (u) => (u.role === 'student' ? { student: u._id } : u.role === 'worker' ? { assignedTo: u._id } : {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function applyEnumFilter(filter, key, value, allowed) {
  if (!value || value === 'All') return;
  if (!allowed.includes(value)) throw httpError(400, `Invalid ${key} filter: ${value}`);
  filter[key] = value;
}

exports.getComplaints = asyncHandler(async (req, res) => {
  const filter = scope(req.user);
  applyEnumFilter(filter, 'category', str(req.query.category), CATEGORIES);
  applyEnumFilter(filter, 'status', str(req.query.status), STATUSES);
  applyEnumFilter(filter, 'priority', str(req.query.priority), PRIORITIES);

  if (req.user.role === 'admin') {
    const assigned = str(req.query.assigned);
    if (assigned === 'unassigned') filter.assignedTo = null;
    else if (assigned && assigned !== 'All') {
      if (!isObjectId(assigned)) throw httpError(400, 'Invalid worker filter');
      filter.assignedTo = assigned;
    }
  }

  const search = str(req.query.search).slice(0, 100);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
  }

  const sort = str(req.query.sort) || 'newest';
  if (!['newest', 'oldest', 'priority'].includes(sort)) throw httpError(400, `Invalid sort: ${sort}`);

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
    .populate(POPULATE)
    .lean();
  if (sort === 'priority') {
    const rank = { High: 0, Medium: 1, Low: 2 };
    complaints.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }
  res.json({ count: complaints.length, complaints });
});

exports.getStats = asyncHandler(async (req, res) => {
  const match = scope(req.user);
  const group = (field) => Complaint.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  const isAdmin = req.user.role === 'admin';
  const [s, c, p, openHighPriority, unassigned] = await Promise.all([
    group('status'),
    group('category'),
    group('priority'),
    Complaint.countDocuments({ ...match, priority: 'High', status: { $ne: 'Resolved' } }),
    isAdmin ? Complaint.countDocuments({ assignedTo: null, status: { $ne: 'Resolved' } }) : null,
  ]);
  const toMap = (keys, rows) => Object.fromEntries(keys.map((k) => [k, rows.find((r) => r._id === k)?.count || 0]));
  const byStatus = toMap(STATUSES, s);
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  res.json({
    total,
    byStatus,
    byCategory: toMap(CATEGORIES, c),
    byPriority: toMap(PRIORITIES, p),
    openHighPriority,
    resolutionRate: total ? Math.round((byStatus.Resolved / total) * 100) : 0,
    ...(isAdmin && { unassigned }),
  });
});

exports.getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, ...scope(req.user) }).populate(POPULATE);
  if (!complaint) throw httpError(404, 'Complaint not found');
  res.json({ complaint });
});

exports.createComplaint = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body, ['title', 'description', 'category', 'location', 'priority']);
  const complaint = await Complaint.create({ ...fields, student: req.user._id });
  res.status(201).json({ complaint });
});

exports.updateComplaint = asyncHandler(async (req, res) => {
  const { role } = req.user;
  if (role === 'student') throw httpError(403, 'Students cannot edit reports');
  const complaint = await Complaint.findOne({ _id: req.params.id, ...scope(req.user) });
  if (!complaint) throw httpError(404, 'Complaint not found');

  const updates = pickFields(req.body, role === 'worker' ? ['status'] : ['status', 'assignedTo', 'priority', 'category']);
  if (!Object.keys(updates).length) throw httpError(400, 'No valid fields to update');
  if (role === 'worker' && updates.status === 'Pending') throw httpError(400, 'Set the status to In Progress or Resolved');

  if ('assignedTo' in updates) {
    if (!updates.assignedTo) updates.assignedTo = null;
    else {
      if (!isObjectId(updates.assignedTo) || !(await User.exists({ _id: updates.assignedTo, role: 'worker' }))) {
        throw httpError(400, 'Choose a valid worker');
      }
    }
  }

  complaint.set(updates);
  if (updates.assignedTo === null && !('status' in updates) && complaint.status === 'In Progress') complaint.status = 'Pending';
  if (complaint.isModified('status')) complaint.resolvedAt = complaint.status === 'Resolved' ? new Date() : null;
  await complaint.save();
  await complaint.populate(POPULATE);
  res.json({ complaint });
});

exports.deleteComplaint = asyncHandler(async (req, res) => {
  const { role } = req.user;
  if (role === 'worker') throw httpError(403, 'Workers cannot delete reports');
  const complaint = await Complaint.findOne({ _id: req.params.id, ...scope(req.user) });
  if (!complaint) throw httpError(404, 'Complaint not found');
  if (role === 'student' && complaint.status !== 'Pending') throw httpError(403, 'Only pending reports can be deleted');
  await complaint.deleteOne();
  res.json({ message: 'Complaint deleted', id: req.params.id });
});
