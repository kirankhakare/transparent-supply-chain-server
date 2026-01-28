const MaterialOrder = require('../models/materialOrder');
const imagekit = require('../utils/imagekit');
const User = require('../models/User');

exports.getSupplierOrders = async (req, res) => {
  try {
    const orders = await MaterialOrder.find({
      supplier: req.user.id,
    })
      .populate('site', 'projectName')
      .populate('contractor', 'username phone')
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
  const { orderId } = req.params;

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await MaterialOrder.findOne({
      _id: orderId,
      supplier: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

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

exports.deliverOrder = async (req, res) => {
  const { message, siteName } = req.body;
  const { orderId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Delivery image required' });
  }

  if (!siteName) {
    return res.status(400).json({ message: 'Site name is required' });
  }

  try {
    const order = await MaterialOrder.findOne({
      _id: orderId,
      supplier: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'ACCEPTED') {
      return res.status(400).json({
        message: 'Only accepted orders can be delivered',
      });
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({
        message: 'Order already delivered',
      });
    }

    const upload = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `delivery-${order._id}.jpg`,
    });

    order.status = 'DELIVERED';
    order.delivery = {
      imageUrl: upload.url,
      siteName,
      message,
      deliveredAt: new Date(),
    };

    order.deliveryImage = upload.url; // optional

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



exports.getSupplierSites = async (req, res) => {
  try {
    // 1️⃣ supplier च्या orders मधून site user IDs काढ
    const orders = await MaterialOrder.find({
      supplier: req.user.id,
    }).select('site'); // site = userId

    const siteIds = [
      ...new Set(
        orders
          .map(o => o.site?.toString())
          .filter(Boolean)
      ),
    ];

    if (siteIds.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Users (sites) fetch कर
    const sites = await User.find({
      _id: { $in: siteIds },
      role: 'user',
    }).select('username');

    res.json(sites);
  } catch (err) {
    console.error('SUPPLIER SITES ERROR:', err);
    res.status(500).json({ message: 'Failed to load sites' });
  }
};
