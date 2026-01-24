const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'contractor', 'supplier', 'user'],
      default: 'user'
    },
    isApproved: {
      type: Boolean,
      default: true // useful later for supplier approval
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
