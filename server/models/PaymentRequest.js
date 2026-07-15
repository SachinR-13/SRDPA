const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        payerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
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
        type: {
            type: String,
            enum: ["request", "split"],
            default: "request",
        },
        status: {
            type: String,
            enum: ["PENDING", "PAID", "DECLINED", "EXPIRED", "CANCELLED"],
            default: "PENDING",
        },
        splitAmong: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                fullName: String,
                srpayId: String,
                amount: Number,
                status: { type: String, enum: ["PENDING", "PAID", "DECLINED"], default: "PENDING" },
            },
        ],
        paidAt: { type: Date, default: null },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    },
    { timestamps: true }
);

paymentRequestSchema.index({ requesterId: 1, createdAt: -1 });
paymentRequestSchema.index({ payerId: 1, status: 1 });
paymentRequestSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);