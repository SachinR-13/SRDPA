const asyncHandler = require("../middleware/asyncHandler");
const bankService = require("../services/bankService");
const AppError = require("../utils/AppError");

// ================= ADD BANK ACCOUNT =================
exports.addBankAccount = asyncHandler(async (req, res) => {
    const result = await bankService.addBankAccountService(req.user.id, req.body);

    res.status(201).json({
        success: true,
        message: "Bank account added successfully",
        data: result,
    });
});

// ================= GET ALL BANK ACCOUNTS =================
exports.getBankAccounts = asyncHandler(async (req, res) => {
    const result = await bankService.getBankAccountsService(req.user.id);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// ================= SET PRIMARY BANK =================
exports.setPrimaryBank = asyncHandler(async (req, res) => {
    const { accountId } = req.params;
    const result = await bankService.setPrimaryBankService(req.user.id, accountId);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// ================= DELETE BANK ACCOUNT =================
exports.deleteBankAccount = asyncHandler(async (req, res) => {
    const { accountId } = req.params;
    const result = await bankService.deleteBankAccountService(req.user.id, accountId);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// ================= VERIFY BANK ACCOUNT =================
exports.verifyBankAccount = asyncHandler(async (req, res) => {
    const { accountId } = req.params;
    const result = await bankService.verifyBankAccountService(req.user.id, accountId);

    res.status(200).json({
        success: true,
        message: result.message,
        data: { isVerified: result.isVerified },
    });
});

// ================= WITHDRAW TO BANK =================
exports.withdrawToBank = asyncHandler(async (req, res) => {
    const { accountId, amount, transactionPin } = req.body;

    if (!accountId || !amount || !transactionPin) {
        throw new AppError("Account ID, amount, and transaction PIN are required", 400);
    }

    const result = await bankService.withdrawToBankService(req.user.id, accountId, amount, transactionPin);

    res.status(200).json({
        success: true,
        message: `₹${result.amount} withdrawn to ${result.bankName}`,
        data: result,
    });
});