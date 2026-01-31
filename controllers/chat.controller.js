const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/ChatMessage');
const Site = require('../models/site');

/* ================= GET MY CHAT ROOM ================= */
exports.getMyRoom = async (req, res) => {
  try {
    const userId = req.user.id;

    const site = await Site.findOne({
      $or: [{ user: userId }, { contractor: userId }],
    });

    if (!site) {
      return res.status(404).json({ message: 'No site found' });
    }

    const room = await ChatRoom.findOne({ site: site._id });

    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      contractor: req.user.id,
    })
      .populate('user', 'username')
      .populate('site', 'projectName')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load rooms' });
  }
};

/* ================= GET MESSAGES ================= */
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      room: req.params.roomId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

/* ================= SEND MESSAGE ================= */
exports.sendMessage = async (req, res) => {
  try {
    const sender =
      req.user.role === 'USER' ? 'USER' : 'CONTRACTOR';

    const message = await ChatMessage.create({
      room: req.params.roomId,
      sender,
      text: req.body.text,
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};
