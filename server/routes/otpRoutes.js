const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, verifyFirebaseOtp } = require("../controllers/otpController");

// POST /api/otp/send - Send OTP via SMS (for non-Firebase users or fallback)
router.post("/send", sendOtp);

// POST /api/otp/verify - Verify OTP (traditional OTP verification)
router.post("/verify", verifyOtp);

// POST /api/otp/verify-firebase - Verify Firebase ID token (for client-side Firebase Phone Auth)
router.post("/verify-firebase", verifyFirebaseOtp);

module.exports = router;
