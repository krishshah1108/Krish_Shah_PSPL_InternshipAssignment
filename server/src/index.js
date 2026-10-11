require('dotenv').config({ quiet: true });
const app = require('./app');
const logger = require('./utils/logger');

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET is not set.');
}

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use.`);
  } else {
    logger.error('Failed to start server.', { message: err.message });
  }
  process.exit(1);
});
