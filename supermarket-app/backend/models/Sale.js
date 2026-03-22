const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  category:    String,
  price:       Number,
  qty:         Number,
  amount:      Number,
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNo:     { type: String, unique: true },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName:  { type: String, default: 'Walk-in Customer' },
  items:         [saleItemSchema],
  subtotal:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  date:          { type: String }, // YYYY-MM-DD for easy filtering
}, { timestamps: true });

// Auto-generate invoice number
saleSchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const count = await mongoose.model('Sale').countDocuments();
    this.invoiceNo = `INV-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
