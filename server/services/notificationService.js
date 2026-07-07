
const Notification = require("../models/Notification");

// ================= CREATE NOTIFICATION =================

const createNotificationService = async (
    userId,
    title,
    message,
    type = "SYSTEM"
) => {

    return await Notification.create({

        userId,

        title,

        message,

        type,

    });

};
// ================= GET NOTIFICATIONS =================

const getNotificationsService = async (
    userId,
    query
) => {

    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
        userId,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const unreadCount =
        await Notification.countDocuments({
            userId,
            isRead: false,
        });

    const totalNotifications =
        await Notification.countDocuments({
            userId,
        });

    return {

        notifications,

        unreadCount,

        pagination: {

            currentPage: page,

            limit,

            totalNotifications,

            totalPages: Math.ceil(
                totalNotifications / limit
            ),

        },

    };

};
// ================= MARK NOTIFICATION AS READ =================

const markNotificationAsReadService = async (
    userId,
    notificationId
) => {

    const notification =
        await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                userId,
            },
            {
                isRead: true,
            },
            {
                new: true,
            }
        );

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    return notification;

};
// ================= MARK ALL NOTIFICATIONS AS READ =================

const markAllNotificationsAsReadService = async (
    userId
) => {

    const result =
        await Notification.updateMany(
            {
                userId,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

    return {

        message: "All notifications marked as read",

        modifiedCount: result.modifiedCount,

    };

};
// ================= DELETE NOTIFICATION =================

const deleteNotificationService = async (
    userId,
    notificationId
) => {

    const notification =
        await Notification.findOneAndDelete(
            {
                _id: notificationId,
                userId,
            }
        );

    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }

    return {

        message:
            "Notification deleted successfully",

    };

};
module.exports = {
    createNotificationService,
    getNotificationsService,
markNotificationAsReadService,

    markAllNotificationsAsReadService,
    deleteNotificationService,
};  