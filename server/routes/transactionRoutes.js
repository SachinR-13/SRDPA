const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getTransactions,
    getTransactionDetails,
     getMiniStatement,
         getRecentContacts,
} = require("../controllers/transactionController");
const validate = require("../middleware/validate");

const {

    transactionHistoryValidator,

    transactionDetailsValidator,

    miniStatementValidator,

    recentContactsValidator,

} = require("../validators/transactionValidator");
// ================= GET TRANSACTION HISTORY =================
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transaction history
 *     description: Returns all transactions of the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history fetched successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/",
    authMiddleware,
    transactionHistoryValidator,
    validate,
    getTransactions
);
/**
 * @swagger
 * /api/transactions/mini-statement:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get mini statement
 *     description: Returns the latest transactions of the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mini statement fetched successfully.
 */
router.get(
    "/mini-statement",
    authMiddleware,
    miniStatementValidator,
    validate,
    getMiniStatement
);
/**
 * @swagger
 * /api/transactions/recent-contacts:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get recent contacts
 *     description: Returns recently interacted SRPay users.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent contacts fetched successfully.
 */
// Recent Contacts
router.get(
    "/recent-contacts",
    authMiddleware,
    recentContactsValidator,
    validate,
    getRecentContacts
);
/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transaction details
 *     description: Returns details of a specific transaction.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6a49f116931756ea3a0f30c8
 *     responses:
 *       200:
 *         description: Transaction details fetched successfully.
 *       404:
 *         description: Transaction not found.
 */
// Transaction Details
router.get(
    "/:transactionId",
    authMiddleware,
    transactionDetailsValidator,
    validate,
    getTransactionDetails
);
module.exports = router;