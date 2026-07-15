const BankAccount = require("../models/BankAccount");
const User = require("../models/User");

// ================= ADD BANK ACCOUNT =================
const addBankAccountService = async (userId, accountData) => {
    const { accountHolderName, bankName, accountNumber, ifscCode, accountType } = accountData;

    // Validate required fields
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
        throw new Error("All bank account fields are required");
    }

    // Check for duplicate
    const existing = await BankAccount.findOne({ accountNumber, ifscCode });
    if (existing) throw new Error("Bank account already exists");

    const count = await BankAccount.countDocuments({ userId });
    const isPrimary = count === 0;

    const bankAccount = await BankAccount.create({
        userId,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        accountType: accountType || "SAVINGS",
        isPrimary,
    });

    return {
        id: bankAccount._id,
        accountHolderName: bankAccount.accountHolderName,
        bankName: bankAccount.bankName,
        accountNumber: maskAccountNumber(bankAccount.accountNumber),
        ifscCode: bankAccount.ifscCode,
        accountType: bankAccount.accountType,
        isPrimary: bankAccount.isPrimary,
        isVerified: bankAccount.isVerified,
        createdAt: bankAccount.createdAt,
    };
};

// ================= GET USER BANK ACCOUNTS =================
const getBankAccountsService = async (userId) => {
    const accounts = await BankAccount.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

    return accounts.map((acc) => ({
        id: acc._id,
        accountHolderName: acc.accountHolderName,
        bankName: acc.bankName,
        accountNumber: maskAccountNumber(acc.accountNumber),
        ifscCode: acc.ifscCode,
        accountType: acc.accountType,
        isPrimary: acc.isPrimary,
        isVerified: acc.isVerified,
        createdAt: acc.createdAt,
    }));
};

// ================= SET PRIMARY BANK ACCOUNT =================
const setPrimaryBankService = async (userId, accountId) => {
    const account = await BankAccount.findOne({ _id: accountId, userId });
    if (!account) throw new Error("Bank account not found");

    await BankAccount.updateMany({ userId }, { isPrimary: false });
    account.isPrimary = true;
    await account.save();

    return { message: "Primary bank account updated", bankName: account.bankName };
};

// ================= DELETE BANK ACCOUNT =================
const deleteBankAccountService = async (userId, accountId) => {
    const account = await BankAccount.findOne({ _id: accountId, userId });
    if (!account) throw new Error("Bank account not found");
    if (account.isPrimary) throw new Error("Cannot delete primary bank account. Set another as primary first.");

    await BankAccount.deleteOne({ _id: accountId });

    return { message: "Bank account deleted successfully" };
};

// ================= VERIFY BANK ACCOUNT (Simulated) =================
const verifyBankAccountService = async (userId, accountId) => {
    const account = await BankAccount.findOne({ _id: accountId, userId });
    if (!account) throw new Error("Bank account not found");

    // Simulate verification (in real world, use penny drop API)
    account.isVerified = true;
    await account.save();

    return { message: "Bank account verified successfully", isVerified: true };
};

// ================= WITHDRAW TO BANK (Wallet → Bank) =================
const withdrawToBankService = async (userId, accountId, amount, transactionPin) => {
    const Wallet = require("../models/Wallet");
    const Transaction = require("../models/Transaction");
    const { verifyTransactionPinService } = require("./authService");

    const account = await BankAccount.findOne({ _id: accountId, userId });
    if (!account) throw new Error("Bank account not found");

    if (!account.isVerified) throw new Error("Bank account not verified");

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) throw new Error("Invalid amount");

    // Verify PIN
    await verifyTransactionPinService(userId, transactionPin);

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    if (!wallet.isActive) throw new Error("Wallet is inactive");
    if (wallet.balance < transferAmount) throw new Error("Insufficient balance");

    const mongoose = require("mongoose");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        wallet.balance -= transferAmount;
        await wallet.save({ session });

        const user = await User.findById(userId);

        await Transaction.create([{
            walletId: wallet._id,
            userId,
            senderName: user.fullName,
            senderSRPayId: user.srpayId,
            receiverName: account.accountHolderName,
            receiverSRPayId: null,
            type: "DEBIT",
            amount: transferAmount,
            description: `Withdrawal to ${account.bankName} ${maskAccountNumber(account.accountNumber)}`,
            balanceAfter: wallet.balance,
            paymentMethod: "WALLET",
            status: "SUCCESS",
        }], { session });

        const { createNotificationService } = require("./notificationService");
        await createNotificationService(
            userId,
            "Bank Withdrawal",
            `₹${transferAmount} withdrawn to ${account.bankName} account ${maskAccountNumber(account.accountNumber)}.`,
            "WALLET"
        );

        await session.commitTransaction();
        session.endSession();

        return {
            amount: transferAmount,
            bankName: account.bankName,
            accountNumber: maskAccountNumber(account.accountNumber),
            balance: wallet.balance,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Helper: Mask account number
const maskAccountNumber = (accNo) => {
    if (!accNo) return "";
    const visible = accNo.slice(-4);
    return `XXXX${visible}`;
};

module.exports = {
    addBankAccountService,
    getBankAccountsService,
    setPrimaryBankService,
    deleteBankAccountService,
    verifyBankAccountService,
    withdrawToBankService,
};