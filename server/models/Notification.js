const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "WALLET",
                "PAYMENT",
                "TRANSFER",
                "QR",
                "SYSTEM",
            ],
            default: "SYSTEM",
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// ================= DATABASE INDEXES =================

notificationSchema.index({
    userId: 1,
    createdAt: -1,
});

notificationSchema.index({
    isRead: 1,
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);