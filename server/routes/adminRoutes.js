const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");

const {

    paginationValidator,

    searchUsersValidator,

    userIdValidator,

} = require("../validators/adminValidator");
const {
    getDashboard,
     getAllUsers,
     searchUsers,
     getAllWallets,
     getWalletStatistics,
       blockUser,
        unblockUser,
          getTransactionAnalytics,
           getPaymentMethodAnalytics,
            getDailyTransactionAnalytics,
             getMonthlyTransactionAnalytics,
             getTopWalletHolders,
             getMostActiveUsers,
             getLargestTransactions,
             getPaymentMethodSummary,
             getRevenueSummary,
             getExecutiveDashboard,
} = require("../controllers/adminController");
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Admin Dashboard
 *     description: Returns overall dashboard statistics.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully.
 *       403:
 *         description: Admin access required.
 */
// ================= ADMIN DASHBOARD =================

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getDashboard
);
/**
 * @swagger
 * /api/admin/users/search:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Search Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: Rahul
 *     responses:
 *       200:
 *         description: Users fetched successfully.
 */
// ================= SEARCH USERS =================

router.get(
    "/users/search",
    authMiddleware,
    adminMiddleware,
    searchUsersValidator,
    validate,
    searchUsers
);
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully.
 */
// ================= GET ALL USERS =================

router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    paginationValidator,
    validate,
    getAllUsers
);
/**
 * @swagger
 * /api/admin/wallets:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Wallets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallets fetched successfully.
 */
// ================= GET ALL WALLETS =================

router.get(
    "/wallets",
    authMiddleware,
    adminMiddleware,
    paginationValidator,
    validate,
    getAllWallets
);
/**
 * @swagger
 * /api/admin/wallets/statistics:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Wallet Statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet statistics fetched successfully.
 */
// ================= WALLET STATISTICS =================

router.get(
    "/wallets/statistics",
    authMiddleware,
    adminMiddleware,
    getWalletStatistics
);
/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Block User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully.
 */
// ================= BLOCK USER =================

router.patch(
    "/users/:id/block",
    authMiddleware,
    adminMiddleware,
    userIdValidator,
    validate,
    blockUser
);
/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Unblock User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully.
 */
// ================= UNBLOCK USER =================

router.patch(
    "/users/:id/unblock",
    authMiddleware,
    adminMiddleware,
    userIdValidator,
    validate,
    unblockUser
);
/**
 * @swagger
 * /api/admin/analytics/transactions:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Transaction Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics fetched successfully.
 */
// ================= TRANSACTION ANALYTICS =================

router.get(
    "/analytics/transactions",
    authMiddleware,
    adminMiddleware,
    getTransactionAnalytics
);
/**
 * @swagger
 * /api/admin/analytics/payment-methods:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Payment Method Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method analytics fetched successfully.
 */
// ================= PAYMENT METHOD ANALYTICS =================

router.get(
    "/analytics/payment-methods",
    authMiddleware,
    adminMiddleware,
    getPaymentMethodAnalytics
);
/**
 * @swagger
 * /api/admin/analytics/daily-transactions:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Daily Transaction Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily analytics fetched successfully.
 */
// ================= DAILY TRANSACTION ANALYTICS =================

router.get(
    "/analytics/daily-transactions",
    authMiddleware,
    adminMiddleware,
    getDailyTransactionAnalytics
);

// ================= MONTHLY TRANSACTION ANALYTICS =================
/**
 * @swagger
 * /api/admin/analytics/monthly-transactions:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Monthly Transaction Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly analytics fetched successfully.
 */
// ================= MONTHLY TRANSACTION ANALYTICS =================

router.get(
    "/analytics/monthly-transactions",
    authMiddleware,
    adminMiddleware,
    getMonthlyTransactionAnalytics
);
/**
 * @swagger
 * /api/admin/reports/top-wallets:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Top Wallet Holders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully.
 */
// ================= TOP WALLET HOLDERS =================

router.get(
    "/reports/top-wallets",
    authMiddleware,
    adminMiddleware,
    getTopWalletHolders
);
/**
 * @swagger
 * /api/admin/reports/top-users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Most Active Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully.
 */
// ================= MOST ACTIVE USERS =================

router.get(
    "/reports/top-users",
    authMiddleware,
    adminMiddleware,
    getMostActiveUsers
);
/**
 * @swagger
 * /api/admin/reports/largest-transactions:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Largest Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generated successfully.
 */
// ================= LARGEST TRANSACTIONS =================

router.get(
    "/reports/largest-transactions",
    authMiddleware,
    adminMiddleware,
    getLargestTransactions
);
/**
 * @swagger
 * /api/admin/reports/payment-method-summary:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Payment Method Summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary fetched successfully.
 */
// ================= PAYMENT METHOD SUMMARY =================

router.get(
    "/reports/payment-method-summary",
    authMiddleware,
    adminMiddleware,
    getPaymentMethodSummary
);
/**
 * @swagger
 * /api/admin/reports/revenue:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Revenue Summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue summary fetched successfully.
 */
// ================= REVENUE SUMMARY =================

router.get(
    "/reports/revenue",
    authMiddleware,
    adminMiddleware,
    getRevenueSummary
);
/**
 * @swagger
 * /api/admin/reports/executive-dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Executive Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Executive dashboard fetched successfully.
 */
// ================= EXECUTIVE DASHBOARD =================

router.get(
    "/reports/executive-dashboard",
    authMiddleware,
    adminMiddleware,
    getExecutiveDashboard
);
module.exports = router;