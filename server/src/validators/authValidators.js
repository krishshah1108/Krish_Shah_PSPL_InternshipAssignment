const { body } = require('express-validator');

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = { loginValidators };
