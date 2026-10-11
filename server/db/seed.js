require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');
const logger = require('../src/utils/logger');

const DEMO_USERS = [
  {
    name: 'Meet Patel',
    email: 'meet.patel@abc.com',
    password: 'Employee@123',
    role: 'EMPLOYEE',
    employee_id: 'EMP001',
  },
  {
    name: 'Sujal Solanki',
    email: 'sujal.solanki@abc.com',
    password: 'Employee@123',
    role: 'EMPLOYEE',
    employee_id: 'EMP002',
  },
  {
    name: 'Krish Shah',
    email: 'krish.shah@abc.com',
    password: 'Director@123',
    role: 'DIRECTOR',
    employee_id: null,
  },
  {
    name: 'Yamini Gokhle',
    email: 'yamini.gokhle@abc.com',
    password: 'Accounts@123',
    role: 'ACCOUNTS',
    employee_id: null,
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is missing. Set it in server/.env.');
    process.exit(1);
  }

  try {
    for (const user of DEMO_USERS) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, employee_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             employee_id = EXCLUDED.employee_id,
             updated_at = NOW()`,
        [user.name, user.email, passwordHash, user.role, user.employee_id]
      );
      logger.info(`Seeded ${user.role}: ${user.name} <${user.email}>`);
    }

    logger.info('Seed completed (4 users, no vouchers).');
  } catch (err) {
    logger.error('Seed failed.', { message: err.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
