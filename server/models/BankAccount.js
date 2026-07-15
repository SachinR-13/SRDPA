const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        accountHolderName: {
            type: String,
            required: [true, "Account holder name is required"],
            trim: true,
        },
        bankName: {
            type: String,
            required: [true, "Bank name is required"],
            trim: true,
        },
        accountNumber: {
            type: String,
            required: [true, "Account number is required"],
            trim: true,
        },
        ifscCode: {
            type: String,
            required: [true, "IFSC code is required"],
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"],
        },
        accountType: {
            type: String,
            enum: ["SAVINGS", "CURRENT", "SALARY"],
            default: "SAVINGS",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
        upiHandle: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

bankAccountSchema.index({ userId: 1 });
bankAccountSchema.index({ accountNumber: 1, ifscCode: 1 }, { unique: true });

module.exports = mongoose.model("BankAccount", bankAccountSchema);