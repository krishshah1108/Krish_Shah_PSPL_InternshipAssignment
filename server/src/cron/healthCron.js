const cron = require('node-cron');
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Single keep-alive task: ping DB and call this server's /api/health
 * so both database and backend HTTP stay active.
 * Uses local PORT only (CLIENT_ORIGIN is the frontend, not the API).
 */
async function runKeepAlive() {
  try {
    await db.query('SELECT 1');
    logger.info('Health cron: DB ping successful');
  } catch (err) {
    logger.error('Health cron: DB ping failed', { message: err.message });
  }

  const port = Number(process.env.PORT) || 5000;
  const healthUrl = `http://127.0.0.1:${port}/api/health`;

  try {
    const response = await fetch(healthUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    logger.info('Health cron: /api/health call successful', { url: healthUrl });
  } catch (err) {
    logger.error('Health cron: /api/health call failed', {
      url: healthUrl,
      message: err.message,
    });
  }
}

// Twice daily (09:00 and 17:00 IST)
cron.schedule(
  '0 9,17 * * *',
  () => {
    logger.info('Running scheduled keep-alive (DB + health API)');
    runKeepAlive();
  },
  {
    timezone: 'Asia/Kolkata',
    scheduled: true,
  }
);

module.exports = { runKeepAlive };
