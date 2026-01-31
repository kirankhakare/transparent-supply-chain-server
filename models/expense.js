const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
    },

    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      enum: ['MATERIALS', 'LABOR', 'EQUIPMENT', 'TRANSPORT', 'OTHER'],
      required: true,
    },

    description: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paidTo: {
      type: String,
    },

    payment: {
      type: String,
      enum: ['CASH', 'BANK', 'ONLINE'],
      default: 'CASH',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
