// controllers/supplier.controller.js
const MaterialOrder = require('../models/materialOrder');

/* ================= GET MY ORDERS ================= */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await MaterialOrder.find({
      supplier: req.user.id,
    })
      .populate('site', 'projectName')
      .populate('contractor', 'username')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};


/* ================= ORDER DETAILS ================= */
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await MaterialOrder.findOne({
      _id: req.params.id,
      supplier: req.user.id,
    })
      .populate('site', 'projectName')
      .populate('contractor', 'username phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('ORDER DETAILS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

/* ================= ACCEPT ORDER ================= */
exports.acceptOrder = async (req, res) => {
  try {
    const order = await MaterialOrder.findOneAndUpdate(
      {
        _id: req.params.id,
        supplier: req.user.id,
        status: 'PENDING',
      },
      { status: 'ACCEPTED' },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        message: 'Order not found or already processed',
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept order' });
  }
};

/* ================= DISPATCH ORDER ================= */
exports.dispatchOrder = async (req, res) => {
  try {
    const order = await MaterialOrder.findOneAndUpdate(
      {
        _id: req.params.id,
        supplier: req.user.id,
        status: 'ACCEPTED',
      },
      { status: 'DISPATCHED' },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        message: 'Order must be ACCEPTED before dispatch',
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to dispatch order' });
  }
};

exports.deliverOrder = async (req, res) => {
  try {
    const { imageUrl, message } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        message: 'Delivery image is required',
      });
    }

    const order = await MaterialOrder.findOneAndUpdate(
      {
        _id: req.params.id,
        supplier: req.user.id, // 🔒 SECURITY
      },
      {
        status: 'DELIVERED',
        delivery: {
          imageUrl,            // ✅ STORED ORDER WISE
          message,
          deliveredAt: new Date(),
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    res.json({
      message: 'Order delivered successfully',
      order,
    });
  } catch (err) {
    console.error('DELIVERY ERROR:', err);
    res.status(500).json({
      message: 'Delivery failed',
    });
  }
};
