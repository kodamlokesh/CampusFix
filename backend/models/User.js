const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { CATEGORIES } = require('./Complaint');

const ROLES = ['student', 'worker', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, trim: true,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    email: {
      type: String, trim: true, lowercase: true, unique: true,
      required: [true, 'Email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    password: {
      type: String, select: false,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: { type: String, enum: ROLES, default: 'student' },
    specialty: { type: String, enum: { values: CATEGORIES, message: 'Choose a valid specialty' }, default: 'Other' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; },
});

module.exports = mongoose.model('User', userSchema);
