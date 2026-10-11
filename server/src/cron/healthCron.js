const cron = require('node-cron');
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Ping the database to keep it awake.
 */
async function pingDatabase() {
  try {
    await db.query('SELECT 1');
    logger.info('Health cron: DB ping successful');
  } catch (err) {
    logger.error('Health cron: DB ping failed', { message: err.message });
  }
}

// Twice daily (09:00 and 17:00 IST) to reduce free-tier DB / idle cold starts
cron.schedule(
  '0 9,17 * * *',
  () => {
    logger.info('Running scheduled health-check (twice daily)');
    pingDatabase();
  },
  {
    timezone: 'Asia/Kolkata',
    scheduled: true,
  }
);

module.exports = { pingDatabase };
