const express = require('express');
const router = express.Router();
const {
  getMyProject,
  getMyOrders,
  getProgressHistory,
  getMyCostDetails,
} = require('../controllers/user.controller');

const { verifyToken, allowRoles } = require('../middleware/auth.middleware');

router.use(verifyToken, allowRoles('user'));

router.get('/project', getMyProject);
router.get('/orders', getMyOrders);
router.get('/progress', getProgressHistory);
router.get('/cost-details',getMyCostDetails);

module.exports = router;
