const Otp = require("../models/Otp");
const crypto = require("crypto");
const { sendSMS } = require("./smsService");

// ================= GENERATE OTP =================
const generateOtp = () => {
  // In development without SMS_API_KEY, use fixed OTP
  if (process.env.NODE_ENV === "development" && !process.env.SMS_API_KEY) {
    return "123456";
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SEND OTP VIA SMS =================
const sendOtpSMS = async (phone, otp, purpose) => {
  const message = `Your SRPay OTP for ${purpose} is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone. - SRPay`;

  const sent = await sendSMS(phone, message);

  if (sent) {
    console.log(`✅ Real SMS sent to ${phone} for ${purpose}`);
  } else {
    // Fallback: Log OTP to console when SMS provider not configured
    console.log(`\n📱 ====== OTP (Simulated - No SMS Provider) ======`);
    console.log(`📞 Phone: ${phone}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`🎯 Purpose: ${purpose}`);
    console.log(`📋 Set SMS_API_KEY in .env to send real SMS`);
    console.log(`================================================\n`);
  }

  return sent;
};

// ================= CREATE & SEND OTP =================
const createAndSendOtp = async (phone, purpose) => {
  // Check for existing unexpired OTP
  const existing = await Otp.findOne({
    phone,
    purpose,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (existing) {
    // Resend same OTP
    await sendOtpSMS(phone, existing.otp, purpose);
    return {
      message: "OTP sent to your registered mobile number",
      expiresIn: Math.floor((existing.expiresAt - new Date()) / 1000),
      // Show OTP when no SMS provider configured (dev + production without SMS_API_KEY)
      ...(!process.env.SMS_API_KEY ? { otp: existing.otp } : {}),
    };
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.create({ phone, otp, purpose, expiresAt });
  await sendOtpSMS(phone, otp, purpose);

  return {
    message: "OTP sent to your registered mobile number",
    expiresIn: 300,
    // Show OTP when no SMS provider configured (dev + production without SMS_API_KEY)
    ...(!process.env.SMS_API_KEY ? { otp } : {}),
  };
};

// ================= VERIFY OTP =================
const verifyOtp = async (phone, otp, purpose) => {
  const otpRecord = await Otp.findOne({
    phone,
    purpose,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (otpRecord.attempts >= 5) {
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error(`Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`);
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return true;
};

module.exports = {
  generateOtp,
  sendOtpSMS,
  createAndSendOtp,
  verifyOtp,
};