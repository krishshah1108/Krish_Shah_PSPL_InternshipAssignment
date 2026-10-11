const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post(
  '/signature',
  authenticate,
  authorize('EMPLOYEE', 'DIRECTOR'),
  upload.single('signature'),
  uploadController.uploadSignature
);

module.exports = router;
