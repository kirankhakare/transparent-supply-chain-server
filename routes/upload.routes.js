const express = require('express');
const router = express.Router();
const uploadCtrl = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/image', verifyToken, uploadCtrl.uploadImage);

module.exports = router;
