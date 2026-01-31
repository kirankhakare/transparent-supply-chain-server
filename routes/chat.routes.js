const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

// 🔍 DEBUG (keep this once, then remove)
console.log('CHAT CONTROLLER:', chatController);
router.get('/my-rooms', verifyToken, chatController.getMyRooms);
router.get('/my-room', verifyToken, chatController.getMyRoom);
router.get('/:roomId/messages', verifyToken, chatController.getMessages);
router.post('/:roomId/message', verifyToken, chatController.sendMessage);

module.exports = router;
