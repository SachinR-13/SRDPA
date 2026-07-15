const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {
    registerValidator,
    loginValidator,
} = require("../validators/authValidator");
const {
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
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
// Register User
router.post("/register", registerValidator, validate, registerUser);

// Login User
router.post("/login", loginValidator, validate, loginUser);

// Send Login OTP
router.post("/send-login-otp", async (req, res) => {
    try {
        const { sendLoginOtpService } = require("../services/authService");
        const { createAndSendOtp } = require("../services/otpService");
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }
        await sendLoginOtpService(phone);
        const result = await createAndSendOtp(phone, "login");
        res.status(200).json({
            success: true,
            message: result.message,
            expiresIn: result.expiresIn,
            ...(result.otp ? { otp: result.otp } : {}),
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Verify Login OTP
router.post("/verify-login-otp", async (req, res) => {
    try {
        const { verifyOtp } = require("../services/otpService");
        const { verifyLoginOtpService } = require("../services/authService");
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone and OTP are required" });
        }

        await verifyOtp(phone, otp, "login");
        const data = await verifyLoginOtpService(phone);

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token: data.token,
            user: data.user,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ================= PROTECTED ROUTES =================

// Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// KYC
router.post("/kyc", authMiddleware, submitKyc);

// Security
router.post("/toggle-2fa", authMiddleware, toggleTwoFactor);
router.post("/change-password", authMiddleware, changePassword);

// Limits
router.put("/limits", authMiddleware, updateLimits);

// Dashboard
router.get("/dashboard", authMiddleware, getDashboardStats);

// Transaction PIN
router.post("/set-transaction-pin", authMiddleware, setTransactionPin);
router.post("/verify-transaction-pin", authMiddleware, verifyTransactionPin);
router.post("/change-transaction-pin", authMiddleware, changeTransactionPin);

module.exports = router;