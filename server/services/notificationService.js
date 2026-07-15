
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("./emailService");
const logger = require("../utils/logger");

// ================= CREATE NOTIFICATION =================

const createNotificationService = async (
    userId,
    title,
    message,
    type = "SYSTEM"
) => {

    const notification = await Notification.create({

        userId,

        title,

        message,

        type,

    });

    // Try to send email notification if user has email
    try {
        const user = await User.findById(userId).select("email fullName");
        if (user && user.email) {
            let emailPayload = null;

            if (title.includes("Welcome") || title.includes("Registered")) {
                emailPayload = emailTemplates.welcome(user.fullName);
            } else if (title.includes("Money Sent")) {
                // Extract amount and receiver from message
                const amountMatch = message.match(/₹([\d,]+)/);
                const amount = amountMatch ? amountMatch[1] : "";
                const receiverMatch = message.match(/to (.+?)\./);
                const receiverName = receiverMatch ? receiverMatch[1] : "someone";
                const balanceMatch = message.match(/balance:? ₹([\d,]+)/i);
                const balance = balanceMatch ? balanceMatch[1] : "0.00";
                emailPayload = emailTemplates.moneySent(user.fullName, receiverName, amount, balance);
            } else if (title.includes("Money Received")) {
                const amountMatch = message.match(/₹([\d,]+)/);
                const amount = amountMatch ? amountMatch[1] : "";
                const senderMatch = message.match(/from (.+?)\./);
                const senderName = senderMatch ? senderMatch[1] : "someone";
                const balanceMatch = message.match(/balance:? ₹([\d,]+)/i);
                const balance = balanceMatch ? balanceMatch[1] : "0.00";
                emailPayload = emailTemplates.moneyReceived(senderName, user.fullName, amount, balance);
            } else if (title.includes("Wallet Credited") || title.includes("Wallet Top")) {
                const amountMatch = message.match(/₹([\d,]+)/);
                const amount = amountMatch ? amountMatch[1] : "";
                const balanceMatch = message.match(/balance:? ₹([\d,]+)/i);
                const balance = balanceMatch ? balanceMatch[1] : "0.00";
                emailPayload = emailTemplates.walletTopUp(user.fullName, amount, balance);
            }

            if (emailPayload) {
                // Fire and forget - don't block notification creation
                sendEmail({
                    to: user.email,
                    subject: emailPayload.subject,
                    html: emailPayload.html,
                });
            }
        }
    } catch (err) {
        logger.warn(`Failed to send email notification: ${err.message}`);
    }

    return notification;

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
                returnDocument: "after",
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