const express = require('express');
const router = express.Router();
const supplierCtrl = require('../controllers/supplier.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer'); // ✅ ADD THIS

router.get(
  '/orders',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.getSupplierOrders
);

router.put(
  '/order/:orderId/status',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.updateOrderStatus
);

router.post(
  '/order/:orderId/deliver',
  verifyToken,
  allowRoles('supplier'),
  upload.single('image'), 
  supplierCtrl.deliverOrder
);

router.get(
  '/sites',
  verifyToken,
  allowRoles('supplier'),
  supplierCtrl.getSupplierSites
);

module.exports = router;
