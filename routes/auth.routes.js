const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');
const { verifyAdmin } = require('../middleware/auth.middleware');

router.post('/login', login);

// 👇 ONLY ADMIN CAN REGISTER USERS
router.post('/register', verifyAdmin, register);

module.exports = router;
