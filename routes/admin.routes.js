const express = require('express');
const router = express.Router();

const { createUser , getDashboardStats, getUserAnalytics } = require('../controllers/admin.controller');
const { verifyToken, allowRoles } = require('../middleware/auth.middleware');
const adminCtrl = require('../controllers/admin.controller');

router.post(
  '/create-user',
  verifyToken,
  allowRoles('admin'),
  createUser
);

router.get(
  '/dashboard-stats',
  verifyToken,
  allowRoles('admin'),
  getDashboardStats
);

router.get(
  '/user-analytics',
  verifyToken,
  allowRoles('admin'),
  getUserAnalytics
);

router.get('/users', verifyToken, adminCtrl.getAllUsers);
router.patch('/users/:id/status', verifyToken, adminCtrl.updateUserStatus);
router.get('/users/:id/report', verifyToken, adminCtrl.getUserReport);
router.get('/user-analytics', verifyToken, adminCtrl.userAnalytics);

router.get('/contractors', verifyToken, adminCtrl.getContractors);
router.post('/assign-contractor', verifyToken, adminCtrl.assignContractor);

router.get(
  '/contractors-with-users',
  verifyToken,
  adminCtrl.getContractorsWithUsers
);

router.get(
  '/users-with-project-status',
 verifyToken, adminCtrl.getUsersWithProjectStatus
);

router.get('/suppliers', verifyToken, adminCtrl.getAllSuppliers);
router.put('/suppliers/:id/status',verifyToken, adminCtrl.updateSupplierStatus);

module.exports = router;
