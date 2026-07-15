const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/Wallet");
const generateSRPayId = require("../utils/generateSRPayId");
const validateTransactionPin = require("../utils/pinValidator");
const { verifyOtp } = require("./otpService");

// ================= REGISTER USER (OTP Verified) =================
const registerUserService = async (userData) => {
    const { fullName, email, phone, password } = userData;

    if (!fullName || !email || !phone || !password) {
        throw new Error("All fields are required");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new Error("Email already registered");
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
        throw new Error("Phone number already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let srpayId;
    while (true) {
        srpayId = generateSRPayId();
        const existingUser = await User.findOne({ srpayId });
        if (!existingUser) break;
    }

    const newUser = await User.create({
        fullName,
        email,
        phone,
        srpayId,
        password: hashedPassword,
        isVerified: true, // Phone verified via OTP
    });

    const wallet = await Wallet.create({
        userId: newUser._id,
    });

    await User.findByIdAndUpdate(newUser._id, {
        walletId: wallet._id,
    });

    return {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        srpayId: newUser.srpayId,
        walletId: wallet._id,
    };
};

// ================= LOGIN USER =================
const loginUserService = async (loginData) => {
    const { email, password } = loginData;

    if (!email || !password) {
        throw new Error("Email and Password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new Error("Invalid Email or Password");
    }

    if (user.isBlocked) {
        throw new Error("Your account has been blocked. Please contact support.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid Email or Password");
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            srpayId: user.srpayId,
            role: user.role,
        },
    };
};

// ================= PHONE LOGIN (Send OTP) =================
const sendLoginOtpService = async (phone) => {
    const user = await User.findOne({ phone });
    if (!user) {
        throw new Error("No account found with this phone number");
    }

    if (user.isBlocked) {
        throw new Error("Your account has been blocked. Please contact support.");
    }

    // OTP is sent via the OTP route separately
    return {
        message: "OTP sent to your registered mobile number",
        phone: user.phone,
    };
};

// ================= PHONE LOGIN (Verify OTP) =================
const verifyLoginOtpService = async (phone) => {
    const user = await User.findOne({ phone });
    if (!user) {
        throw new Error("User not found");
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            srpayId: user.srpayId,
            role: user.role,
        },
    };
};

// ================= GET PROFILE (Enhanced) =================
const getProfileService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        srpayId: user.srpayId,
        profileImage: user.profileImage,
        role: user.role,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        isKycCompleted: user.isKycCompleted,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        dailyLimit: user.dailyLimit,
        transactionLimit: user.transactionLimit,
        createdAt: user.createdAt,
    };
};

// ================= UPDATE PROFILE =================
const updateProfileService = async (userId, updateData) => {
    const allowedFields = ["fullName", "dateOfBirth", "gender", "address"];
    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    // Validate address structure
    if (updates.address) {
        const { street, city, state, pincode } = updates.address;
        if (pincode && !/^\d{6}$/.test(pincode)) {
            throw new Error("Invalid pincode format");
        }
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) throw new Error("User not found");

    return { message: "Profile updated successfully" };
};

// ================= SUBMIT KYC =================
const submitKycService = async (userId, kycData) => {
    const { panCard, aadhaarLast4 } = kycData;

    if (!panCard || !aadhaarLast4) {
        throw new Error("PAN card and Aadhaar last 4 digits are required");
    }

    // Validate PAN: ABCDE1234F
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard.toUpperCase())) {
        throw new Error("Invalid PAN card format");
    }

    // Validate Aadhaar last 4
    if (!/^\d{4}$/.test(aadhaarLast4)) {
        throw new Error("Invalid Aadhaar last 4 digits");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.isKycCompleted = true;
    user.kycDetails = {
        panCard: panCard.toUpperCase(),
        aadhaarLast4,
        kycVerifiedAt: new Date(),
    };
    await user.save();

    return { message: "KYC submitted successfully", isKycCompleted: true };
};

// ================= TOGGLE 2FA =================
const toggleTwoFactorService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    return { isTwoFactorEnabled: user.isTwoFactorEnabled };
};

// ================= UPDATE LIMITS =================
const updateLimitsService = async (userId, limits) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (limits.dailyLimit !== undefined) {
        if (limits.dailyLimit < 0 || limits.dailyLimit > 100000) {
            throw new Error("Daily limit must be between ₹0 and ₹1,00,000");
        }
        user.dailyLimit = limits.dailyLimit;
    }

    if (limits.transactionLimit !== undefined) {
        if (limits.transactionLimit < 0 || limits.transactionLimit > 50000) {
            throw new Error("Transaction limit must be between ₹0 and ₹50,000");
        }
        user.transactionLimit = limits.transactionLimit;
    }

    await user.save();

    return {
        dailyLimit: user.dailyLimit,
        transactionLimit: user.transactionLimit,
    };
};

// ================= CHANGE PASSWORD =================
const changePasswordService = async (userId, passwordData) => {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
    }

    const user = await User.findById(userId).select("+password");
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");

    if (currentPassword === newPassword) {
        throw new Error("New password cannot be the same as the current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password changed successfully" };
};

// ================= GET DASHBOARD STATS =================
const getDashboardStatsService = async (userId) => {
    const Wallet = require("../models/Wallet");
    const Transaction = require("../models/Transaction");
    const mongoose = require("mongoose");

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This month range
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get today's transactions
    const todayTransactions = await Transaction.find({
        userId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Get monthly stats - use mongoose.Types.ObjectId for aggregation
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const monthlyStats = await Transaction.aggregate([
        {
            $match: {
                userId: userObjectId,
                createdAt: { $gte: monthStart },
            },
        },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);

    const monthlyIncome = monthlyStats.find((s) => s._id === "CREDIT")?.total || 0;
    const monthlyExpense = monthlyStats.find((s) => s._id === "DEBIT")?.total || 0;

    // Recent 5 transactions
    const recentTransactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("type amount description receiverName receiverSRPayId createdAt status");

    return {
        balance: wallet.balance,
        currency: wallet.currency,
        todayTransactions: todayTransactions.length,
        monthlyIncome,
        monthlyExpense,
        recentTransactions,
    };
};

// ================= SET TRANSACTION PIN =================
const setTransactionPinService = async (userId, pinData) => {
    const { transactionPin, confirmTransactionPin } = pinData;

    if (!transactionPin || !confirmTransactionPin) {
        throw new Error("Transaction PIN and Confirm PIN are required");
    }

    if (transactionPin !== confirmTransactionPin) {
        throw new Error("Transaction PINs do not match");
    }

    validateTransactionPin(transactionPin);

    const user = await User.findById(userId).select("+transactionPin");
    if (!user) {
        throw new Error("User not found");
    }

    if (user.transactionPin) {
        throw new Error("Transaction PIN already exists. Please use Change Transaction PIN.");
    }

    const hashedPin = await bcrypt.hash(transactionPin, 10);
    user.transactionPin = hashedPin;
    await user.save();

    return;
};

// ================= VERIFY TRANSACTION PIN =================
const verifyTransactionPinService = async (userId, transactionPin) => {
    if (!transactionPin) {
        throw new Error("Transaction PIN is required");
    }

    const user = await User.findById(userId).select(
        "+transactionPin failedPinAttempts transactionPinLockedUntil"
    );

    if (!user) {
        throw new Error("User not found");
    }

    if (user.transactionPinLockedUntil) {
        if (user.transactionPinLockedUntil > new Date()) {
            throw new Error("Transaction PIN is locked. Please try again after 30 minutes.");
        }
        user.failedPinAttempts = 0;
        user.transactionPinLockedUntil = null;
        await user.save();
    }

    if (!user.transactionPin) {
        throw new Error("Please set your Transaction PIN first.");
    }

    const isPinCorrect = await bcrypt.compare(transactionPin, user.transactionPin);
    if (!isPinCorrect) {
        user.failedPinAttempts += 1;
        if (user.failedPinAttempts >= 5) {
            user.transactionPinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            await user.save();
            throw new Error("Transaction PIN locked for 30 minutes due to multiple failed attempts.");
        }
        await user.save();
        throw new Error(`Invalid Transaction PIN. Attempts remaining: ${5 - user.failedPinAttempts}`);
    }

    user.failedPinAttempts = 0;
    user.transactionPinLockedUntil = null;
    await user.save();

    return true;
};

// ================= CHANGE TRANSACTION PIN =================
const changeTransactionPinService = async (userId, pinData) => {
    const { oldTransactionPin, newTransactionPin, confirmTransactionPin } = pinData;

    if (!oldTransactionPin || !newTransactionPin || !confirmTransactionPin) {
        throw new Error("All PIN fields are required");
    }

    await verifyTransactionPinService(userId, oldTransactionPin);

    if (newTransactionPin !== confirmTransactionPin) {
        throw new Error("New Transaction PINs do not match");
    }

    validateTransactionPin(newTransactionPin);

    if (oldTransactionPin === newTransactionPin) {
        throw new Error("New Transaction PIN cannot be the same as the old PIN");
    }

    const user = await User.findById(userId).select(
        "+transactionPin +transactionPinHistory failedPinAttempts transactionPinLockedUntil"
    );

    for (const oldPinHash of user.transactionPinHistory) {
        const isOldPin = await bcrypt.compare(newTransactionPin, oldPinHash);
        if (isOldPin) {
            throw new Error("You cannot reuse any of your last 5 Transaction PINs.");
        }
    }

    if (user.transactionPin) {
        user.transactionPinHistory.unshift(user.transactionPin);
    }

    if (user.transactionPinHistory.length > 5) {
        user.transactionPinHistory = user.transactionPinHistory.slice(0, 5);
    }

    user.transactionPin = await bcrypt.hash(newTransactionPin, 10);
    await user.save();

    return;
};

module.exports = {
    registerUserService,
    loginUserService,
    sendLoginOtpService,
    verifyLoginOtpService,
    getProfileService,
    updateProfileService,
    submitKycService,
    toggleTwoFactorService,
    updateLimitsService,
    changePasswordService,
    getDashboardStatsService,
    setTransactionPinService,
    verifyTransactionPinService,
    changeTransactionPinService,
};
