const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");
const {verifyTransactionPinService,} = require("./authService");
const {
    createNotificationService,
} = require("./notificationService");
// ================= GET WALLET =================

const getWalletService = async (userId) => {
console.log("USER ID:", userId);
    const wallet = await Wallet.findOne({ userId });
console.log("WALLET:", wallet);
    if (!wallet) {
        throw new Error("Wallet not found");
    }

    return {
        walletId: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt,
    };
};

// ================= ADD MONEY =================

const addMoneyService = async (userId, amount) => {

    if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new Error("Wallet not found");
    }

    // Update Balance
    wallet.balance += Number(amount);

    await wallet.save();

    // Create Transaction
    const user = await User.findById(userId);

await Transaction.create({
    walletId: wallet._id,
    userId,

    senderName: user.fullName,
senderSRPayId: user.srpayId,

receiverName: null,
receiverSRPayId: null,

    type: "CREDIT",
    amount,
    description: "Wallet Top-up",
    balanceAfter: wallet.balance,
    status: "SUCCESS",
});
await createNotificationService(
    userId,
    "Wallet Credited",
    `₹${amount} added successfully to your wallet.`,
    "WALLET"
);

    return {
        walletId: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
    };
};
// ================= SEND MONEY =================

const sendMoneyService = async (
    senderId,
    receiverSRPayId,
    amount,
    transactionPin
) => {

    // 1. Validate Amount
    const transferAmount = Number(amount);
// Verify Transaction PIN
await verifyTransactionPinService(
    senderId,
    transactionPin
);
    if (isNaN(transferAmount) || transferAmount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    // 2. Find Sender
    const sender = await User.findById(senderId);

    if (!sender) {
        throw new Error("Sender not found");
    }

    // 3. Find Receiver
    const receiver = await User.findOne({
        srpayId: receiverSRPayId,
    });

    if (!receiver) {
        throw new Error("Receiver not found");
    }

    // 4. Prevent Self Transfer
    if (sender._id.toString() === receiver._id.toString()) {
        throw new Error("You cannot send money to yourself");
    }
// 5. Find Sender Wallet
const senderWallet = await Wallet.findOne({
    userId: sender._id,
});

if (!senderWallet) {
    throw new Error("Sender wallet not found");
}

// 6. Find Receiver Wallet
const receiverWallet = await Wallet.findOne({
    userId: receiver._id,
});

if (!receiverWallet) {
    throw new Error("Receiver wallet not found");
}

// 7. Check Wallet Status
if (!senderWallet.isActive) {
    throw new Error("Sender wallet is inactive");
}

if (!receiverWallet.isActive) {
    throw new Error("Receiver wallet is inactive");
}

// 8. Check Balance
if (senderWallet.balance < transferAmount) {
    throw new Error("Insufficient wallet balance");
}
// 9. Start MongoDB Session
const session = await mongoose.startSession();

session.startTransaction();

try {

    // Transfer logic will come here in the next step
    // 10. Debit Sender Wallet
senderWallet.balance -= transferAmount;

// 11. Credit Receiver Wallet
receiverWallet.balance += transferAmount;

// 12. Save Sender Wallet
await senderWallet.save({ session });

// 13. Save Receiver Wallet
await receiverWallet.save({ session });
await Transaction.create(
[
{
    walletId: senderWallet._id,
    userId: sender._id,

    senderName: sender.fullName,
senderSRPayId: sender.srpayId,

receiverId: receiver._id,
receiverName: receiver.fullName,
receiverSRPayId: receiver.srpayId,

    type: "DEBIT",
    amount: transferAmount,

    description: `Sent money to ${receiver.fullName}`,

    balanceAfter: senderWallet.balance,

    status: "SUCCESS",
}
],
{ session }
);
await Transaction.create(
[
{
    walletId: receiverWallet._id,
    userId: receiver._id,

   senderName: receiver.fullName,
senderSRPayId: receiver.srpayId,

receiverId: sender._id,
receiverName: sender.fullName,
receiverSRPayId: sender.srpayId,

    type: "CREDIT",
    amount: transferAmount,

    description: `Received money from ${sender.fullName}`,

    balanceAfter: receiverWallet.balance,

    status: "SUCCESS",
}
],
{ session }
);
// Sender Notification
await createNotificationService(
    sender._id,
    "Money Sent",
    `₹${transferAmount} sent successfully to ${receiver.fullName}.`,
    "TRANSFER"
);

// Receiver Notification
await createNotificationService(
    receiver._id,
    "Money Received",
    `₹${transferAmount} received from ${sender.fullName}.`,
    "TRANSFER"
);
    await session.commitTransaction();
    session.endSession();

    return {
    sender: {
        fullName: sender.fullName,
        srpayId: sender.srpayId,
    },
    receiver: {
        fullName: receiver.fullName,
        srpayId: receiver.srpayId,
    },
    amount: transferAmount,
    senderBalance: senderWallet.balance,
    receiverBalance: receiverWallet.balance,
};

} catch (error) {

    await session.abortTransaction();
    session.endSession();

    throw error;
}
};
module.exports = {
    getWalletService,
    addMoneyService,
    sendMoneyService,
};