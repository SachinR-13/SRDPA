const PaymentLink = require("../models/PaymentLink");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { createNotificationService } = require("./notificationService");
const { verifyTransactionPinService } = require("./authService");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Generate unique payment link code
const generateCode = () => {
    return "SRPL" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

// ================= CREATE PAYMENT LINK =================
const createPaymentLinkService = async (userId, amount, description) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let code;
    while (true) {
        code = generateCode();
        const existing = await PaymentLink.findOne({ code });
        if (!existing) break;
    }

    const link = await PaymentLink.create({
        userId,
        amount: Number(amount),
        description: description || "",
        code,
    });

    return {
        id: link._id,
        code: link.code,
        url: `https://srpay.vercel.app/pay/${link.code}`,
        amount: link.amount,
        description: link.description,
        status: link.status,
        expiresAt: link.expiresAt,
        createdAt: link.createdAt,
    };
};

// ================= GET PAYMENT LINK DETAILS (public) =================
const getPaymentLinkDetailsService = async (code) => {
    const link = await PaymentLink.findOne({ code }).populate("userId", "fullName srpayId profileImage");
    if (!link) throw new Error("Payment link not found");
    if (link.status !== "ACTIVE") throw new Error("Payment link is no longer active");
    if (link.expiresAt < new Date()) {
        link.status = "EXPIRED";
        await link.save();
        throw new Error("Payment link has expired");
    }

    link.views += 1;
    await link.save();

    return {
        code: link.code,
        amount: link.amount,
        description: link.description,
        merchant: {
            name: link.userId.fullName,
            srpayId: link.userId.srpayId,
            profileImage: link.userId.profileImage,
        },
        status: link.status,
    };
};

// ================= PAY VIA LINK =================
const payViaLinkService = async (userId, code, transactionPin) => {
    const link = await PaymentLink.findOne({ code });
    if (!link) throw new Error("Payment link not found");
    if (link.status !== "ACTIVE") throw new Error("Payment link is no longer active");
    if (link.expiresAt < new Date()) {
        link.status = "EXPIRED";
        await link.save();
        throw new Error("Payment link has expired");
    }
    if (link.userId.toString() === userId.toString()) throw new Error("Cannot pay your own payment link");

    await verifyTransactionPinService(userId, transactionPin);

    const senderWallet = await Wallet.findOne({ userId });
    if (!senderWallet) throw new Error("Wallet not found");
    if (senderWallet.balance < link.amount) throw new Error("Insufficient balance");

    const receiverWallet = await Wallet.findOne({ userId: link.userId });
    if (!receiverWallet) throw new Error("Receiver wallet not found");

    const sender = await User.findById(userId);
    const receiver = await User.findById(link.userId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        senderWallet.balance -= link.amount;
        receiverWallet.balance += link.amount;
        await senderWallet.save({ session });
        await receiverWallet.save({ session });

        await Transaction.create([{
            walletId: senderWallet._id, userId: sender._id,
            senderName: sender.fullName, senderSRPayId: sender.srpayId,
            receiverId: receiver._id, receiverName: receiver.fullName, receiverSRPayId: receiver.srpayId,
            type: "DEBIT", amount: link.amount,
            description: `Payment via link: ${link.description || `To ${receiver.fullName}`}`,
            balanceAfter: senderWallet.balance, paymentMethod: "PAYMENT_LINK",
            category: "TRANSFER", status: "SUCCESS",
        }], { session });

        await Transaction.create([{
            walletId: receiverWallet._id, userId: receiver._id,
            senderName: receiver.fullName, senderSRPayId: receiver.srpayId,
            receiverId: sender._id, receiverName: sender.fullName, receiverSRPayId: sender.srpayId,
            type: "CREDIT", amount: link.amount,
            description: `Payment received via link: ${link.description || `From ${sender.fullName}`}`,
            balanceAfter: receiverWallet.balance, paymentMethod: "PAYMENT_LINK",
            category: "TRANSFER", status: "SUCCESS",
        }], { session });

        link.status = "PAID";
        link.paidBy = sender._id;
        link.paidAt = new Date();
        await link.save({ session });

        await createNotificationService(receiver._id, "Payment Received", `₹${link.amount} received from ${sender.fullName} via payment link.`, "PAYMENT");

        await session.commitTransaction();
        session.endSession();

        return { message: "Payment successful", amount: link.amount, merchant: receiver.fullName, balance: senderWallet.balance };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// ================= GET MY PAYMENT LINKS =================
const getMyPaymentLinksService = async (userId) => {
    const links = await PaymentLink.find({ userId }).sort({ createdAt: -1 });
    return links.map((l) => ({
        id: l._id,
        code: l.code,
        url: `https://srpay.vercel.app/pay/${l.code}`,
        amount: l.amount,
        description: l.description,
        status: l.status,
        views: l.views,
        paidAt: l.paidAt,
        expiresAt: l.expiresAt,
        createdAt: l.createdAt,
    }));
};

// ================= CANCEL PAYMENT LINK =================
const cancelPaymentLinkService = async (userId, linkId) => {
    const link = await PaymentLink.findOne({ _id: linkId, userId });
    if (!link) throw new Error("Payment link not found");
    if (link.status !== "ACTIVE") throw new Error("Link already processed");

    link.status = "CANCELLED";
    await link.save();

    return { message: "Payment link cancelled" };
};

module.exports = {
    createPaymentLinkService,
    getPaymentLinkDetailsService,
    payViaLinkService,
    getMyPaymentLinksService,
    cancelPaymentLinkService,
};