require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');
const logger = require('../src/utils/logger');

async function setup() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is missing. Set it in server/.env.');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    logger.info('Database schema applied successfully.');
  } catch (err) {
    logger.error('Failed to apply schema.', { message: err.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setup();
