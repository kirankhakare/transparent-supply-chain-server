const express = require('express');
const router = express.Router();
const supplierCtrl = require('../controllers/supplier.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

router.get(
  '/orders',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.getMyOrders
);

router.patch(
  '/order/:id',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.updateOrderStatus
);

module.exports = router;
