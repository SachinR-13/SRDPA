# 💳 SRPay Backend API

A secure digital payment backend inspired by UPI applications like PhonePe, Google Pay, and Paytm.  
SRPay provides wallet management, money transfers, QR payments, notifications, admin analytics, and secure authentication.

---

# 🚀 Features

## 👤 Authentication
- User Registration
- User Login (JWT Authentication)
- Get User Profile
- Secure Password Hashing (bcrypt)
- Transaction PIN
- Change Transaction PIN
- PIN Lock after Multiple Failed Attempts
- PIN History (Prevent PIN Reuse)

---

## 💰 Wallet

- Wallet Creation
- Wallet Balance
- Add Money
- Send Money
- Wallet Statistics

---

## 💸 Transactions

- Send Money
- Receive Money
- Transaction History
- Filter Transactions
- Search Transactions

---

## 📱 QR Payments

- Generate Personal QR Code
- Scan QR Code
- Send Money using QR

---

## 🔔 Notifications

- Get Notifications
- Mark Notification as Read
- Mark All Notifications as Read
- Delete Notification

---

## 👨‍💼 Admin Module

- Dashboard
- View All Users
- Search Users
- Block User
- Unblock User
- Wallet Analytics
- Transaction Analytics
- Revenue Reports
- Executive Dashboard

---

## 💳 Payment Gateway

- Razorpay Order Creation
- Payment Verification

---

## 🔒 Security

- JWT Authentication
- bcrypt Password Hashing
- Transaction PIN
- PIN Lock Mechanism
- Helmet
- Mongo Sanitize
- XSS Protection
- HPP Protection
- Express Validator

---

# 🛠 Tech Stack

| Technology | Usage |
|------------|-------|
| Node.js | Runtime |
| Express.js | Backend Framework |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Razorpay | Payment Gateway |
| QRCode | QR Generation |
| Swagger | API Documentation |
| Jest | Testing |
| Supertest | API Testing |
| GitHub Actions | CI |

---

# 📁 Project Structure

```
SRPay/
│
├── server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── tests/
│
├── app.js
├── server.js
├── package.json
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/SachinR-13/SRpay.git
```

Go to server

```bash
cd SRpay/server
```

Install dependencies

```bash
npm install
```

Create `.env`

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET
JWT_EXPIRE=7d

RAZORPAY_KEY_ID=YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Run server

```bash
npm run dev
```

---

# 🧪 Testing

Run Tests

```bash
npm test
```

Run Coverage

```bash
npm run coverage
```

Current Status

```
Test Suites: 7 passed
Tests: 59 passed
```

---

# 📚 API Documentation

Swagger

```
http://localhost:5000/api-docs
```

---

# 📌 Main API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
POST /api/auth/set-transaction-pin
POST /api/auth/verify-transaction-pin
PUT  /api/auth/change-transaction-pin
```

---

## Wallet

```
GET  /api/wallet
POST /api/wallet/add-money
POST /api/wallet/send-money
```

---

## Transactions

```
GET /api/transactions
GET /api/transactions/:id
```

---

## Users

```
GET  /api/users/profile
POST /api/users/scan-qr
GET  /api/users/my-qr
```

---

## Notifications

```
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

---

## Payments

```
POST /api/payment/create-order
POST /api/payment/verify-payment
```

---

## Admin

```
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id/block
PATCH  /api/admin/users/:id/unblock

GET /api/admin/analytics/*
GET /api/admin/reports/*
```

---

# 🔄 Continuous Integration

GitHub Actions is configured to automatically

- Install Dependencies
- Run Jest Tests
- Verify Build

on every push to the **main** branch.

---

# 📊 Current Project Status

- ✅ Authentication
- ✅ Wallet
- ✅ QR Payment
- ✅ Razorpay Integration
- ✅ Notifications
- ✅ Admin Dashboard
- ✅ Analytics
- ✅ Reports
- ✅ Swagger Documentation
- ✅ Jest Testing
- ✅ GitHub Actions CI
- ✅ MongoDB Atlas

---

# 📈 Future Improvements

- Docker Support
- Docker Compose
- Email Verification
- OTP Login
- Two-Factor Authentication
- UPI Integration
- Mobile Application
- Kubernetes Deployment

---

# 👨‍💻 Author

**Sachin Kethavath**

GitHub

https://github.com/SachinR-13

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
