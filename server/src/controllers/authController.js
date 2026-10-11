const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const Response = require('../utils/response');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query(
    `SELECT id, name, email, password_hash, role, employee_id
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return Response.error('Invalid email or password.', res, Response.code.unauthorized);
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return Response.error('Invalid email or password.', res, Response.code.unauthorized);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return Response.success(
    'Signed in successfully.',
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
      },
    },
    res
  );
});

const me = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, name, email, role, employee_id FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return Response.error('User not found.', res, Response.code.notFound);
  }

  const user = result.rows[0];
  return Response.success(
    'User profile fetched successfully.',
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
    },
    res
  );
});

module.exports = { login, me };
