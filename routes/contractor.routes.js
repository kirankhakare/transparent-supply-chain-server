// routes/contractor.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contractor.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

/* 🔒 PROTECT ALL CONTRACTOR ROUTES */
router.use(verifyToken, allowRoles('contractor'));

/* ================= SITES ================= */
router.get('/sites', ctrl.getAssignedSites);

/* ================= PROGRESS ================= */
router.post('/progress', ctrl.updateProgress);
router.get('/progress/:siteId', ctrl.getProgressHistory);
router.get('/progress',ctrl.getUserProgress);
/* ================= MATERIAL ORDERS ================= */
router.post('/orders', ctrl.createMaterialOrder);

// all orders (tracking)
router.get('/orders', ctrl.getMyOrders);

// filter by status → ?status=PENDING | ACCEPTED | DELIVERED
router.get('/orders/status', ctrl.getOrdersByStatus); // 🔥 ADD

/* ================= EXPENSE / COST ================= */
router.post('/expenses', ctrl.addExpense);
router.get('/expenses', ctrl.getMyExpenses);

// full expense update (amount, desc, etc.)
router.patch('/expenses/:id', ctrl.updateExpense);

// site-wise cost summary (VERY IMPORTANT)
router.get('/site-cost/:siteId', ctrl.getSiteCostSummary); // 🔥 ADD

/* ================= SUPPLIERS ================= */
router.get('/suppliers', ctrl.getSuppliers);

router.get(
  '/expenses',
  verifyToken,
  allowRoles('user'),
  ctrl.getUserExpenses
);
router.get('/expenses', ctrl.getMyExpenses);

module.exports = router;
