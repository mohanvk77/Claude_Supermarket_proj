require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');

const seedDatabase = async (standalone = false) => {
  try {
    if (standalone) {
      await mongoose.connect(process.env.MONGODB_URI, { dbName: 'supermarket' });
      console.log('✅ MongoDB Connected');
    }

    console.log('🌱 Checking if seed needed...');
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('✅ Database already seeded, skipping.');
      if (standalone) process.exit(0);
      return;
    }

    console.log('🌱 Seeding database...');

    // Create demo user
    await User.create({ username: 'demo', password: 'demo', name: 'Demo User', role: 'admin' });
    console.log('✅ User created');

    // Create products
    const products = await Product.insertMany([
      { name: 'Basmati Rice 5kg',     category: 'Grains',        price: 450, stock: 120, unit: 'bag',    barcode: 'P001' },
      { name: 'Sunflower Oil 1L',     category: 'Oils',          price: 185, stock: 85,  unit: 'bottle', barcode: 'P002' },
      { name: 'Toor Dal 1kg',         category: 'Pulses',        price: 130, stock: 200, unit: 'kg',     barcode: 'P003' },
      { name: 'Amul Butter 500g',     category: 'Dairy',         price: 260, stock: 45,  unit: 'pack',   barcode: 'P004' },
      { name: 'Surf Excel 1kg',       category: 'Cleaning',      price: 220, stock: 60,  unit: 'pack',   barcode: 'P005' },
      { name: 'Colgate Toothpaste',   category: 'Personal Care', price: 95,  stock: 150, unit: 'tube',   barcode: 'P006' },
      { name: 'Maggi Noodles 12pk',   category: 'Snacks',        price: 144, stock: 90,  unit: 'pack',   barcode: 'P007' },
      { name: 'Bisleri Water 1L',     category: 'Beverages',     price: 20,  stock: 300, unit: 'bottle', barcode: 'P008' },
      { name: 'Aashirvaad Atta 5kg',  category: 'Grains',        price: 280, stock: 75,  unit: 'bag',    barcode: 'P009' },
      { name: 'Parle-G Biscuits',     category: 'Snacks',        price: 10,  stock: 500, unit: 'pack',   barcode: 'P010' },
      { name: 'Lays Chips 26g',       category: 'Snacks',        price: 20,  stock: 200, unit: 'pack',   barcode: 'P011' },
      { name: 'Nescafe Classic 100g', category: 'Beverages',     price: 320, stock: 40,  unit: 'jar',    barcode: 'P012' },
    ]);
    console.log('✅ Products created:', products.length);

    // Create customers
    const customers = await Customer.insertMany([
      { name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', address: 'Chennai'   },
      { name: 'Priya Sharma', phone: '9876543211', email: 'priya@email.com',  address: 'Mumbai'    },
      { name: 'Arun Patel',   phone: '9876543212', email: 'arun@email.com',   address: 'Delhi'     },
      { name: 'Meena Ravi',   phone: '9876543213', email: 'meena@email.com',  address: 'Bangalore' },
      { name: 'Karthik S',    phone: '9876543214', email: 'karthik@email.com',address: 'Hyderabad' },
    ]);
    console.log('✅ Customers created:', customers.length);

    // Generate 90 days of clean sales data
    const paymentMethods = ['Cash', 'UPI', 'Card', 'Credit'];
    const salesData = [];
    let invoiceCount = 1;

    for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];
      const numSales = Math.floor(Math.random() * 8) + 3;

      for (let s = 0; s < numSales; s++) {
        const numItems = Math.floor(Math.random() * 4) + 1;
        const items = [];
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 5) + 1;
          const amount = product.price * qty;
          subtotal += amount;
          items.push({
            productId:   product._id,
            productName: product.name,
            category:    product.category,
            price:       product.price,
            qty,
            amount
          });
        }

        const customer  = customers[Math.floor(Math.random() * customers.length)];
        const discount  = Math.random() > 0.7 ? Math.round(subtotal * 0.05) : 0;
        const total     = subtotal - discount;

        salesData.push({
          invoiceNo:    `INV-${String(invoiceCount++).padStart(5, '0')}`,
          customerId:   customer._id,
          customerName: customer.name,
          items,
          subtotal,
          discount,
          total,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          date:          dateStr,
          createdAt:     date,
        });
      }
    }

    await Sale.insertMany(salesData);
    console.log('✅ Sales created:', salesData.length);
    console.log('🎉 Database seeded successfully!');

    if (standalone) process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    if (standalone) process.exit(1);
  }
};

// If run directly: node seed.js
if (require.main === module) {
  seedDatabase(true);
} else {
  module.exports = seedDatabase;
}
