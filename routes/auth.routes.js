const express = require('express');
const router = express.Router();
const { login ,getMe} = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/me', getMe);
module.exports = router;
