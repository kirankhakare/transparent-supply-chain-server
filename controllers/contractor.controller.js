// controllers/contractor.controller.js
const mongoose = require('mongoose');

const User = require('../models/User');
const Assignment = require('../models/assignment');
const Site = require('../models/site');
const Progress = require('../models/progressReport');
const MaterialOrder = require('../models/materialOrder');
const Expense = require('../models/expense');

exports.getAssignedSites = async (req, res) => {
  try {
    const contractorId = new mongoose.Types.ObjectId(req.user.id);

    const sites = await Site.find({ contractor: contractorId })
      .populate('user', 'username');

    res.json({ sites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load sites' });
  }
};

exports.updateProgress = async (req, res) => {
  const { siteId, percentageCompleted, stage, remarks } = req.body;

  try {
    // ✅ validation
    if (
      typeof percentageCompleted !== 'number' ||
      percentageCompleted < 0 ||
      percentageCompleted > 100
    ) {
      return res.status(400).json({
        message: 'percentageCompleted must be between 0 and 100',
      });
    }

    // ✅ site ownership check
    const site = await Site.findOne({
      _id: siteId,
      contractor: req.user.id,
    });

    if (!site) {
      return res.status(403).json({
        message: 'You are not assigned to this site',
      });
    }

    // ✅ last progress (same site + same contractor)
    const lastProgress = await Progress.findOne({
      site: siteId,
      contractor: req.user.id,
    }).sort({ createdAt: -1 });

    if (
      lastProgress &&
      percentageCompleted < lastProgress.percentageCompleted
    ) {
      return res.status(400).json({
        message: 'Progress cannot be less than previous update',
      });
    }

    // ✅ auto fix
    if (!site.totalWork || site.totalWork <= 0) {
      site.totalWork = 100;
    }

    const completedWork = Math.round(
      (percentageCompleted / 100) * site.totalWork
    );

    site.completedWork = completedWork;
    await site.save();

    // ✅ save progress (site-wise)
    await Progress.create({
      site: siteId,
      contractor: req.user.id,
      percentageCompleted,
      stage,
      remarks,
    });

    res.json({
      message: 'Progress updated successfully',
      completedWork,
      totalWork: site.totalWork,
    });
  } catch (err) {
    console.error('UPDATE PROGRESS ERROR:', err);
    res.status(500).json({ message: 'Progress update failed' });
  }
};

exports.getProgressHistory = async (req, res) => {
  try {
    const { siteId } = req.params;

    // 🔒 ensure contractor owns this site
    const site = await Site.findOne({
      _id: siteId,
      contractor: req.user.id,
    });

    if (!site) {
      return res.status(403).json({
        message: 'Access denied for this site',
      });
    }

    const reports = await Progress.find({
      site: siteId,
      contractor: req.user.id, // ✅ VERY IMPORTANT
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

exports.getUserProgress = async (req, res) => {
  const { siteId } = req.params;

  try {
    const site = await Site.findOne({
      _id: siteId,
      user: req.user.id, // 🔒 site owner
    });

    if (!site) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const progress = await Progress.find({ site: siteId })
      .sort({ createdAt: -1 });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

exports.createMaterialOrder = async (req, res) => {
  try {
    const { siteId, supplierId, materials } = req.body;

    if (!siteId || !supplierId || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        message: 'Invalid request data',
      });
    }

    const site = await Site.findOne({
  _id: siteId,
  contractor: req.user.id,
});

if (!site) {
  return res.status(403).json({
    message: 'You are not assigned to this site',
  });
}

    // ✅ SANITIZE + VALIDATE MATERIALS
    const sanitizedMaterials = materials.map((m) => {
      const quantity = Number(m.quantity);

      if (
        !m.name ||
        !m.unit ||
        isNaN(quantity) ||
        quantity <= 0
      ) {
        throw new Error('Invalid material data');
      }

      return {
        name: m.name.trim(),
        unit: m.unit.trim(),
        quantity,
      };
    });

    const order = await MaterialOrder.create({
      site: siteId,
      contractor: req.user.id,
      supplier: supplierId,
      materials: sanitizedMaterials,
      status: 'PENDING',
    });

    res.status(201).json({
      message: 'Material order created successfully',
      order,
    });
  } catch (err) {
    console.error('CREATE ORDER ERROR:', err.message);
    res.status(400).json({
      message: err.message || 'Failed to create material order',
    });
  }
};
// controllers/contractor.controller.js
exports.addExpense = async (req, res) => {
  try {
    const {
      site,
      category,
      description,
      amount,
      paidTo,
      payment,
    } = req.body;

    // 🔒 BASIC REQUIRED VALIDATION
    if (!site || !amount) {
      return res.status(400).json({
        message: 'Site and amount are required',
      });
    }

    // ✅ ALLOWED CATEGORIES
    const ALLOWED_CATEGORIES = [
      'MATERIALS',
      'LABOR',
      'EQUIPMENT',
      'TRANSPORT',
      'OTHER',
    ];

    // 🔥 Normalize category
    let finalCategory = category?.toUpperCase();

    if (!ALLOWED_CATEGORIES.includes(finalCategory)) {
      finalCategory = 'OTHER'; // fallback safety
    }

    // 🔢 Amount validation
    const finalAmount = Number(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({
        message: 'Amount must be a valid number',
      });
    }

    const expense = await Expense.create({
      site,
      contractor: req.user.id, // 🔥 IMPORTANT
      category: finalCategory,
      description: description || 'Expense',
      amount: finalAmount,
      paidTo,
      payment: payment || 'CASH',
    });

    res.status(201).json({
      message: 'Expense added successfully',
      expense,
    });
  } catch (err) {
    console.error('ADD EXPENSE ERROR:', err);
    res.status(500).json({
      message: err.message || 'Failed to add expense',
    });
  }
};


exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      contractor: req.user.id,
    };

    if (status) {
      filter.status = status;
    }

    const orders = await MaterialOrder.find(filter)
      .populate('supplier', 'username')
      .populate('site', 'projectName')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.getSiteCostSummary = async (req, res) => {
  try {
    const siteId = req.params.siteId;

    // contractor ownership check
    const site = await Site.findOne({
      _id: siteId,
      contractor: req.user.id,
    });

    if (!site) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const expenses = await Expense.find({ site: siteId });

    const totalSpent = expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    res.json({
      siteId,
      totalSpent,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ message: 'Cost fetch failed' });
  }
};

// controllers/contractor.controller.js

exports.getMyExpenses = async (req, res) => {
  try {
    const { siteId } = req.query;

    const filter = {
      contractor: req.user.id, // 🔒 security: only own expenses
    };

    // ✅ Site-wise filtering if siteId provided
    if (siteId) {
      filter.site = siteId;
    }

    const expenses = await Expense.find(filter)
      .populate('site', 'projectName')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error('GET EXPENSE ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

exports.getUserExpenses = async (req, res) => {
  try {
    const site = await Site.findOne({
      user: req.user.id,
    });

    if (!site) {
      return res.json([]);
    }

    const expenses = await Expense.find({
      site: site._id,
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error('USER EXPENSE ERROR:', err);
    res.status(500).json({ message: 'Failed to load expenses' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      contractor: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    Object.assign(expense, req.body);
    await expense.save();

    res.json({
      message: 'Expense updated successfully',
      expense,
    });
  } catch (err) {
    console.error('UPDATE EXPENSE ERROR:', err);
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await MaterialOrder.find({
    contractor: req.user.id,
  })
  .populate('supplier', 'username')
  .populate('site', 'projectName');

  res.json(orders);
};


exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'supplier' })
      .select('_id username');

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load suppliers' });
  }
};





