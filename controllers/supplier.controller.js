// controllers/supplier.controller.js
const MaterialOrder = require('../models/materialOrder');

exports.getMyOrders = async (req, res) => {
  const orders = await MaterialOrder.find({
    supplier: req.user.id
  })
    .populate('site user contractor');

  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const allowed = ['ACCEPTED', 'REJECTED', 'DISPATCHED', 'DELIVERED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await MaterialOrder.findOne({
    _id: req.params.id,
    supplier: req.user.id
  });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  res.json(order);
};
