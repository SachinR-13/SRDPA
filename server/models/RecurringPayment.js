const mongoose = require("mongoose");

const recurringPaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverSRPayId: {
            type: String,
            required: [true, "Receiver SRPay ID is required"],
        },
        receiverName: {
            type: String,
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
        },
        frequency: {
            type: String,
            enum: ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"],
            required: true,
        },
        dayOfMonth: {
            type: Number,
            default: 1,
            min: 1,
            max: 31,
        },
        dayOfWeek: {
            type: Number,
            default: 1, // 1=Mon, 7=Sun
            min: 1,
            max: 7,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            default: null,
        },
        nextPaymentDate: {
            type: Date,
            required: true,
        },
        lastPaymentDate: {
            type: Date,
            default: null,
        },
        totalPaymentsMade: {
            type: Number,
            default: 0,
        },
        maxPayments: {
            type: Number,
            default: null,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", "FAILED"],
            default: "ACTIVE",
        },
        failureCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

recurringPaymentSchema.index({ userId: 1, status: 1 });
recurringPaymentSchema.index({ nextPaymentDate: 1, status: 1 });

module.exports = mongoose.model("RecurringPayment", recurringPaymentSchema);