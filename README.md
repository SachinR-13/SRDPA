# 💳 SRPay - Digital Payment Platform

A full-stack digital payment application inspired by modern UPI applications like **PhonePe**, **Google Pay**, and **Paytm**. Built with **React** (frontend) and **Node.js/Express** (backend), deployed on **Vercel** (frontend) and **Render** (backend) with **MongoDB Atlas**.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://srpay.vercel.app](https://srpay.vercel.app) |
| **Backend API** | [https://srpay-backend.onrender.com](https://srpay-backend.onrender.com) |
| **API Docs (Swagger)** | [https://srpay-backend.onrender.com/api-docs](https://srpay-backend.onrender.com/api-docs) |

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, Vite, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT, bcrypt |
| **Payment** | Razorpay |
| **QR** | QRCode, html5-qrcode |
| **API Docs** | Swagger (swagger-jsdoc, swagger-ui-express) |
| **Testing** | Jest, Supertest |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 📋 Features

### 👤 Authentication
- User Registration & Login
- JWT Authentication
- Password Hashing (bcrypt)
- User Profile Management
- Transaction PIN Management
- PIN Lock after Failed Attempts
- PIN History (Prevents PIN Reuse)

### 💰 Wallet
- Automatic Wallet Creation
- Add Money (via Razorpay)
- Wallet Balance
- Send Money
- Wallet Statistics

### 💸 Transactions
- Money Transfer
- Transaction History
- Search & Filter Transactions
- Mini Statement
- Recent Contacts

### 📱 QR Payments
- Generate Personal QR Code
- Scan QR Code
- Dynamic QR with Amount
- Send Money using QR

### 🔔 Notifications
- View Notifications
- Mark as Read
- Mark All as Read
- Delete Notifications

### 👨‍💼 Admin Dashboard
- User Management
- Block / Unblock Users
- Dashboard Analytics
- Transaction Reports
- Wallet Analytics

### 💳 Payment Gateway
- Razorpay Order Creation
- Payment Verification

---

## 🔒 Security

- JWT Authentication
- bcrypt Password Hashing
- Transaction PIN Security
- PIN Lock Mechanism
- Helmet (HTTP headers)
- XSS Protection
- MongoDB Sanitize
- HPP Protection
- Express Validator
- CORS Configuration

---

## 📂 Project Structure

```
SRpay
│
├── client/                     # React Frontend (Vercel)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js Backend (Render)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   ├── server.js
│   ├── Procfile
│   └── package.json
│
├── render.yaml                 # Render deployment config
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay test account

### 1. Clone the Repository

```bash
git clone https://github.com/SachinR-13/SRpay.git
cd SRpay
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
npm install
```

Edit `.env` with your credentials:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong random secret
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - From Razorpay dashboard

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

---

## 🚀 Deployment Guide

### Prerequisites
- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (GitHub login)
- [Render](https://render.com) account (GitHub login)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Razorpay](https://razorpay.com) account (test/live keys)

---

### Step 1: MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Go to **Database Access** → Create a database user (username + password)
3. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all - required for Render)
4. Go to **Clusters** → **Connect** → **Drivers**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/srpay?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy Backend to Render

#### Option A: Using render.yaml (Blueprint - Recommended)

1. Push your code to GitHub
2. In Render Dashboard → **Blueprint** → Connect your GitHub repo
3. Render will auto-detect `render.yaml` and create the service
4. Set the following **secret environment variables** in Render dashboard:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A strong random secret
   - `RAZORPAY_KEY_ID` - Razorpay test/live key
   - `RAZORPAY_KEY_SECRET` - Razorpay secret
   - `CLOUDINARY_CLOUD_NAME` - (optional) Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - (optional) Cloudinary API key
   - `CLOUDINARY_API_SECRET` - (optional) Cloudinary API secret
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - (optional) Email config

#### Option B: Manual Setup

1. In Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `srpay-backend`
   - **Environment**: `Node`
   - **Region**: `Singapore` (or nearest to your users)
   - **Branch**: `main`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Plan**: Free
4. Add environment variables (same as Option A)
5. Click **Create Web Service**

Your backend will be available at: `https://srpay-backend.onrender.com`

---

### Step 3: Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) → **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected from vercel.json)
   - **Output Directory**: `dist` (auto-detected from vercel.json)
5. Add environment variables:
   - `VITE_API_URL`: `https://srpay-backend.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay key ID
6. Click **Deploy**

Your frontend will be available at: `https://srpay.vercel.app`

---

### Step 4: Update CORS & Environment

After deployment, update the following:

1. **In Render** → Environment Variables:
   - `CLIENT_URL`: `https://srpay.vercel.app`
   - `API_URL`: `https://srpay-backend.onrender.com`

2. **In Vercel** → Environment Variables:
   - `VITE_API_URL`: `https://srpay-backend.onrender.com/api`

---

## 🔄 CI/CD

The project uses **GitHub Actions** for continuous integration:

- **On every push to `main`**:
  - Installs dependencies
  - Runs Jest tests
  - Verifies build

Both Vercel and Render automatically deploy from the `main` branch when changes are pushed.

---

## 🧪 Testing

```bash
cd server
npm test          # Run tests
npm run coverage  # Generate coverage report
```

### Current Test Status
```
✅ Test Suites: 7 Passed
✅ Tests: 59 Passed
```

---

## 📖 API Documentation

When the backend is running, visit:
- **Local**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Production**: [https://srpay-backend.onrender.com/api-docs](https://srpay-backend.onrender.com/api-docs)

---

## 🐳 Docker (Optional)

```bash
# Build image
docker build -t srpay-backend ./server

# Run with Docker Compose
docker compose up -d

# Stop
docker compose down
```

---

## 📊 Project Highlights

- ✅ Full-stack React + Node.js application
- ✅ JWT Authentication with Transaction PIN
- ✅ Wallet System with Razorpay Integration
- ✅ QR Code Payments (static & dynamic)
- ✅ Admin Dashboard with Analytics
- ✅ Notifications System
- ✅ 59 Automated Tests
- ✅ Swagger API Documentation
- ✅ Deployed on Vercel + Render
- ✅ MongoDB Atlas Database
- ✅ GitHub Actions CI/CD

---

## 👨‍💻 Author

**Sachin Kethavath**

- GitHub: [https://github.com/SachinR-13](https://github.com/SachinR-13)

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub!