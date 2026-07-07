const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {

    registerValidator,

    loginValidator,


} = require("../validators/authValidator");
const {
    registerUser,
    loginUser,
    getProfile,
    setTransactionPin,
    verifyTransactionPin,
    changeTransactionPin,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new SRPay user account and wallet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Rahul Kumar
 *               email:
 *                 type: string
 *                 example: rahul@gmail.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: Rahul@123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Validation failed.
 */
// Register User
router.post(
    "/register",
    registerValidator,
    validate,
    registerUser
);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticates the user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: rahul@gmail.com
 *               password:
 *                 type: string
 *                 example: Rahul@123
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
// Login User
router.post(
    "/login",
    loginValidator,
    validate,
    loginUser
);

// ================= PROTECTED ROUTES =================
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get logged in user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully.
 *       401:
 *         description: Unauthorized.
 */
// Get Logged-in User Profile
router.get("/profile", authMiddleware, getProfile);
/**
 * @swagger
 * /api/auth/set-transaction-pin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Set transaction PIN
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Transaction PIN set successfully.
 */
// Set Transaction PIN
router.post(
    "/set-transaction-pin",
    authMiddleware,
    setTransactionPin
);
/**
 * @swagger
 * /api/auth/verify-transaction-pin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify transaction PIN
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: PIN verified successfully.
 */
router.post(
    "/verify-transaction-pin",
    authMiddleware,
    verifyTransactionPin
);
/**
 * @swagger
 * /api/auth/change-transaction-pin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Change transaction PIN
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPin:
 *                 type: string
 *                 example: "1234"
 *               newPin:
 *                 type: string
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: Transaction PIN changed successfully.
 */
// Change Transaction PIN
router.post(
    "/change-transaction-pin",
    authMiddleware,
    changeTransactionPin
);
module.exports = router;