const PaymentRequest = require("../models/PaymentRequest");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { createNotificationService } = require("./notificationService");
const { verifyTransactionPinService } = require("./authService");
const mongoose = require("mongoose");

// ================= REQUEST MONEY =================
const requestMoneyService = async (requesterId, payerSRPayId, amount, description) => {
    const payer = await User.findOne({ srpayId: payerSRPayId });
    if (!payer) throw new Error("Payer not found");
    if (payer._id.toString() === requesterId.toString()) throw new Error("Cannot request money from yourself");

    const request = await PaymentRequest.create({
        requesterId,
        payerId: payer._id,
        amount: Number(amount),
        description: description || "",
        type: "request",
    });

    const requester = await User.findById(requesterId);

    await createNotificationService(
        payer._id,
        "Money Request",
        `${requester.fullName} requested ₹${amount} from you. ${description ? `Note: ${description}` : ""}`,
        "PAYMENT"
    );

    return {
        id: request._id,
        requesterName: requester.fullName,
        requesterSRPayId: requester.srpayId,
        payerName: payer.fullName,
        payerSRPayId: payer.srpayId,
        amount: request.amount,
        description: request.description,
        status: request.status,
        expiresAt: request.expiresAt,
        createdAt: request.createdAt,
    };
};

// ================= SPLIT BILL =================
const splitBillService = async (requesterId, participants, totalAmount, description) => {
    const splitAmount = Math.round((totalAmount / participants.length) * 100) / 100;
    const requester = await User.findById(requesterId);

    const splitAmong = [];
    const payerIds = [];

    for (const srpayId of participants) {
        const user = await User.findOne({ srpayId });
        if (!user) throw new Error(`User with SRPay ID ${srpayId} not found`);
        if (user._id.toString() === requesterId.toString()) continue;
        payerIds.push(user._id);
        splitAmong.push({
            userId: user._id,
            fullName: user.fullName,
            srpayId: user.srpayId,
            amount: splitAmount,
            status: "PENDING",
        });
    }

    if (splitAmong.length === 0) throw new Error("No valid participants to split with");

    const request = await PaymentRequest.create({
        requesterId,
        amount: totalAmount,
        description: description || "",
        type: "split",
        splitAmong,
    });

    // Notify all participants
    for (const participant of splitAmong) {
        await createNotificationService(
            participant.userId,
            "Bill Split",
            `${requester.fullName} split ₹${totalAmount}. Your share: ₹${splitAmount}. ${description ? `(${description})` : ""}`,
            "PAYMENT"
        );
    }

    return {
        id: request._id,
        totalAmount: request.amount,
        splitAmount,
        participants: splitAmong.length,
        description: request.description,
        status: request.status,
    };
};

// ================= PAY A REQUEST =================
const payRequestService = async (userId, requestId, transactionPin) => {
    const request = await PaymentRequest.findById(requestId);
    if (!request) throw new Error("Payment request not found");
    if (request.status !== "PENDING") throw new Error("This request is no longer pending");
    if (request.payerId.toString() !== userId.toString()) throw new Error("This request was not sent to you");
    if (request.expiresAt < new Date()) {
        request.status = "EXPIRED";
        await request.save();
        throw new Error("This request has expired");
    }

    await verifyTransactionPinService(userId, transactionPin);

    const senderWallet = await Wallet.findOne({ userId });
    if (!senderWallet) throw new Error("Wallet not found");
    if (senderWallet.balance < request.amount) throw new Error("Insufficient balance");

    const receiverWallet = await Wallet.findOne({ userId: request.requesterId });
    if (!receiverWallet) throw new Error("Receiver wallet not found");

    const sender = await User.findById(userId);
    const receiver = await User.findById(request.requesterId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        senderWallet.balance -= request.amount;
        receiverWallet.balance += request.amount;
        await senderWallet.save({ session });
        await receiverWallet.save({ session });

        await Transaction.create([{
            walletId: senderWallet._id,
            userId: sender._id,
            senderName: sender.fullName,
            senderSRPayId: sender.srpayId,
            receiverId: receiver._id,
            receiverName: receiver.fullName,
            receiverSRPayId: receiver.srpayId,
            type: "DEBIT",
            amount: request.amount,
            description: `Paid request: ${request.description || `To ${receiver.fullName}`}`,
            balanceAfter: senderWallet.balance,
            paymentMethod: "REQUEST",
            category: "TRANSFER",
            status: "SUCCESS",
        }], { session });

        await Transaction.create([{
            walletId: receiverWallet._id,
            userId: receiver._id,
            senderName: receiver.fullName,
            senderSRPayId: receiver.srpayId,
            receiverId: sender._id,
            receiverName: sender.fullName,
            receiverSRPayId: sender.srpayId,
            type: "CREDIT",
            amount: request.amount,
            description: `Payment received: ${request.description || `From ${sender.fullName}`}`,
            balanceAfter: receiverWallet.balance,
            paymentMethod: "REQUEST",
            category: "TRANSFER",
            status: "SUCCESS",
        }], { session });

        request.status = "PAID";
        request.paidAt = new Date();
        await request.save({ session });

        await createNotificationService(receiver._id, "Payment Received", `₹${request.amount} received from ${sender.fullName} for "${request.description || "Request"}"`, "PAYMENT");

        await session.commitTransaction();
        session.endSession();

        return { message: "Payment successful", amount: request.amount, receiver: receiver.fullName, balance: senderWallet.balance };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// ================= DECLINE REQUEST =================
const declineRequestService = async (userId, requestId) => {
    const request = await PaymentRequest.findById(requestId);
    if (!request) throw new Error("Payment request not found");
    if (request.payerId.toString() !== userId.toString()) throw new Error("Not authorized");
    if (request.status !== "PENDING") throw new Error("Request already processed");

    request.status = "DECLINED";
    await request.save();

    return { message: "Request declined" };
};

// ================= GET MY PENDING REQUESTS =================
const getPendingRequestsService = async (userId) => {
    const sent = await PaymentRequest.find({ requesterId: userId, status: "PENDING" })
        .populate("payerId", "fullName srpayId phone profileImage")
        .sort({ createdAt: -1 });

    const received = await PaymentRequest.find({ payerId: userId, status: "PENDING" })
        .populate("requesterId", "fullName srpayId phone profileImage")
        .sort({ createdAt: -1 });

    return {
        sent: sent.map((r) => ({
            id: r._id,
            to: { name: r.payerId?.fullName, srpayId: r.payerId?.srpayId },
            amount: r.amount,
            description: r.description,
            type: r.type,
            expiresAt: r.expiresAt,
            createdAt: r.createdAt,
        })),
        received: received.map((r) => ({
            id: r._id,
            from: { name: r.requesterId?.fullName, srpayId: r.requesterId?.srpayId },
            amount: r.amount,
            description: r.description,
            type: r.type,
            expiresAt: r.expiresAt,
            createdAt: r.createdAt,
        })),
    };
};

// ================= GET REQUEST HISTORY =================
const getRequestHistoryService = async (userId) => {
    const requests = await PaymentRequest.find({
        $or: [{ requesterId: userId }, { payerId: userId }],
        status: { $ne: "PENDING" },
    })
        .populate("requesterId", "fullName srpayId")
        .populate("payerId", "fullName srpayId")
        .sort({ createdAt: -1 })
        .limit(50);

    return requests.map((r) => ({
        id: r._id,
        requester: r.requesterId?.fullName,
        payer: r.payerId?.fullName,
        amount: r.amount,
        description: r.description,
        type: r.type,
        status: r.status,
        paidAt: r.paidAt,
        createdAt: r.createdAt,
    }));
};

// ================= CANCEL REQUEST =================
const cancelRequestService = async (userId, requestId) => {
    const request = await PaymentRequest.findById(requestId);
    if (!request) throw new Error("Request not found");
    if (request.requesterId.toString() !== userId.toString()) throw new Error("Not authorized");
    if (request.status !== "PENDING") throw new Error("Request already processed");

    request.status = "CANCELLED";
    await request.save();

    return { message: "Request cancelled" };
};

module.exports = {
    requestMoneyService,
    splitBillService,
    payRequestService,
    declineRequestService,
    getPendingRequestsService,
    getRequestHistoryService,
    cancelRequestService,
};