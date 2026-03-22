require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB then seed
connectDB().then(() => seedDatabase());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/sales',     require('./routes/sales'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reports',   require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', db: 'MongoDB', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`✅ Supermarket API running on http://localhost:${PORT}`));

module.exports = app;
