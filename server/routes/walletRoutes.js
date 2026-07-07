const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
    addMoneyValidator,
    sendMoneyValidator,
    withdrawMoneyValidator,
    balanceValidator,
} = require("../validators/walletValidator");
const {
    getWallet,
    addMoney,
    sendMoney,
    getTransactions,
} = require("../controllers/walletController");
/**
 * @swagger
 * /api/wallet:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Get wallet details
 *     description: Returns the logged-in user's wallet information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details fetched successfully.
 *       401:
 *         description: Unauthorized.
 */
// Get Wallet
router.get("/", authMiddleware, getWallet);
/**
 * @swagger
 * /api/wallet/add-money:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Add money to wallet
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
 *         description: Money added successfully.
 */
// Add Money
router.post(
    "/add-money",
    authMiddleware,
    addMoneyValidator,
    validate,
    addMoney
);
/**
 * @swagger
 * /api/wallet/send-money:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Send money
 *     description: Transfer money to another SRPay user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverSRPayId
 *               - amount
 *               - pin
 *             properties:
 *               receiverSRPayId:
 *                 type: string
 *                 example: SRP818387
 *               amount:
 *                 type: number
 *                 example: 500
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Money transferred successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/send-money",
    authMiddleware,
    sendMoneyValidator,
    validate,
    sendMoney
);
router.get("/transactions", authMiddleware, getTransactions);
module.exports = router;