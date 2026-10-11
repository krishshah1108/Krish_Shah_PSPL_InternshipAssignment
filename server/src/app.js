const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const voucherRoutes = require('./routes/vouchers');
const uploadRoutes = require('./routes/uploads');
const dashboardRoutes = require('./routes/dashboard');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const Response = require('./utils/response');
const db = require('./config/db');

require('./cron/healthCron');

const app = express();

/** Strip trailing slash so https://app.vercel.app/ matches https://app.vercel.app */
function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/$/, '');
}

/**
 * Allowed browser origins for CORS.
 * - Always includes local Vite + deployed Vercel frontend
 * - CLIENT_ORIGIN may be a single URL or comma-separated list (extra origins)
 */
function getAllowedOrigins() {
  const defaults = [
    'http://localhost:5173',
    'https://krishshahpsplinternshipassignment-c.vercel.app',
  ];
  const fromEnv = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
  return [...new Set([...defaults.map(normalizeOrigin), ...fromEnv])];
}

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, Postman, server-to-server) send no Origin
      if (!origin) {
        return callback(null, true);
      }
      const allowed = getAllowedOrigins();
      if (allowed.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    Response.success('OK', { ok: true, service: 'expense-voucher-api' }, res);
  } catch (err) {
    Response.error('Health check failed', res, 500);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => Response.error('Route not found.', res, Response.code.notFound));

app.use(errorHandler);

module.exports = app;
