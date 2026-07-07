    const express = require("express");
    const router = express.Router();

    const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
    const { searchUsers,  getMyQR,scanQR,generateDynamicQR,scanDynamicQR,} = require("../controllers/userController");
   const {

    searchUsersValidator,

    scanQRValidator,

    generateDynamicQRValidator,

    scanDynamicQRValidator,

} = require("../validators/userValidator");
/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags:
 *       - Users
 *     summary: Search users
 *     description: Search users by name, phone number, or SRPay ID.
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
    "/search",
    authMiddleware,
    searchUsersValidator,
    validate,
    searchUsers
);
/**
 * @swagger
 * /api/users/my-qr:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get My QR Code
 *     description: Returns the logged-in user's QR code.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code fetched successfully.
 */
    // My QR
    router.get(
        "/my-qr",
        authMiddleware,
        getMyQR
    );
    /**
 * @swagger
 * /api/users/scan-qr:
 *   post:
 *     tags:
 *       - Users
 *     summary: Scan QR Code
 *     description: Scan another user's QR code and fetch user details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               srpayId:
 *                 type: string
 *                 example: SRP818387
 *     responses:
 *       200:
 *         description: QR scanned successfully.
 */
    // Scan QR
  router.post(
    "/scan-qr",
    authMiddleware,
    scanQRValidator,
    validate,
    scanQR
);
/**
 * @swagger
 * /api/users/generate-dynamic-qr:
 *   post:
 *     tags:
 *       - Users
 *     summary: Generate Dynamic QR
 *     description: Generate a QR code for requesting a specific payment amount.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Dynamic QR generated successfully.
 */
    // Generate Dynamic QR
 router.post(
    "/generate-dynamic-qr",
    authMiddleware,
    generateDynamicQRValidator,
    validate,
    generateDynamicQR
);
/**
 * @swagger
 * /api/users/scan-dynamic-qr:
 *   post:
 *     tags:
 *       - Users
 *     summary: Scan Dynamic QR
 *     description: Scan a dynamic QR code to retrieve payment information.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrData:
 *                 type: string
 *                 example: eyJzcnBheUlkIjoiU1JQODE4Mzg3IiwiYW1vdW50Ijo1MDB9
 *     responses:
 *       200:
 *         description: Dynamic QR scanned successfully.
 */
    // Scan Dynamic QR
    router.post(
    "/scan-dynamic-qr",
    authMiddleware,
    scanDynamicQRValidator,
    validate,
    scanDynamicQR
);
    module.exports = router;