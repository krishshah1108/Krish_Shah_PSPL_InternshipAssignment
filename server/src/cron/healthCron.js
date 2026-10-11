const cron = require('node-cron');
const db = require('../config/db');
const logger = require('../utils/logger');

/** Ping DB so the free-tier project does not go inactive from zero daily use. */
async function pingDatabase() {
  try {
    await db.query('SELECT 1');
    logger.info('DB cron: ping successful');
  } catch (err) {
    logger.error('DB cron: ping failed', { message: err.message });
  }
}

// Twice daily (09:00 and 17:00 IST) — at least once per day is required
cron.schedule(
  '0 9,17 * * *',
  () => {
    logger.info('Running scheduled DB keep-alive');
    pingDatabase();
  },
  {
    timezone: 'Asia/Kolkata',
    scheduled: true,
  }
);

module.exports = { pingDatabase };
