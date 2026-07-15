const mongoose = require("mongoose");

const upiIdSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        upiId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        nickname: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

upiIdSchema.index({ userId: 1 });

module.exports = mongoose.model("UpiId", upiIdSchema);