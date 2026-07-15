const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const { createAndSendOtp, verifyOtp, verifyFirebaseOtpService } = require("../services/otpService");

// ================= SEND OTP =================
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, purpose } = req.body;

  if (!phone || !purpose) {
    throw new AppError("Phone number and purpose are required", 400);
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new AppError("Invalid Indian mobile number", 400);
  }

  if (!["register", "login", "transaction", "change-pin"].includes(purpose)) {
    throw new AppError("Invalid OTP purpose", 400);
  }

  const result = await createAndSendOtp(phone, purpose);

  res.status(200).json({
    success: true,
    message: result.message,
    expiresIn: result.expiresIn,
    ...(result.otp ? { otp: result.otp } : {}),
  });
});

// ================= VERIFY OTP =================
const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { phone, otp, purpose } = req.body;

  if (!phone || !otp || !purpose) {
    throw new AppError("Phone, OTP, and purpose are required", 400);
  }

  await verifyOtp(phone, otp, purpose);

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

// ================= VERIFY FIREBASE TOKEN (Client-side Firebase Auth) =================
const verifyFirebaseOtp = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("Firebase ID token is required", 400);
  }

  const result = await verifyFirebaseOtpService(idToken);

  res.status(200).json({
    success: true,
    message: "Firebase phone verified successfully",
    data: {
      phone: result.phone,
      verified: result.verified,
    },
  });
});

module.exports = {
  sendOtp,
  verifyOtp: verifyOtpHandler,
  verifyFirebaseOtp,
};