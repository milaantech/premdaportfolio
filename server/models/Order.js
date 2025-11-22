const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [{ bookId: String, title: String, price: Number, qty: { type: Number, default: 1 } }],
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  payment: { type: String, enum: ['cod','card','other'], default: 'cod' },
  amount: Number,
  status: { type: String, default: 'placed' },
  meta: Object
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
