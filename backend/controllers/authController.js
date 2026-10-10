const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError, str } = require('../utils/http');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Public sign-up creates students only. Workers are added by an admin.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  const user = await User.create({ name, email, password: typeof password === 'string' ? password : '', role: 'student' });
  res.status(201).json({ token: signToken(user._id), user });
});

exports.login = asyncHandler(async (req, res) => {
  const email = str(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) throw httpError(400, 'Enter your email and password');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw httpError(401, 'Incorrect email or password');
  res.json({ token: signToken(user._id), user });
});

exports.me = (req, res) => res.json({ user: req.user });
