const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusfix';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Is MongoDB running? Check MONGODB_URI in server/.env');
    process.exit(1);
  }
};
