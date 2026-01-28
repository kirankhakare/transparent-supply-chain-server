// models/expense.js
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
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidTo: {
      type: String,
      trim: true,
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
