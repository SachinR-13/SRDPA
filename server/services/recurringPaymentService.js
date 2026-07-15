const RecurringPayment = require("../models/RecurringPayment");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { createNotificationService } = require("./notificationService");
const { verifyTransactionPinService } = require("./authService");
const mongoose = require("mongoose");

// ================= CREATE RECURRING PAYMENT =================
const createRecurringPaymentService = async (userId, data) => {
    const { receiverSRPayId, amount, description, frequency, dayOfMonth, dayOfWeek, startDate, endDate, maxPayments } = data;

    const receiver = await User.findOne({ srpayId: receiverSRPayId });
    if (!receiver) throw new Error("Receiver not found");
    if (receiver._id.toString() === userId.toString()) throw new Error("Cannot create recurring payment to yourself");

    // Calculate next payment date
    const nextPaymentDate = calculateNextPaymentDate(frequency, new Date(startDate), dayOfMonth, dayOfWeek);

    const recurring = await RecurringPayment.create({
        userId,
        receiverSRPayId,
        receiverName: receiver.fullName,
        amount: Number(amount),
        description: description || "",
        frequency,
        dayOfMonth: dayOfMonth || 1,
        dayOfWeek: dayOfWeek || 1,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        nextPaymentDate,
        maxPayments: maxPayments || null,
    });

    return {
        id: recurring._id,
        receiverName: receiver.fullName,
        receiverSRPayId: receiver.srpayId,
        amount: recurring.amount,
        description: recurring.description,
        frequency: recurring.frequency,
        nextPaymentDate: recurring.nextPaymentDate,
        status: recurring.status,
        createdAt: recurring.createdAt,
    };
};

// ================= GET MY RECURRING PAYMENTS =================
const getMyRecurringPaymentsService = async (userId) => {
    const payments = await RecurringPayment.find({ userId }).sort({ createdAt: -1 });
    return payments.map((p) => ({
        id: p._id,
        receiverName: p.receiverName,
        receiverSRPayId: p.receiverSRPayId,
        amount: p.amount,
        description: p.description,
        frequency: p.frequency,
        nextPaymentDate: p.nextPaymentDate,
        lastPaymentDate: p.lastPaymentDate,
        totalPaymentsMade: p.totalPaymentsMade,
        maxPayments: p.maxPayments,
        status: p.status,
        failureCount: p.failureCount,
        createdAt: p.createdAt,
    }));
};

// ================= PAUSE/RESUME RECURRING =================
const toggleRecurringPaymentService = async (userId, paymentId) => {
    const payment = await RecurringPayment.findOne({ _id: paymentId, userId });
    if (!payment) throw new Error("Recurring payment not found");
    if (payment.status === "COMPLETED" || payment.status === "CANCELLED") throw new Error("Cannot modify completed/cancelled payment");

    payment.status = payment.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await payment.save();

    return { status: payment.status, message: payment.status === "ACTIVE" ? "Resumed" : "Paused" };
};

// ================= CANCEL RECURRING =================
const cancelRecurringPaymentService = async (userId, paymentId) => {
    const payment = await RecurringPayment.findOne({ _id: paymentId, userId });
    if (!payment) throw new Error("Recurring payment not found");

    payment.status = "CANCELLED";
    await payment.save();

    return { message: "Recurring payment cancelled" };
};

// ================= PROCESS DUE RECURRING PAYMENTS (CRON JOB) =================
const processDuePaymentsService = async () => {
    const duePayments = await RecurringPayment.find({
        status: "ACTIVE",
        nextPaymentDate: { $lte: new Date() },
        $or: [
            { endDate: null },
            { endDate: { $gte: new Date() } },
        ],
        $or: [
            { maxPayments: null },
            { $expr: { $lt: ["$totalPaymentsMade", "$maxPayments"] } },
        ],
    });

    const results = { processed: 0, failed: 0, errors: [] };

    for (const payment of duePayments) {
        try {
            const senderWallet = await Wallet.findOne({ userId: payment.userId });
            if (!senderWallet || senderWallet.balance < payment.amount) {
                payment.failureCount += 1;
                if (payment.failureCount >= 3) {
                    payment.status = "FAILED";
                }
                await payment.save();
                results.failed++;
                continue;
            }

            const receiverWallet = await Wallet.findOne({ userId: (await User.findOne({ srpayId: payment.receiverSRPayId }))._id });
            if (!receiverWallet) {
                payment.failureCount += 1;
                await payment.save();
                results.failed++;
                continue;
            }

            const sender = await User.findById(payment.userId);
            const receiver = await User.findOne({ srpayId: payment.receiverSRPayId });

            const session = await mongoose.startSession();
            session.startTransaction();

            senderWallet.balance -= payment.amount;
            receiverWallet.balance += payment.amount;
            await senderWallet.save({ session });
            await receiverWallet.save({ session });

            await Transaction.create([{
                walletId: senderWallet._id, userId: sender._id,
                senderName: sender.fullName, senderSRPayId: sender.srpayId,
                receiverId: receiver._id, receiverName: receiver.fullName, receiverSRPayId: receiver.srpayId,
                type: "DEBIT", amount: payment.amount,
                description: `AutoPay: ${payment.description || `To ${receiver.fullName}`}`,
                balanceAfter: senderWallet.balance, paymentMethod: "RECURRING",
                category: "TRANSFER", status: "SUCCESS",
            }], { session });

            await Transaction.create([{
                walletId: receiverWallet._id, userId: receiver._id,
                senderName: receiver.fullName, senderSRPayId: receiver.srpayId,
                receiverId: sender._id, receiverName: sender.fullName, receiverSRPayId: sender.srpayId,
                type: "CREDIT", amount: payment.amount,
                description: `AutoPay received: ${payment.description || `From ${sender.fullName}`}`,
                balanceAfter: receiverWallet.balance, paymentMethod: "RECURRING",
                category: "TRANSFER", status: "SUCCESS",
            }], { session });

            payment.totalPaymentsMade += 1;
            payment.lastPaymentDate = new Date();
            payment.failureCount = 0;
            payment.nextPaymentDate = calculateNextPaymentDate(payment.frequency, new Date(), payment.dayOfMonth, payment.dayOfWeek);

            if (payment.maxPayments && payment.totalPaymentsMade >= payment.maxPayments) {
                payment.status = "COMPLETED";
            }
            if (payment.endDate && payment.nextPaymentDate > payment.endDate) {
                payment.status = "COMPLETED";
            }

            await payment.save({ session });
            await createNotificationService(sender._id, "AutoPay", `₹${payment.amount} sent to ${receiver.fullName} (AutoPay)`, "PAYMENT");

            await session.commitTransaction();
            session.endSession();
            results.processed++;
        } catch (error) {
            results.failed++;
            results.errors.push({ paymentId: payment._id, error: error.message });
        }
    }

    return results;
};

// Helper: Calculate next payment date
const calculateNextPaymentDate = (frequency, fromDate, dayOfMonth, dayOfWeek) => {
    const date = new Date(fromDate);
    switch (frequency) {
        case "DAILY":
            date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1);
            if (dayOfMonth) date.setDate(Math.min(dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
            break;
        case "QUARTERLY":
            date.setMonth(date.getMonth() + 3);
            break;
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    return date;
};

module.exports = {
    createRecurringPaymentService,
    getMyRecurringPaymentsService,
    toggleRecurringPaymentService,
    cancelRecurringPaymentService,
    processDuePaymentsService,
};