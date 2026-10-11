require('dotenv').config({ quiet: true });
const { Pool } = require('pg');
const logger = require('../utils/logger');

if (!process.env.DATABASE_URL) {
  logger.warn('DATABASE_URL is not set. API routes that use the database will fail.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error.', { message: err.message });
});

async function query(text, params) {
  if (!process.env.DATABASE_URL) {
    const err = new Error('Database is not configured. Set DATABASE_URL in server/.env.');
    err.status = 503;
    throw err;
  }
  return pool.query(text, params);
}

module.exports = {
  query,
  pool,
};
