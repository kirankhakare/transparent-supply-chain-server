// routes/supplier.routes.js
const express = require('express');
const router = express.Router();

const supplierCtrl = require('../controllers/supplier.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

// 🔵 Get all orders assigned to supplier
router.get(
  '/orders',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.getMyOrders
);

// 🔵 Update order status (ACCEPT / REJECT / DISPATCH / DELIVER)
router.patch(
  '/order/:id/status',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.updateOrderStatus
);

module.exports = router;
