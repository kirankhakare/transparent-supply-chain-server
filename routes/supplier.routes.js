const express = require('express');
const router = express.Router();
const supplierCtrl = require('../controllers/supplier.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

/**
 * GET all orders assigned to supplier
 * URL: /api/supplier/orders
 */
router.get(
  '/orders',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.getMyOrders
);

/**
 * UPDATE order status (ACCEPT / REJECT)
 * URL: /api/supplier/order/:orderId/status
 */
router.put(
  '/order/:orderId/status',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.updateOrderStatus
);

/**
 * DELIVER order
 * URL: /api/supplier/order/:orderId/deliver
 */
router.post(
  '/order/:orderId/deliver',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.deliverOrder
);

router.get(
  '/sites',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.getSupplierSites
);


module.exports = router;
