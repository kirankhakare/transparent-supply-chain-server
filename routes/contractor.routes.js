// routes/contractor.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contractor.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

router.use(verifyToken, allowRoles('contractor'));

router.get('/sites', ctrl.getAssignedSites);
router.post('/progress', ctrl.updateProgress);
router.get('/progress/:siteId', ctrl.getProgressHistory);
router.post('/order', ctrl.createMaterialOrder);


router.post('/expenses', ctrl.addExpense);
router.get('/expenses', ctrl.getMyExpenses);
router.patch(
  '/expenses/:id/status',
  verifyToken,
  allowRoles('contractor'),
  ctrl.updateExpense
);
router.get('/order/:id', ctrl.getMyOrders);


router.get('/suppliers', ctrl.getSuppliers);

module.exports = router;
