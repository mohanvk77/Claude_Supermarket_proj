require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');

mongoose.connect(process.env.MONGODB_URI, { dbName: 'supermarket' }).then(async () => {
  console.log('✅ MongoDB Connected');

  // ─── Clear all existing data ───────────────────────────────────────────────
  await User.deleteMany({});
  await Product.deleteMany({});
  await Customer.deleteMany({});
  await Sale.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // ─── Users ─────────────────────────────────────────────────────────────────
  await User.insertMany([
    { username: 'admin',   password: bcrypt.hashSync('admin123',   10), name: 'Admin User',      role: 'admin'   },
    { username: 'manager', password: bcrypt.hashSync('manager123', 10), name: 'Bakery Manager',  role: 'manager' },
    { username: 'cashier', password: bcrypt.hashSync('cashier123', 10), name: 'Counter Cashier', role: 'cashier' },
    { username: 'demo',    password: bcrypt.hashSync('demo',        10), name: 'Demo User',       role: 'admin'   },
  ]);
  console.log('✅ Users created');

  // ─── Products ──────────────────────────────────────────────────────────────
  const products = await Product.insertMany([
    // Breads
    { name: 'White Sandwich Bread',     category: 'Breads',      price: 45,  stock: 80,  unit: 'loaf',  barcode: 'B001' },
    { name: 'Whole Wheat Bread',        category: 'Breads',      price: 55,  stock: 60,  unit: 'loaf',  barcode: 'B002' },
    { name: 'Multigrain Bread',         category: 'Breads',      price: 70,  stock: 40,  unit: 'loaf',  barcode: 'B003' },
    { name: 'Garlic Bread',             category: 'Breads',      price: 60,  stock: 50,  unit: 'piece', barcode: 'B004' },
    { name: 'Sourdough Bread',          category: 'Breads',      price: 120, stock: 25,  unit: 'loaf',  barcode: 'B005' },
    { name: 'Pav (6 pcs)',              category: 'Breads',      price: 30,  stock: 100, unit: 'pack',  barcode: 'B006' },
    { name: 'Burger Buns (4 pcs)',      category: 'Breads',      price: 40,  stock: 75,  unit: 'pack',  barcode: 'B007' },
    { name: 'Hot Dog Rolls (4 pcs)',    category: 'Breads',      price: 40,  stock: 60,  unit: 'pack',  barcode: 'B008' },

    // Cakes
    { name: 'Chocolate Truffle Cake',   category: 'Cakes',       price: 550, stock: 15,  unit: 'kg',    barcode: 'C001' },
    { name: 'Vanilla Sponge Cake',      category: 'Cakes',       price: 450, stock: 15,  unit: 'kg',    barcode: 'C002' },
    { name: 'Black Forest Cake',        category: 'Cakes',       price: 600, stock: 10,  unit: 'kg',    barcode: 'C003' },
    { name: 'Red Velvet Cake',          category: 'Cakes',       price: 650, stock: 10,  unit: 'kg',    barcode: 'C004' },
    { name: 'Butterscotch Cake',        category: 'Cakes',       price: 500, stock: 12,  unit: 'kg',    barcode: 'C005' },
    { name: 'Fruit Cake',               category: 'Cakes',       price: 480, stock: 8,   unit: 'kg',    barcode: 'C006' },
    { name: 'Cheesecake Slice',         category: 'Cakes',       price: 120, stock: 30,  unit: 'piece', barcode: 'C007' },
    { name: 'Cupcake (per piece)',       category: 'Cakes',       price: 60,  stock: 50,  unit: 'piece', barcode: 'C008' },

    // Pastries & Snacks
    { name: 'Croissant',                category: 'Pastries',    price: 55,  stock: 60,  unit: 'piece', barcode: 'P001' },
    { name: 'Chocolate Croissant',      category: 'Pastries',    price: 65,  stock: 50,  unit: 'piece', barcode: 'P002' },
    { name: 'Veg Puff',                 category: 'Pastries',    price: 30,  stock: 100, unit: 'piece', barcode: 'P003' },
    { name: 'Chicken Puff',             category: 'Pastries',    price: 40,  stock: 80,  unit: 'piece', barcode: 'P004' },
    { name: 'Paneer Puff',              category: 'Pastries',    price: 35,  stock: 70,  unit: 'piece', barcode: 'P005' },
    { name: 'Egg Puff',                 category: 'Pastries',    price: 25,  stock: 90,  unit: 'piece', barcode: 'P006' },
    { name: 'Cream Roll',               category: 'Pastries',    price: 35,  stock: 60,  unit: 'piece', barcode: 'P007' },
    { name: 'Eclair',                   category: 'Pastries',    price: 45,  stock: 40,  unit: 'piece', barcode: 'P008' },

    // Cookies & Biscuits
    { name: 'Butter Cookies (250g)',    category: 'Cookies',     price: 120, stock: 50,  unit: 'pack',  barcode: 'K001' },
    { name: 'Chocolate Chip Cookies',   category: 'Cookies',     price: 150, stock: 45,  unit: 'pack',  barcode: 'K002' },
    { name: 'Almond Cookies (250g)',    category: 'Cookies',     price: 180, stock: 35,  unit: 'pack',  barcode: 'K003' },
    { name: 'Coconut Macaroons (6pcs)', category: 'Cookies',     price: 80,  stock: 40,  unit: 'pack',  barcode: 'K004' },
    { name: 'Shortbread Cookies',       category: 'Cookies',     price: 130, stock: 30,  unit: 'pack',  barcode: 'K005' },

    // Muffins & Donuts
    { name: 'Blueberry Muffin',         category: 'Muffins',     price: 70,  stock: 45,  unit: 'piece', barcode: 'M001' },
    { name: 'Chocolate Muffin',         category: 'Muffins',     price: 70,  stock: 45,  unit: 'piece', barcode: 'M002' },
    { name: 'Banana Walnut Muffin',     category: 'Muffins',     price: 80,  stock: 35,  unit: 'piece', barcode: 'M003' },
    { name: 'Glazed Donut',             category: 'Muffins',     price: 50,  stock: 60,  unit: 'piece', barcode: 'M004' },
    { name: 'Chocolate Donut',          category: 'Muffins',     price: 55,  stock: 50,  unit: 'piece', barcode: 'M005' },
    { name: 'Strawberry Donut',         category: 'Muffins',     price: 55,  stock: 50,  unit: 'piece', barcode: 'M006' },

    // Beverages
    { name: 'Hot Coffee',               category: 'Beverages',   price: 80,  stock: 200, unit: 'cup',   barcode: 'V001' },
    { name: 'Cold Coffee',              category: 'Beverages',   price: 100, stock: 150, unit: 'cup',   barcode: 'V002' },
    { name: 'Hot Chocolate',            category: 'Beverages',   price: 90,  stock: 150, unit: 'cup',   barcode: 'V003' },
    { name: 'Masala Chai',              category: 'Beverages',   price: 40,  stock: 200, unit: 'cup',   barcode: 'V004' },
    { name: 'Fresh Orange Juice',       category: 'Beverages',   price: 80,  stock: 100, unit: 'glass', barcode: 'V005' },
    { name: 'Milkshake - Chocolate',    category: 'Beverages',   price: 120, stock: 80,  unit: 'glass', barcode: 'V006' },

    // Special Items
    { name: 'Cinnamon Roll',            category: 'Specials',    price: 90,  stock: 30,  unit: 'piece', barcode: 'S001' },
    { name: 'Danish Pastry',            category: 'Specials',    price: 85,  stock: 25,  unit: 'piece', barcode: 'S002' },
    { name: 'Brownie',                  category: 'Specials',    price: 80,  stock: 40,  unit: 'piece', barcode: 'S003' },
    { name: 'Tiramisu Slice',           category: 'Specials',    price: 150, stock: 20,  unit: 'piece', barcode: 'S004' },
    { name: 'Baklava (4 pcs)',          category: 'Specials',    price: 200, stock: 15,  unit: 'pack',  barcode: 'S005' },
  ]);
  console.log('✅ Products created:', products.length);

  // ─── Customers ─────────────────────────────────────────────────────────────
  const customers = await Customer.insertMany([
    { name: 'Ananya Krishnan',   phone: '9876501001', email: 'ananya@email.com',   address: 'Anna Nagar, Chennai'    },
    { name: 'Vikram Menon',      phone: '9876501002', email: 'vikram@email.com',    address: 'T Nagar, Chennai'       },
    { name: 'Divya Subramaniam', phone: '9876501003', email: 'divya@email.com',     address: 'Adyar, Chennai'         },
    { name: 'Karthik Rajan',     phone: '9876501004', email: 'karthik@email.com',   address: 'Velachery, Chennai'     },
    { name: 'Preethi Nair',      phone: '9876501005', email: 'preethi@email.com',   address: 'Mylapore, Chennai'      },
    { name: 'Arjun Pillai',      phone: '9876501006', email: 'arjun@email.com',     address: 'Nungambakkam, Chennai'  },
    { name: 'Sowmya Devi',       phone: '9876501007', email: 'sowmya@email.com',    address: 'Porur, Chennai'         },
    { name: 'Rahul Iyer',        phone: '9876501008', email: 'rahul@email.com',     address: 'Tambaram, Chennai'      },
    { name: 'Meenakshi Sundaram',phone: '9876501009', email: 'meenakshi@email.com', address: 'Chromepet, Chennai'     },
    { name: 'Bala Murugan',      phone: '9876501010', email: 'bala@email.com',      address: 'Guindy, Chennai'        },
    { name: 'Lavanya Sharma',    phone: '9876501011', email: 'lavanya@email.com',   address: 'Perambur, Chennai'      },
    { name: 'Suresh Babu',       phone: '9876501012', email: 'suresh@email.com',    address: 'Kodambakkam, Chennai'   },
    { name: 'Nithya Ramesh',     phone: '9876501013', email: 'nithya@email.com',    address: 'Sholinganallur, Chennai'},
    { name: 'Ganesh Kumar',      phone: '9876501014', email: 'ganesh@email.com',    address: 'Ambattur, Chennai'      },
    { name: 'Parvathi Mohan',    phone: '9876501015', email: 'parvathi@email.com',  address: 'Avadi, Chennai'         },
  ]);
  console.log('✅ Customers created:', customers.length);

  // ─── Sales (90 days) ───────────────────────────────────────────────────────
  const paymentMethods = ['Cash', 'UPI', 'Card', 'Credit'];
  const salesData = [];
  let invoiceCount = 1;

  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    // Bakeries are busiest in morning & weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const numSales = Math.floor(Math.random() * (isWeekend ? 15 : 10)) + 5;

    for (let s = 0; s < numSales; s++) {
      const numItems = Math.floor(Math.random() * 5) + 1;
      const items = [];
      let subtotal = 0;

      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 4) + 1;
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
      const discount  = Math.random() > 0.75 ? Math.round(subtotal * 0.05) : 0;
      const total     = subtotal - discount;

      salesData.push({
        invoiceNo:     `INV-${String(invoiceCount++).padStart(5, '0')}`,
        customerId:    customer._id,
        customerName:  customer.name,
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
  console.log('🎉 Bakery data seeded successfully!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('   admin   / admin123');
  console.log('   manager / manager123');
  console.log('   cashier / cashier123');
  console.log('   demo    / demo');
  process.exit(0);

}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
