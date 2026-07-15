const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const {
    registerUserService,
    loginUserService,
    getProfileService,
    updateProfileService,
    submitKycService,
    toggleTwoFactorService,
    updateLimitsService,
    changePasswordService,
    getDashboardStatsService,
    setTransactionPinService,
    verifyTransactionPinService,
    changeTransactionPinService,
} = require("../services/authService");

// ================= REGISTER USER =================
const registerUser = asyncHandler(async (req, res) => {
    const user = await registerUserService(req.body);

    res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        user,
    });
});

// ================= LOGIN USER =================
const loginUser = asyncHandler(async (req, res) => {
    const data = await loginUserService(req.body);

    res.status(200).json({
        success: true,
        message: "Login Successful",
        token: data.token,
        user: data.user,
    });
});

// ================= GET PROFILE =================
const getProfile = asyncHandler(async (req, res) => {
    const user = await getProfileService(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// ================= UPDATE PROFILE =================
const updateProfile = asyncHandler(async (req, res) => {
    const result = await updateProfileService(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// ================= SUBMIT KYC =================
const submitKyc = asyncHandler(async (req, res) => {
    const result = await submitKycService(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: result.message,
        data: { isKycCompleted: result.isKycCompleted },
    });
});

// ================= TOGGLE 2FA =================
const toggleTwoFactor = asyncHandler(async (req, res) => {
    const result = await toggleTwoFactorService(req.user.id);

    res.status(200).json({
        success: true,
        message: result.isTwoFactorEnabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        data: result,
    });
});

// ================= UPDATE LIMITS =================
const updateLimits = asyncHandler(async (req, res) => {
    const result = await updateLimitsService(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: "Transaction limits updated",
        data: result,
    });
});

// ================= CHANGE PASSWORD =================
const changePassword = asyncHandler(async (req, res) => {
    const result = await changePasswordService(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// ================= GET DASHBOARD STATS =================
const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStatsService(req.user.id);

    res.status(200).json({
        success: true,
        data: stats,
    });
});

// ================= SET TRANSACTION PIN =================
const setTransactionPin = asyncHandler(async (req, res) => {
    await setTransactionPinService(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: "Transaction PIN set successfully",
    });
});

// ================= VERIFY TRANSACTION PIN =================
const verifyTransactionPin = asyncHandler(async (req, res) => {
    const { transactionPin } = req.body;

    if (!transactionPin) {
        throw new AppError("Transaction PIN is required", 400);
    }

    await verifyTransactionPinService(req.user.id, transactionPin);

    res.status(200).json({
        success: true,
        message: "Transaction PIN verified successfully",
    });
});

// ================= CHANGE TRANSACTION PIN =================
const changeTransactionPin = asyncHandler(async (req, res) => {
    await changeTransactionPinService(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: "Transaction PIN changed successfully",
    });
});

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    submitKyc,
    toggleTwoFactor,
    updateLimits,
    changePassword,
    getDashboardStats,
    setTransactionPin,
    verifyTransactionPin,
    changeTransactionPin,
};