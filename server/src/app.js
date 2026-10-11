const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const voucherRoutes = require('./routes/vouchers');
const uploadRoutes = require('./routes/uploads');
const dashboardRoutes = require('./routes/dashboard');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const Response = require('./utils/response');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => Response.error('Route not found.', res, Response.code.notFound));

app.use(errorHandler);

module.exports = app;
