const MaterialOrder = require('../models/materialOrder');
const imagekit = require('../utils/imagekit');

/**
 * GET: Supplier - My Orders
 */
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
    console.error('SUPPLIER GET ORDERS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch supplier orders' });
  }
};

/**
 * PATCH: Accept / Reject Order
 */
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await MaterialOrder.findOne({
      _id: req.params.orderId,
      supplier: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 🔒 Prevent re-update
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        message: `Order already ${order.status.toLowerCase()}`,
      });
    }

    order.status = status;
    await order.save();

    res.json({
      message: `Order ${status.toLowerCase()} successfully`,
      order,
    });
  } catch (err) {
    console.error('ORDER STATUS UPDATE ERROR:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

/**
 * POST: Deliver Order (Upload Image + Mark Delivered)
 */
exports.deliverOrder = async (req, res) => {
  const { message } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Delivery image required' });
  }

  try {
    const order = await MaterialOrder.findOne({
      _id: req.params.orderId,
      supplier: req.user.id,
      status: 'ACCEPTED',
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found or not accepted',
      });
    }

    // 📸 Upload image to ImageKit
    const upload = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `delivery-${order._id}.jpg`,
    });

    order.status = 'DELIVERED';
    order.delivery = {
      imageUrl: upload.url,
      message,
      deliveredAt: new Date(),
    };

    await order.save();

    res.json({
      message: 'Order delivered successfully',
      order,
    });
  } catch (err) {
    console.error('DELIVERY ERROR:', err);
    res.status(500).json({ message: 'Delivery failed' });
  }
};

/**
 * GET: Assigned Orders (Supplier)
 */
exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await MaterialOrder.find({
      supplier: req.user.id,
    })
      .populate('site', 'projectName')
      .populate('contractor', 'username phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('SUPPLIER FETCH ORDERS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.getSupplierSites = async (req, res) => {
  try {
    const sites = await MaterialOrder.find({
      supplier: req.user.id,
    })
      .populate('site', 'projectName')
      .select('site');

    const unique = new Map();
    sites.forEach(o => {
      if (o.site) unique.set(o.site._id.toString(), o.site);
    });

    res.json(Array.from(unique.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load sites' });
  }
};
