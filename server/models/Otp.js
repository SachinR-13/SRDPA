const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    purpose: {
      type: String,
      enum: ["register", "login", "transaction", "change-pin"],
      required: [true, "Purpose is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry is required"],
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, purpose: 1 });

module.exports = mongoose.model("Otp", otpSchema);