const express = require('express');
const voucherController = require('../controllers/voucherController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createValidators,
  listValidators,
  idParam,
  submitValidators,
  approveValidators,
  rejectValidators,
} = require('../validators/voucherValidators');

const router = express.Router();

router.get('/meta/options', authenticate, voucherController.getOptions);

router.get(
  '/',
  authenticate,
  authorize('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS'),
  listValidators,
  validate,
  voucherController.listVouchers
);

router.get(
  '/:id',
  authenticate,
  authorize('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS'),
  idParam,
  validate,
  voucherController.getVoucher
);

router.post(
  '/',
  authenticate,
  authorize('EMPLOYEE'),
  createValidators,
  validate,
  voucherController.createVoucher
);

router.put(
  '/:id',
  authenticate,
  authorize('EMPLOYEE'),
  [idParam, ...createValidators],
  validate,
  voucherController.updateVoucher
);

router.get(
  '/:id/download',
  authenticate,
  authorize('ACCOUNTS'),
  idParam,
  validate,
  voucherController.downloadVoucher
);

router.delete(
  '/:id',
  authenticate,
  authorize('EMPLOYEE'),
  idParam,
  validate,
  voucherController.deleteVoucher
);

router.post(
  '/:id/submit',
  authenticate,
  authorize('EMPLOYEE'),
  submitValidators,
  validate,
  voucherController.submitVoucher
);

router.post(
  '/:id/approve',
  authenticate,
  authorize('DIRECTOR'),
  approveValidators,
  validate,
  voucherController.approveVoucher
);

router.post(
  '/:id/reject',
  authenticate,
  authorize('DIRECTOR'),
  rejectValidators,
  validate,
  voucherController.rejectVoucher
);

module.exports = router;
