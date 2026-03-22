# 🛒 SuperMart - Retail Reporting System

A full-stack supermarket retail dashboard with React frontend and Node.js/Express backend.

## 🗂️ Project Structure

```
supermarket-app/
├── backend/               # Node.js + Express API
│   ├── config/
│   │   └── database.js    # LowDB JSON database + seed data
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Login / me endpoints
│   │   ├── dashboard.js   # Stats, charts, summaries
│   │   ├── products.js    # Products CRUD
│   │   ├── sales.js       # Sales transactions
│   │   ├── customers.js   # Customers CRUD
│   │   └── reports.js     # Analytics & reports
│   ├── .env               # Environment variables
│   └── index.js           # Express server entry
│
└── frontend/              # React app
    └── src/
        ├── components/
        │   ├── Sidebar.js
        │   ├── Navbar.js
        │   └── StatCard.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── Sales.js
        │   ├── Products.js
        │   ├── Customers.js
        │   └── Reports.js
        ├── styles/
        │   └── global.css
        ├── utils/
        │   ├── api.js        # Axios instance with JWT
        │   └── helpers.js    # Format helpers
        ├── App.js
        └── index.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ installed
- npm or yarn

### 1. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file (already included):
```
PORT=5000
JWT_SECRET=supermarket_jwt_secret_key_2024
NODE_ENV=development
```

Start the backend:
```bash
npm start
# or for development with auto-reload:
npx nodemon index.js
```

Backend runs on: **http://localhost:5000**

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🔐 Default Login

| Field    | Value  |
|----------|--------|
| Username | demo   |
| Password | demo   |

---

## 📡 API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/auth/login                 | Login                    |
| GET    | /api/auth/me                    | Current user             |
| GET    | /api/dashboard/summary          | Stats overview           |
| GET    | /api/dashboard/sales-chart      | Daily sales chart        |
| GET    | /api/dashboard/category-sales   | Sales by category        |
| GET    | /api/dashboard/top-products     | Best selling products    |
| GET    | /api/dashboard/payment-methods  | Payment breakdown        |
| GET    | /api/products                   | List products            |
| POST   | /api/products                   | Add product              |
| PUT    | /api/products/:id               | Update product           |
| DELETE | /api/products/:id               | Delete product           |
| GET    | /api/sales                      | List sales (filterable)  |
| POST   | /api/sales                      | Create sale              |
| GET    | /api/customers                  | List customers           |
| POST   | /api/customers                  | Add customer             |
| PUT    | /api/customers/:id              | Update customer          |
| DELETE | /api/customers/:id              | Delete customer          |
| GET    | /api/reports/sales-summary      | Sales summary report     |
| GET    | /api/reports/product-performance| Product analytics        |
| GET    | /api/reports/category-performance| Category analytics      |

---

## ✨ Features

- 📊 **Dashboard** — Revenue stats, 30-day trend, category pie chart, payment breakdown
- 🛒 **Sales** — Browse all transactions with filters by date, customer, payment method
- 📦 **Products** — Full CRUD with stock tracking and category management
- 👥 **Customers** — Manage customers, view purchase history & total spend
- 📈 **Reports** — Date-range reports with daily trends, product & category performance

---

## 🛠️ Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React, React Router, Recharts, Axios |
| Backend  | Node.js, Express                    |
| Database | LowDB (JSON file-based)             |
| Auth     | JWT (jsonwebtoken + bcryptjs)       |
| Icons    | react-icons                         |
