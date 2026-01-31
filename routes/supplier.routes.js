// routes/supplier.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/supplier.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

/* 🔐 SUPPLIER ONLY */
router.use(verifyToken, allowRoles('supplier'));

/* ORDERS */
router.get('/orders', ctrl.getMyOrders);
router.get('/orders/:id', ctrl.getOrderDetails);

/* STATUS ACTIONS */
router.put('/orders/:id/accept', ctrl.acceptOrder);
router.put('/orders/:id/dispatch', ctrl.dispatchOrder);
router.put('/orders/:id/deliver', ctrl.deliverOrder);

module.exports = router;
