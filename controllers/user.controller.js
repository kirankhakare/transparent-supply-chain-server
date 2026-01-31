const Site = require('../models/site');
const MaterialOrder = require('../models/materialOrder');
const Progress = require('../models/progressReport');
const Expense = require('../models/expense');
/* ===============================
   GET USER PROJECT (Dashboard)
================================ */
exports.getMyProject = async (req, res) => {
  try {
    const site = await Site.findOne({ user: req.user.id })
      .populate('contractor', 'username phone')
      .lean();

    if (!site) {
      return res.json(null);
    }

    res.json({
      _id: site._id,
      projectName: site.projectName,
      completedWork: site.completedWork || 0,
      totalWork: site.totalWork || 100,
      estimatedCost: site.estimatedCost || 0,
      spentCost: site.spentCost || 0,
      contractor: site.contractor,
    });
  } catch (err) {
    console.error('GET USER PROJECT ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

/* ===============================
   GET USER ORDERS (Materials, Images)
================================ */
exports.getMyOrders = async (req, res) => {
  try {
    // 🔥 find user site first
    const site = await Site.findOne({ user: req.user.id });

    if (!site) {
      return res.json([]);
    }

    const orders = await MaterialOrder.find({ site: site._id })
      .populate('supplier', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('GET USER ORDERS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/* ===============================
   GET PROGRESS HISTORY (Optional)
================================ */
exports.getProgressHistory = async (req, res) => {
  try {
    const site = await Site.findOne({ user: req.user.id });

    if (!site) {
      return res.json([]);
    }

    const history = await Progress.find({ site: site._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    console.error('GET PROGRESS HISTORY ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch progress history' });
  }
};

/* ================= USER COST + EXPENSE DETAILS ================= */
exports.getMyCostDetails = async (req, res) => {
  try {
    // 1️⃣ Find user's site
    const site = await Site.findOne({ user: req.user.id });

    if (!site) {
      return res.status(404).json({ message: 'No site assigned' });
    }

    // 2️⃣ Fetch all expenses of this site
    const expenses = await Expense.find({ site: site._id })
      .sort({ createdAt: -1 });

    // 3️⃣ Calculate total spent
    const spentCost = expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const estimatedCost = site.estimatedCost || 0;

    res.json({
      siteId: site._id,
      estimatedCost,
      spentCost,
      remainingCost: estimatedCost - spentCost,
      percentageUsed:
        estimatedCost > 0
          ? ((spentCost / estimatedCost) * 100).toFixed(1)
          : 0,
      expenses, // 👈 FULL LIST
    });
  } catch (err) {
    console.error('USER COST DETAILS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch cost details' });
  }
};

