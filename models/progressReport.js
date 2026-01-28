// models/progressReport.js
const mongoose = require('mongoose');

const progressReportSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  percentageCompleted: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  stage: String, // foundation, slab, finishing
  remarks: String,
}, { timestamps: true });

module.exports = mongoose.model('ProgressReport', progressReportSchema);
