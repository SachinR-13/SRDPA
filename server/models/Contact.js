const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        contactUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        nickname: {
            type: String,
            default: "",
            trim: true,
            maxlength: 30,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
        lastTransactionAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

contactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });
contactSchema.index({ userId: 1, isFavorite: -1 });
contactSchema.index({ userId: 1, lastTransactionAt: -1 });

module.exports = mongoose.model("Contact", contactSchema);