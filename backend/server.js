require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ensureAdmin = require('./config/ensureAdmin');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to server/.env');
  process.exit(1);
}
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());

app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(ensureAdmin)
  .then(() => app.listen(PORT, () => console.log(`CampusFix API running on http://localhost:${PORT}`)));
