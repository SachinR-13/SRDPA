const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
},

senderName: {
    type: String,
    required: true,
    trim: true,
},
senderSRPayId: {
    type: String,
    required: true,
},
receiverName: {
    type: String,
    default: null,
},
receiverSRPayId: {
    type: String,
    default: null,
},
razorpayOrderId: {
    type: String,
    default: null,
},

razorpayPaymentId: {
    type: String,
    default: null,
},

        paymentMethod: {
            type: String,
            enum: ["WALLET", "RAZORPAY", "QR", "PAYMENT_LINK", "RECURRING", "REQUEST"],
            required: true,
            default: "WALLET",
        },
        category: {
            type: String,
            enum: ["FOOD", "TRAVEL", "SHOPPING", "BILLS", "ENTERTAINMENT", "GROCERIES", "TRANSPORT", "HEALTH", "EDUCATION", "RENT", "SALARY", "INVESTMENT", "TRANSFER", "OTHER"],
            default: "OTHER",
        },
        note: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        isFlagged: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ["CREDIT", "DEBIT"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 1,
        },

        description: {
            type: String,
            required: true,
        },

        balanceAfter: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["SUCCESS", "FAILED", "PENDING"],
            default: "SUCCESS",
        },
    },
    {
        timestamps: true,
    }
);
// ================= DATABASE INDEXES =================

// User Transaction History
transactionSchema.index({
    userId: 1,
    createdAt: -1,
});

// Razorpay Payment History
transactionSchema.index({
    paymentMethod: 1,
});

// Razorpay Order Lookup
transactionSchema.index({
    razorpayOrderId: 1,
});

// Razorpay Payment Lookup
transactionSchema.index(
    { razorpayPaymentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpayPaymentId: {
                $type: "string",
            },
        },
    }
);

// Sender Search
transactionSchema.index({
    senderSRPayId: 1,
});

// Receiver Search
transactionSchema.index({
    receiverSRPayId: 1,
});
// Largest Transaction Report
transactionSchema.index({
    status: 1,
    amount: -1,
});
// Daily & Monthly Analytics
transactionSchema.index({
    status: 1,
    createdAt: -1,
});
module.exports = mongoose.model("Transaction", transactionSchema);