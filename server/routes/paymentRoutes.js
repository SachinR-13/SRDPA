const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
    verifyPaymentValidator,

} = require("../validators/paymentValidator");
const {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    failedPayment,
} = require("../controllers/paymentController");
/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create Razorpay Order
 *     description: Creates a new Razorpay order for wallet top-up.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Razorpay order created successfully.
 *       400:
 *         description: Invalid request.
 */
// Create Razorpay Order
router.post(
    "/create-order",
    authMiddleware,
    createOrder
);
/**
 * @swagger
 * /api/payment/verify-payment:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Verify Razorpay Payment
 *     description: Verifies the Razorpay payment signature and credits the wallet.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_P123456789
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_P123456789
 *               razorpay_signature:
 *                 type: string
 *                 example: 9d8f7a6b5c4d3e2f1
 *     responses:
 *       200:
 *         description: Payment verified successfully.
 *       400:
 *         description: Invalid payment.
 */
// Verify Razorpay Payment
router.post(
    "/verify-payment",
    authMiddleware,
    verifyPaymentValidator,
    validate,
    verifyPayment
);
/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get Payment History
 *     description: Returns all Razorpay payment history of the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history fetched successfully.
 */
// Payment History
router.get(
    "/history",
    authMiddleware,
    getPaymentHistory
);
/**
 * @swagger
 * /api/payment/failed:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Record Failed Payment
 *     description: Stores details of a failed payment attempt.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: order_P123456789
 *               reason:
 *                 type: string
 *                 example: Payment cancelled by user
 *     responses:
 *       200:
 *         description: Failed payment recorded successfully.
 */
// Failed Payment
router.post(
    "/failed",
    authMiddleware,
    failedPayment
);
module.exports = router;