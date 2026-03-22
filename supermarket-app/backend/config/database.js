const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../db.json');

// Delete corrupted db.json if user password hash is wrong
if (fs.existsSync(dbPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const demoUser = existing.users && existing.users.find(u => u.username === 'demo');
    if (!demoUser || !bcrypt.compareSync('demo', demoUser.password)) {
      console.log('🔄 Resetting database with correct credentials...');
      fs.unlinkSync(dbPath);
    }
  } catch (e) {
    console.log('🔄 Corrupted db.json found, resetting...');
    fs.unlinkSync(dbPath);
  }
}

const adapter = new FileSync(dbPath);
const db = low(adapter);

const defaultData = {
  users: [
    {
      id: 1,
      username: 'demo',
      password: bcrypt.hashSync('demo', 10),
      name: 'Demo User',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  products: [
    { id: 1, name: 'Basmati Rice 5kg', category: 'Grains', price: 450, stock: 120, unit: 'bag', barcode: 'P001', createdAt: '2024-01-01' },
    { id: 2, name: 'Sunflower Oil 1L', category: 'Oils', price: 185, stock: 85, unit: 'bottle', barcode: 'P002', createdAt: '2024-01-01' },
    { id: 3, name: 'Toor Dal 1kg', category: 'Pulses', price: 130, stock: 200, unit: 'kg', barcode: 'P003', createdAt: '2024-01-01' },
    { id: 4, name: 'Amul Butter 500g', category: 'Dairy', price: 260, stock: 45, unit: 'pack', barcode: 'P004', createdAt: '2024-01-01' },
    { id: 5, name: 'Surf Excel 1kg', category: 'Cleaning', price: 220, stock: 60, unit: 'pack', barcode: 'P005', createdAt: '2024-01-01' },
    { id: 6, name: 'Colgate Toothpaste', category: 'Personal Care', price: 95, stock: 150, unit: 'tube', barcode: 'P006', createdAt: '2024-01-01' },
    { id: 7, name: 'Maggi Noodles 12pk', category: 'Snacks', price: 144, stock: 90, unit: 'pack', barcode: 'P007', createdAt: '2024-01-01' },
    { id: 8, name: 'Bisleri Water 1L', category: 'Beverages', price: 20, stock: 300, unit: 'bottle', barcode: 'P008', createdAt: '2024-01-01' },
    { id: 9, name: 'Aashirvaad Atta 5kg', category: 'Grains', price: 280, stock: 75, unit: 'bag', barcode: 'P009', createdAt: '2024-01-01' },
    { id: 10, name: 'Parle-G Biscuits', category: 'Snacks', price: 10, stock: 500, unit: 'pack', barcode: 'P010', createdAt: '2024-01-01' },
    { id: 11, name: 'Lays Chips 26g', category: 'Snacks', price: 20, stock: 200, unit: 'pack', barcode: 'P011', createdAt: '2024-01-01' },
    { id: 12, name: 'Nescafe Classic 100g', category: 'Beverages', price: 320, stock: 40, unit: 'jar', barcode: 'P012', createdAt: '2024-01-01' },
  ],
  customers: [
    { id: 1, name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', address: 'Chennai', totalPurchases: 0, createdAt: '2024-01-05' },
    { id: 2, name: 'Priya Sharma', phone: '9876543211', email: 'priya@email.com', address: 'Mumbai', totalPurchases: 0, createdAt: '2024-01-08' },
    { id: 3, name: 'Arun Patel', phone: '9876543212', email: 'arun@email.com', address: 'Delhi', totalPurchases: 0, createdAt: '2024-01-10' },
    { id: 4, name: 'Meena Ravi', phone: '9876543213', email: 'meena@email.com', address: 'Bangalore', totalPurchases: 0, createdAt: '2024-01-12' },
    { id: 5, name: 'Karthik S', phone: '9876543214', email: 'karthik@email.com', address: 'Hyderabad', totalPurchases: 0, createdAt: '2024-01-15' },
  ],
  sales: generateSales(),
  nextIds: { product: 13, customer: 6, sale: 0 }
};

function generateSales() {
  const sales = [];
  const products = [
    { id: 1, name: 'Basmati Rice 5kg', price: 450, category: 'Grains' },
    { id: 2, name: 'Sunflower Oil 1L', price: 185, category: 'Oils' },
    { id: 3, name: 'Toor Dal 1kg', price: 130, category: 'Pulses' },
    { id: 4, name: 'Amul Butter 500g', price: 260, category: 'Dairy' },
    { id: 5, name: 'Surf Excel 1kg', price: 220, category: 'Cleaning' },
    { id: 7, name: 'Maggi Noodles 12pk', price: 144, category: 'Snacks' },
    { id: 8, name: 'Bisleri Water 1L', price: 20, category: 'Beverages' },
    { id: 10, name: 'Parle-G Biscuits', price: 10, category: 'Snacks' },
  ];
  const customers = [
    { id: 1, name: 'Rajesh Kumar' },
    { id: 2, name: 'Priya Sharma' },
    { id: 3, name: 'Arun Patel' },
    { id: 4, name: 'Meena Ravi' },
    { id: 5, name: 'Karthik S' },
  ];
  const paymentMethods = ['Cash', 'UPI', 'Card', 'Credit'];

  let id = 1;
  const now = new Date();

  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const numSales = Math.floor(Math.random() * 8) + 3;

    for (let s = 0; s < numSales; s++) {
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let total = 0;

      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        const amount = product.price * qty;
        total += amount;
        items.push({ productId: product.id, productName: product.name, category: product.category, price: product.price, qty, amount });
      }

      const customer = customers[Math.floor(Math.random() * customers.length)];
      const discount = Math.random() > 0.7 ? Math.round(total * 0.05) : 0;
      const netTotal = total - discount;

      sales.push({
        id: id++,
        invoiceNo: `INV-${String(id).padStart(5, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        items,
        subtotal: total,
        discount,
        total: netTotal,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        date: date.toISOString().split('T')[0],
        createdAt: date.toISOString(),
      });
    }
  }

  return sales;
}

db.defaults(defaultData).write();

module.exports = db;