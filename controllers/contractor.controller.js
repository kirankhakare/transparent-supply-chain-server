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
    if (percentageCompleted === undefined) {
      return res.status(400).json({ message: 'percentageCompleted required' });
    }

    const site = await Site.findById(siteId);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // 🔥 Auto-fix old data
    if (!site.totalWork || site.totalWork <= 0) {
      site.totalWork = 100;
    }

    const completedWork = Math.round(
      (percentageCompleted / 100) * site.totalWork
    );

    site.completedWork = completedWork;
    await site.save();

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
    const reports = await Progress.find({
      site: req.params.siteId,
      contractor: req.user.id
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch {
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

    // 🔒 basic validation
    if (!site || !category || !amount) {
      return res.status(400).json({
        message: 'Site, category and amount are required',
      });
    }

    const expense = await Expense.create({
      site,
      contractor: req.user.id, // 🔥 MOST IMPORTANT
      category,
      description,
      amount,
      paidTo,
      payment,
    });

    res.status(201).json({
      message: 'Expense added successfully',
      expense,
    });
  } catch (err) {
    console.error('ADD EXPENSE ERROR:', err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
};

exports.getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      contractor: req.user.id,
    })
      .populate('site', 'projectName')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error('GET EXPENSE ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
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
  try {
    const orders = await MaterialOrder.find({
      contractor: req.user.id,
    })
      .populate('supplier', 'username')
      .populate('site', 'projectName');

    res.status(200).json(orders); // ✅ THIS WAS OK
  } catch (err) {
    console.error('GET ORDERS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
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





