const express = require('express');
const router = express.Router();
const { login} = require('../controllers/auth.controller');

const { getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/me', verifyToken, getMe);
router.post('/login', login);
router.get('/me', getMe);
module.exports = router;
