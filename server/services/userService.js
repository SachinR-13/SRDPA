const User = require("../models/User");
const QRCode = require("qrcode");
const searchUsersService = async (query, loggedInUserId) => {

    if (!query) {
        throw new Error("Search query is required");
    }

    const users = await User.find({
        _id: { $ne: loggedInUserId }, // Exclude logged-in user
        $or: [
            {
                fullName: {
                    $regex: query,
                    $options: "i",
                },
            },
            {
                phone: {
                    $regex: query,
                    $options: "i",
                },
            },
            {
                srpayId: {
                    $regex: query,
                    $options: "i",
                },
            },
        ],
    }).select(
        "fullName phone srpayId profileImage isVerified"
    );

    return users;
};
// ================= GENERATE MY QR =================

const generateMyQRService = async (userId) => {

    // Find User
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // QR Data
    const qrData = `SRPAY://PAY?user=${user.srpayId}`;

    // Generate QR Image (Base64)
    const qrImage = await QRCode.toDataURL(qrData);

    return {
        srpayId: user.srpayId,
        qrData,
        qrImage,
    };
};
// ================= SCAN QR =================

const scanQRService = async (qrData) => {

    // Check QR Data
    if (!qrData) {
        throw new Error("QR data is required");
    }

    // Expected Format:
    // SRPAY://PAY?user=SRP823517

    const prefix = "SRPAY://PAY?user=";

    if (!qrData.startsWith(prefix)) {
        throw new Error("Invalid QR Code");
    }

    // Extract SRPay ID
    const srpayId = qrData.substring(prefix.length);

    // Find User
    const user = await User.findOne({ srpayId });

    if (!user) {
        throw new Error("User not found");
    }

    return {
        fullName: user.fullName,
        srpayId: user.srpayId,
        profileImage: user.profileImage,
    };

};
// ================= GENERATE DYNAMIC QR =================

const generateDynamicQRService = async (
    userId,
    amount,
    note
) => {

    if (!amount || amount <= 0) {
        throw new Error(
            "Valid amount is required"
        );
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const qrData =
        `SRPAY://PAY?user=${user.srpayId}&amount=${amount}&note=${encodeURIComponent(note || "")}`;

    const qrImage =
        await QRCode.toDataURL(qrData);

    return {

        srpayId: user.srpayId,

        amount,

        note,

        qrData,

        qrImage,

    };

};
// ================= SCAN DYNAMIC QR =================

const scanDynamicQRService = async (qrData) => {

    // Check QR Data
    if (!qrData) {
        throw new Error("QR data is required");
    }

    let url;

    try {

        url = new URL(qrData);

    } catch {

        throw new Error("Invalid QR Code");

    }

    if (
        url.protocol !== "srpay:" ||
        url.hostname.toUpperCase() !== "PAY"
    ) {
        throw new Error("Invalid QR Code");
    }

    const srpayId = url.searchParams.get("user");
    const amount = Number(
        url.searchParams.get("amount")
    );
    const note =
        url.searchParams.get("note") || "";

    if (!srpayId) {
        throw new Error("Invalid QR Code");
    }

    const user = await User.findOne({
        srpayId,
    });

    if (!user) {
        throw new Error("User not found");
    }

    return {

        fullName: user.fullName,

        srpayId: user.srpayId,

        profileImage: user.profileImage,

        amount,

        note,

    };

};
module.exports = {
    searchUsersService,
    generateMyQRService,
     scanQRService,
     generateDynamicQRService,
     scanDynamicQRService,
};