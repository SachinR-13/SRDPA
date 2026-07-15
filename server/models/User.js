const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"],
    },
    srpayId: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    transactionPin: {
      type: String,
      default: null,
      select: false,
    },
    failedPinAttempts: {
      type: Number,
      default: 0,
    },

    transactionPinLockedUntil: {
      type: Date,
      default: null,
    },
    transactionPinHistory: {
      type: [String],
      default: [],
      select: false,
    },
    profileImage: {
      type: String,
      default: "",
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },

    // ================= ENHANCED PROFILE FIELDS =================
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    // ================= ACCOUNT SETTINGS =================
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    dailyLimit: {
      type: Number,
      default: 50000, // ₹50,000 default daily limit
    },
    transactionLimit: {
      type: Number,
      default: 10000, // ₹10,000 per transaction default
    },
    // ================= ROLE & STATUS =================
    role: {
      type: String,
      enum: ["user", "merchant", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isKycCompleted: {
      type: Boolean,
      default: false,
    },
    kycDetails: {
      panCard: { type: String, default: "" },
      aadhaarLast4: { type: String, default: "" },
      kycVerifiedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;