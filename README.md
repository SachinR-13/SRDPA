# 💳 SRPay Backend API

A secure digital payment backend inspired by modern UPI applications like **PhonePe**, **Google Pay**, and **Paytm**.

SRPay enables secure wallet management, QR-based payments, transaction tracking, notifications, payment gateway integration, and an admin dashboard using a scalable REST API architecture.

---

# 🚀 Key Features

### 👤 Authentication
- User Registration & Login
- JWT Authentication
- Password Hashing (bcrypt)
- User Profile
- Transaction PIN Management
- PIN Lock after Failed Attempts
- PIN History (Prevents PIN Reuse)

### 💰 Wallet
- Automatic Wallet Creation
- Add Money
- Wallet Balance
- Send Money
- Wallet Statistics

### 💸 Transactions
- Money Transfer
- Transaction History
- Search & Filter Transactions

### 📱 QR Payments
- Generate Personal QR Code
- Scan QR Code
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

# 🔒 Security

- JWT Authentication
- bcrypt Password Hashing
- Transaction PIN Security
- PIN Lock Mechanism
- Helmet
- XSS Protection
- MongoDB Sanitize
- HPP Protection
- Express Validator

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Payment | Razorpay |
| QR | QRCode |
| API Docs | Swagger |
| Testing | Jest, Supertest |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Security | Helmet, XSS-Clean, Mongo Sanitize, HPP |

---

# 📂 Project Structure

```
SRPay
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── tests
│   ├── utils
│   ├── validators
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/SachinR-13/SRpay.git
```

Move to backend

```bash
cd SRpay/server
```

Install dependencies

```bash
npm install
```

Create a `.env` file using `.env.example`

Start the server

```bash
npm run dev
```

---

# 🐳 Docker

Build Docker Image

```bash
docker build -t srpay-backend .
```

Run using Docker Compose

```bash
docker compose up -d
```

Stop the container

```bash
docker compose down
```

View logs

```bash
docker logs srpay-backend
```

---

# 🧪 Testing

Run Tests

```bash
npm test
```

Generate Coverage Report

```bash
npm run coverage
```

### Current Test Status

```
✅ Test Suites: 7 Passed
✅ Tests: 59 Passed
```

---

# 🔄 Continuous Integration

GitHub Actions automatically:

- Installs Dependencies
- Runs Jest Tests
- Verifies Build
- Executes on Every Push to `main`

---

# 📖 API Documentation

Swagger UI

```
http://localhost:5000/api-docs
```

---

# 📊 Project Highlights

- ✅ JWT Authentication
- ✅ Wallet System
- ✅ QR Payments
- ✅ Razorpay Integration
- ✅ Admin Dashboard
- ✅ Notifications
- ✅ Secure Transaction PIN
- ✅ Swagger Documentation
- ✅ 59 Automated Tests
- ✅ Dockerized Backend
- ✅ GitHub Actions CI/CD
- ✅ MongoDB Atlas

---

# 🚀 Future Enhancements

- Email Verification
- OTP Authentication
- Two-Factor Authentication (2FA)
- UPI Integration
- Mobile Application
- Kubernetes Deployment

---

# 👨‍💻 Author

**Sachin Kethavath**

GitHub: https://github.com/SachinR-13

---

## ⭐ If you found this project useful, please consider giving it a star!is project useful, consider giving it a ⭐ on GitHub.
