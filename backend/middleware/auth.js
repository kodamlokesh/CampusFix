const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../utils/http');

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Log in to continue');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Your session has expired. Log in again');
  }
  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'This account no longer exists');
  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'You do not have permission to do that'));
