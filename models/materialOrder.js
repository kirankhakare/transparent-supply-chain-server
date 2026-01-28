const mongoose = require('mongoose');

const materialOrderSchema = new mongoose.Schema({
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
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  materials: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unit: { type: String, required: true },
    },
  ],
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'],
    default: 'PENDING',
  },
  orderNumber: {
    type: String,
    unique: true,
  },
  deliveryImage: String,
  supplierMessage: String,
  delivery: {
  imageUrl: String,
  message: String,
  deliveredAt: Date,
},
}, { timestamps: true });

/* 🔥 SAFE PRE SAVE HOOK */
materialOrderSchema.pre('save', function () {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
});

module.exports = mongoose.model('MaterialOrder', materialOrderSchema);
