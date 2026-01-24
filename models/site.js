const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  totalWork: Number,        // total units
  completedWork: Number,   // completed units
  deadline: Date,
  estimatedCost: Number,
  spentCost: Number,
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
