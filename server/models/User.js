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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;