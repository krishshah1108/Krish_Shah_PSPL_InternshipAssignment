const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginValidators } = require('../validators/authValidators');

const router = express.Router();

router.post('/login', loginValidators, validate, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
