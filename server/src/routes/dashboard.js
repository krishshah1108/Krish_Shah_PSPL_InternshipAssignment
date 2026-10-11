const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS'),
  dashboardController.getDashboard
);

module.exports = router;
