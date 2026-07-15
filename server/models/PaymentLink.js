const mongoose = require("mongoose");

const paymentLinkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: 1,
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "PAID", "EXPIRED", "CANCELLED"],
            default: "ACTIVE",
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        paidAt: { type: Date, default: null },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

paymentLinkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PaymentLink", paymentLinkSchema);