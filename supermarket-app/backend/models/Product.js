const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price:    { type: Number, required: true, min: 0 },
  stock:    { type: Number, default: 0, min: 0 },
  unit:     { type: String, default: 'unit' },
  barcode:  { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
