const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Site = require('../models/site');
const Cost = require('../models/cost');
const Assignment = require('../models/assignment');
const { getProjectStatus } = require('../utils/projectStatus');

/* CREATE USER BY ADMIN */
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (!['contractor', 'supplier', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      isApproved: role === 'supplier' ? false : true
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

//user data fetch
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalContractors = await User.countDocuments({ role: 'contractor' });
    const totalSuppliers = await User.countDocuments({ role: 'supplier' });

    res.json({
      users: totalUsers,
      contractors: totalContractors,
      suppliers: totalSuppliers,
      activeSessions: 0 // later implement
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

//User Analytics graph..
exports.getUserAnalytics = async (req, res) => {
  try {
    const type = req.query.type || 'yearly';

    let groupStage = {};
    let sortStage = { _id: 1 };

    if (type === 'yearly') {
      groupStage = {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      };
    }

    else if (type === 'monthly') {
      groupStage = {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          count: { $sum: 1 },
        },
      };
    }

    else if (type === 'weekly') {
      groupStage = {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      };
    }

    const analytics = await User.aggregate([
      {
        $match: {
          role: 'user',
        },
      },
      groupStage,
      { $sort: sortStage },
    ]);

    res.json({
      type,
      data: analytics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Analytics fetch failed' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })   // ✅ ONLY USERS
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
      isApproved,
    });

    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Status update failed' });
  }
};

exports.getUserReport = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select(
      'username role isApproved'
    );

    const assignment = await Assignment.findOne({ user: userId })
      .populate('contractor', 'username');

    res.json({
      user: {
        name: user.username,
        email: `${user.username}@example.com`,
        status: user.isApproved ? 'active' : 'inactive',
      },
      contractor: assignment
        ? {
            _id: assignment.contractor._id,
            name: assignment.contractor.username,
          }
        : null,
      site: {
        totalWork: 100,
        completedWork: 40,
        deadline: '2025-03-31',
      },
      cost: {
        estimated: 500000,
        spent: 180000,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Report fetch failed' });
  }
};

exports.userAnalytics = async (req, res) => {
  try {
    const type = req.query.type || 'yearly';

    let groupBy;
    if (type === 'weekly') {
      groupBy = { $dayOfWeek: '$createdAt' };
    } else if (type === 'monthly') {
      groupBy = { $dayOfMonth: '$createdAt' };
    } else {
      groupBy = { $month: '$createdAt' };
    }

    const data = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ type, data });
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.getContractors = async (req, res) => {
  try {
    const contractors = await User.find({ role: 'contractor' })
      .select('_id username');

    res.json(contractors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contractors' });
  }
};

exports.assignContractor = async (req, res) => {
  const { userId, contractorId } = req.body;

  try {
    // 1️⃣ Assignment (admin view)
    await Assignment.findOneAndDelete({ user: userId });
    await Assignment.create({ user: userId, contractor: contractorId });

    // 2️⃣ Site (contractor + real system)
    await Site.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        contractor: contractorId,
        totalWork: 100,
        completedWork: 0,
        deadline: new Date('2025-03-31'),
      },
      { upsert: true }
    );

    res.json({ message: 'Contractor assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Assignment failed' });
  }
};

exports.getContractorsWithUsers = async (req, res) => {
  try {
    // 1️⃣ Get all contractors
    const contractors = await User.find({ role: 'contractor' })
      .select('_id username isApproved');

    // 2️⃣ Get assignments with user populated
    const assignments = await Assignment.find()
      .populate('user', 'username isApproved')
      .populate('contractor', '_id');

    // 3️⃣ Build response
    const result = contractors.map((contractor) => {
      const contractorAssignments = assignments.filter(
        (a) =>
          a.contractor &&
          a.contractor._id.toString() === contractor._id.toString()
      );

      return {
        id: contractor._id,
        name: contractor.username,
        status: contractor.isApproved ? 'ACTIVE' : 'INACTIVE',

        users: contractorAssignments.map((a) => ({
          userId: a.user._id,
          userName: a.user.username,
          userStatus: a.user.isApproved ? 'ACTIVE' : 'INACTIVE',

          // TEMP (later site table)
          progress: 40,
          deadline: '2025-03-31',
          projectStatus: 'IN_PROGRESS',
        })),
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contractors' });
  }
};

exports.getUsersWithProjectStatus = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });

    const sites = await Site.find()
      .populate('user', 'username')
      .populate('contractor', 'username');

    const result = users.map((user) => {
      const site = sites.find(
        (s) => s.user._id.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        name: user.username,
        projectStatus: getProjectStatus(site),
        site: site
          ? {
              totalWork: site.totalWork,
              completedWork: site.completedWork,
              deadline: site.deadline,
              contractor: site.contractor?.username || null,
            }
          : null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'supplier' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
};

// UPDATE SUPPLIER STATUS
exports.updateSupplierStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
      isApproved,
    });

    res.json({ message: 'Supplier status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Supplier status update failed' });
  }
};

exports.supplierPerformance = async (req, res) => {
  const stats = await MaterialOrder.aggregate([
    {
      $group: {
        _id: '$supplier',
        totalOrders: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] }
        }
      }
    }
  ]);

  res.json(stats);
};
