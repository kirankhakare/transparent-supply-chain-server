const MaterialOrder = require('../models/materialOrder');

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await MaterialOrder.find({
      user: req.user.id,
    })
      .populate('supplier', 'username phone')
      .populate('site', 'projectName');

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await MaterialOrder.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate('supplier', 'username phone email')
      .populate('site', 'projectName address');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};
