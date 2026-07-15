const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
} = require("../controllers/notificationController");
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get Notifications
 *     description: Returns all notifications of the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully.
 */
// ================= GET NOTIFICATIONS =================

router.get(
    "/",
    authMiddleware,
    getNotifications
);
/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Mark All Notifications as Read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 */
// ================= MARK ALL AS READ =================

router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsRead
);
/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Mark Notification as Read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         example: 686ab123456789abcdef1234
 *     responses:
 *       200:
 *         description: Notification marked as read.
 */
// ================= MARK AS READ =================

router.patch(
    "/:id/read",
    authMiddleware,
    markNotificationAsRead
);
/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         example: 686ab123456789abcdef1234
 *     responses:
 *       200:
 *         description: Notification deleted successfully.
 *       404:
 *         description: Notification not found.
 */
// ================= DELETE NOTIFICATION =================

router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);
/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count returned.
 */
// ================= GET UNREAD COUNT =================

router.get(
    "/unread-count",
    authMiddleware,
    getUnreadCount
);

module.exports = router;
