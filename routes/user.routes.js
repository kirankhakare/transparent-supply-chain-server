// routes/user.routes.js
const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

// 🟢 User sees his material orders
router.get(
  '/orders',
  verifyToken,
  allowRoles('user'),
  userCtrl.getMyOrders
);

// 🟢 User sees single order detail
router.get(
  '/order/:id',
  verifyToken,
  allowRoles('user'),
  userCtrl.getOrderById
);

module.exports = router;
