const {
    getNotificationsService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
     deleteNotificationService,
} = require("../services/notificationService");

// ================= GET NOTIFICATIONS =================

const getNotifications = async (req, res) => {

    try {

        const result =
            await getNotificationsService(
                req.user.id,
                req.query
            );

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= MARK NOTIFICATION AS READ =================

const markNotificationAsRead = async (
    req,
    res
) => {

    try {

        const notification =
            await markNotificationAsReadService(
                req.user.id,
                req.params.id
            );

        res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

            notification,

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= MARK ALL NOTIFICATIONS AS READ =================

const markAllNotificationsAsRead = async (
    req,
    res
) => {

    try {

        const result =
            await markAllNotificationsAsReadService(
                req.user.id
            );

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= DELETE NOTIFICATION =================

const deleteNotification = async (
    req,
    res
) => {

    try {

        const result =
            await deleteNotificationService(
                req.user.id,
                req.params.id
            );

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= GET UNREAD COUNT =================

const getUnreadCount = async (req, res) => {
    try {
        const Notification = require("../models/Notification");
        const count = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false,
        });
        res.status(200).json({
            success: true,
            unreadCount: count,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
};
