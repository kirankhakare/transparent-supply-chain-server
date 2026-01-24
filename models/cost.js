const mongoose = require('mongoose');

const costSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    estimated: Number,
    spent: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cost', costSchema);
