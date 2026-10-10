const User = require('../models/User');

module.exports = async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account was created');
  if (await User.exists({ email })) return;
  await User.create({ name: process.env.ADMIN_NAME || 'Campus Admin', email, password, role: 'admin' });
  console.log(`Admin account created: ${email}`);
};
