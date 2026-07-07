const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
// ================= CREATE RAZORPAY ORDER =================

const createOrderService = async (
    userId,
    amount
) => {

    if (!amount || amount <= 0) {
        throw new Error(
            "Valid amount is required"
        );
    }

    const options = {

        amount: Number(amount) * 100,

        currency: "INR",

        receipt: `rcpt_${Date.now()}`

    };

    const order = await razorpay.orders.create(options);

// Find Wallet
const wallet = await Wallet.findOne({
    userId,
});

if (!wallet) {
    throw new Error("Wallet not found");
}

// Find User
const user = await User.findById(userId);

// Save Pending Transaction
await Transaction.create({

    walletId: wallet._id,

    userId,

    senderName: user.fullName,

    senderSRPayId: user.srpayId,

    receiverName: null,

    receiverSRPayId: null,

    razorpayOrderId: order.id,

    razorpayPaymentId: null,

    paymentMethod: "RAZORPAY",

    type: "CREDIT",

    amount,

    description: "Awaiting Razorpay Payment",

    balanceAfter: wallet.balance,

    status: "PENDING",

});

return order;

};
// ================= VERIFY PAYMENT =================

const verifyPaymentService = async (
    userId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount
) => {

    // Generate Signature
    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
        )
        .digest("hex");

    // Verify Signature
    if (
        generatedSignature !==
        razorpay_signature
    ) {
        throw new Error(
            "Invalid payment signature"
        );
    }
const existingPayment = await Transaction.findOne({
    razorpayPaymentId: razorpay_payment_id,
});

if (existingPayment) {
    throw new Error("Payment already processed");
}
    // Find Wallet
    const wallet = await Wallet.findOne({
        userId,
    });

    if (!wallet) {
        throw new Error("Wallet not found");
    }

    // Credit Wallet
    wallet.balance += Number(amount);

    await wallet.save();

    // Find User
    const user = await User.findById(userId);

    // Save Transaction
  await Transaction.findOneAndUpdate(
    {
        razorpayOrderId: razorpay_order_id,
        status: "PENDING",
    },
    {
        status: "SUCCESS",

        razorpayPaymentId: razorpay_payment_id,

        description: "Added money via Razorpay",

        balanceAfter: wallet.balance,
    }
);
return {
    message: "Payment verified successfully",
    balance: wallet.balance,
};
};
// ================= PAYMENT HISTORY =================

const getPaymentHistoryService = async (
    userId,
    query
) => {

    const filter = {

        userId,

        paymentMethod: "RAZORPAY",

    };

    // Status Filter
    if (query.status?.trim()) {

        filter.status =
            query.status.trim().toUpperCase();

    }

    // Date Range
    if (query.from && query.to) {

        const start = new Date(query.from);
        start.setHours(0, 0, 0, 0);

        const end = new Date(query.to);
        end.setHours(23, 59, 59, 999);

        filter.createdAt = {

            $gte: start,

            $lte: end,

        };

    }

    // Pagination
    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const payments = await Transaction.find(filter)

        .sort({ createdAt: -1 })

        .skip(skip)

        .limit(limit);

    const total =
        await Transaction.countDocuments(filter);

    return {

        payments,

        pagination: {

            currentPage: page,

            limit,

            totalPayments: total,

            totalPages:
                Math.ceil(total / limit),

        },

    };

};
// ================= FAILED PAYMENT =================

const failedPaymentService = async (
    userId,
    amount,
    reason,
    razorpayOrderId
) => {

    const wallet = await Wallet.findOne({
        userId,
    });

    if (!wallet) {
        throw new Error("Wallet not found");
    }

    const user = await User.findById(userId);

    await Transaction.findOneAndUpdate(
    {
        razorpayOrderId,
        status: "PENDING",
    },
    {
        status: "FAILED",

        description:
            reason || "Razorpay Payment Failed",
    }
);

    return {

        message:
            "Failed payment recorded",

    };

};
module.exports = {
    createOrderService,
    verifyPaymentService,
    getPaymentHistoryService,
    failedPaymentService,
};