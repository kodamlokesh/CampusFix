const mongoose = require('mongoose');

const CATEGORIES = ['Electrical', 'Water Leak', 'Classroom Equipment', 'Cleanliness', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const text = (label, min, max) => ({
  type: String,
  trim: true,
  required: [true, `${label} is required`],
  minlength: [min, `${label} must be at least ${min} characters`],
  maxlength: [max, `${label} must be at most ${max} characters`],
});

const complaintSchema = new mongoose.Schema(
  {
    title: text('Title', 3, 100),
    description: text('Description', 10, 1000),
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: `Category must be one of: ${CATEGORIES.join(', ')}` },
    },
    location: text('Location', 2, 100),
    priority: {
      type: String,
      default: 'Medium',
      enum: { values: PRIORITIES, message: `Priority must be one of: ${PRIORITIES.join(', ')}` },
    },
    status: {
      type: String,
      default: 'Pending',
      enum: { values: STATUSES, message: `Status must be one of: ${STATUSES.join(', ')}` },
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1, category: 1, priority: 1 });
complaintSchema.index({ student: 1 });
complaintSchema.index({ assignedTo: 1 });

module.exports = {
  Complaint: mongoose.model('Complaint', complaintSchema),
  CATEGORIES,
  PRIORITIES,
  STATUSES,
};
