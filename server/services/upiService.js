const UpiId = require("../models/UpiId");
const User = require("../models/User");

// ================= CREATE UPI ID =================
const createUpiIdService = async (userId, nickname) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Generate UPI ID: user.srpayId@srpay
    const handle = user.srpayId.toLowerCase();
    const upiId = `${handle}@srpay`;

    const existing = await UpiId.findOne({ upiId });
    if (existing) throw new Error("UPI ID already exists");

    // Check if this is the first UPI ID → make primary
    const count = await UpiId.countDocuments({ userId });
    const isPrimary = count === 0;

    const newUpi = await UpiId.create({
        userId,
        upiId,
        nickname: nickname || `My UPI ID`,
        isPrimary,
    });

    return {
        id: newUpi._id,
        upiId: newUpi.upiId,
        nickname: newUpi.nickname,
        isPrimary: newUpi.isPrimary,
        createdAt: newUpi.createdAt,
    };
};

// ================= GET USER UPI IDS =================
const getUserUpiIdsService = async (userId) => {
    const upiIds = await UpiId.find({ userId, isActive: true }).sort({ isPrimary: -1, createdAt: -1 });

    return upiIds.map((upi) => ({
        id: upi._id,
        upiId: upi.upiId,
        nickname: upi.nickname,
        isPrimary: upi.isPrimary,
        createdAt: upi.createdAt,
    }));
};

// ================= SET PRIMARY UPI =================
const setPrimaryUpiService = async (userId, upiId) => {
    const upi = await UpiId.findOne({ _id: upiId, userId });
    if (!upi) throw new Error("UPI ID not found");

    await UpiId.updateMany({ userId }, { isPrimary: false });
    upi.isPrimary = true;
    await upi.save();

    return { message: "Primary UPI ID updated", upiId: upi.upiId };
};

// ================= DELETE UPI ID =================
const deleteUpiIdService = async (userId, upiId) => {
    const upi = await UpiId.findOne({ _id: upiId, userId });
    if (!upi) throw new Error("UPI ID not found");
    if (upi.isPrimary) throw new Error("Cannot delete primary UPI ID. Set another as primary first.");

    upi.isActive = false;
    await upi.save();

    return { message: "UPI ID deleted successfully" };
};

// ================= RESOLVE UPI ID (Find user by UPI) =================
const resolveUpiIdService = async (upiId) => {
    const upi = await UpiId.findOne({ upiId, isActive: true }).populate("userId", "fullName srpayId profileImage");
    if (!upi) throw new Error("UPI ID not found");

    return {
        fullName: upi.userId.fullName,
        srpayId: upi.userId.srpayId,
        profileImage: upi.userId.profileImage,
        upiId: upi.upiId,
        nickname: upi.nickname,
    };
};

module.exports = {
    createUpiIdService,
    getUserUpiIdsService,
    setPrimaryUpiService,
    deleteUpiIdService,
    resolveUpiIdService,
};