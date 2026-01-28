const MaterialOrder = require('../models/materialOrder');

/* ===============================
   GET SUPPLIER ORDERS
================================ */
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
    console.error('SUPPLIER ORDERS ERROR', err);
    res.status(500).json({ message: 'Failed to load orders' });
  }
};

/* ===============================
   UPDATE ORDER STATUS
================================ */
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const allowedStatus = ['ACCEPTED', 'REJECTED', 'DELIVERED'];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await MaterialOrder.findOne({
      _id: req.params.id,
      supplier: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 🔒 RULES
    if (order.status === 'REJECTED' || order.status === 'DELIVERED') {
      return res
        .status(400)
        .json({ message: 'Order already finalized' });
    }

    if (order.status === 'PENDING' && status === 'DELIVERED') {
      return res
        .status(400)
        .json({ message: 'Accept order first' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated',
      order,
    });
  } catch (err) {
    console.error('ORDER STATUS UPDATE ERROR', err);
    res.status(500).json({ message: 'Failed to update order' });
  }
};
