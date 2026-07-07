const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Wallet = require("../models/Wallet");
const generateSRPayId = require("../utils/generateSRPayId");
const validateTransactionPin = require("../utils/pinValidator");
// ================= REGISTER USER =================

const registerUserService = async (userData) => {
    const { fullName, email, phone, password } = userData;

    // Validate input
    if (!fullName || !email || !phone || !password) {
        throw new Error("All fields are required");
    }

    // Check existing email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
        throw new Error("Email already registered");
    }

    // Check existing phone
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
        throw new Error("Phone number already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
let srpayId;

while (true) {
    srpayId = generateSRPayId();

    const existingUser = await User.findOne({ srpayId });

    if (!existingUser) {
        break;
    }
}

const newUser = await User.create({
    fullName,
    email,
    phone,
    srpayId,
    password: hashedPassword,
});
// Create Wallet
const wallet = await Wallet.create({
    userId: newUser._id,
});

// Link wallet to user
newUser.walletId = wallet._id;
await newUser.save();

// Return response
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

    // Validate input
    if (!email || !password) {
        throw new Error("Email and Password are required");
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid Email or Password");
    }
// ================= CHECK BLOCKED USER =================

if (user.isBlocked) {

    throw new Error(
        "Your account has been blocked. Please contact support."
    );

}
    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new Error("Invalid Email or Password");
    }

    // Generate JWT Token
    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
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

// ================= GET PROFILE =================

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
    createdAt: user.createdAt,
};
};
// ================= SET TRANSACTION PIN =================

const setTransactionPinService = async (userId, pinData) => {

    const { transactionPin, confirmTransactionPin } = pinData;

    // Check Required Fields
    if (!transactionPin || !confirmTransactionPin) {
        throw new Error("Transaction PIN and Confirm PIN are required");
    }

    // Check Confirm PIN
    if (transactionPin !== confirmTransactionPin) {
        throw new Error("Transaction PINs do not match");
    }

    // Validate PIN
    validateTransactionPin(transactionPin);

    // Find User
    const user = await User.findById(userId).select("+transactionPin");

    if (!user) {
        throw new Error("User not found");
    }

    // Already Set?
    if (user.transactionPin) {
        throw new Error(
            "Transaction PIN already exists. Please use Change Transaction PIN."
        );
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(transactionPin, 10);

    // Save PIN
    user.transactionPin = hashedPin;

    await user.save();

    return;
};
// ================= VERIFY TRANSACTION PIN =================

const verifyTransactionPinService = async (
    userId,
    transactionPin
) => {

    // Check Required Field
    if (!transactionPin) {
        throw new Error("Transaction PIN is required");
    }

    // Find User
   const user = await User.findById(userId)
.select(
"+transactionPin failedPinAttempts transactionPinLockedUntil"
);
    if (!user) {
        throw new Error("User not found");
    }
// Check if Transaction PIN is Locked
// Check if Transaction PIN is Locked
if (user.transactionPinLockedUntil) {

    // Still Locked
    if (user.transactionPinLockedUntil > new Date()) {
        throw new Error(
            "Transaction PIN is locked. Please try again after 30 minutes."
        );
    }

    // Lock Expired -> Auto Unlock
    user.failedPinAttempts = 0;
    user.transactionPinLockedUntil = null;

    await user.save();
}
    // PIN Not Set
    if (!user.transactionPin) {
        throw new Error(
            "Please set your Transaction PIN first."
        );
    }

    // Compare PIN
    const isPinCorrect = await bcrypt.compare(
        transactionPin,
        user.transactionPin
    );

    if (!isPinCorrect) {

    user.failedPinAttempts += 1;

    // Lock after 5 attempts
    if (user.failedPinAttempts >= 5) {

        user.transactionPinLockedUntil = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await user.save();

        throw new Error(
            "Transaction PIN locked for 30 minutes due to multiple failed attempts."
        );
    }

    await user.save();

    throw new Error(
        `Invalid Transaction PIN. Attempts remaining: ${
            5 - user.failedPinAttempts
        }`
    );
}
// Reset Failed Attempts
user.failedPinAttempts = 0;
user.transactionPinLockedUntil = null;

await user.save();
    return true;

};
// ================= CHANGE TRANSACTION PIN =================

const changeTransactionPinService = async (
    userId,
    pinData
) => {

    const {
        oldTransactionPin,
        newTransactionPin,
        confirmTransactionPin,
    } = pinData;

    // Required Fields
    if (
        !oldTransactionPin ||
        !newTransactionPin ||
        !confirmTransactionPin
    ) {
        throw new Error("All PIN fields are required");
    }

    // Verify Existing PIN
    await verifyTransactionPinService(
        userId,
        oldTransactionPin
    );

    // Confirm PIN
    if (newTransactionPin !== confirmTransactionPin) {
        throw new Error("New Transaction PINs do not match");
    }

    // New PIN Validation
    validateTransactionPin(newTransactionPin);

    // Prevent Same PIN
    if (oldTransactionPin === newTransactionPin) {
        throw new Error(
            "New Transaction PIN cannot be the same as the old PIN"
        );
    }

    // Get User
   const user = await User.findById(userId)
.select(
"+transactionPin +transactionPinHistory failedPinAttempts transactionPinLockedUntil"
);
    // Hash New PIN
    for (const oldPinHash of user.transactionPinHistory) {

    const isOldPin = await bcrypt.compare(
        newTransactionPin,
        oldPinHash
    );

    if (isOldPin) {
        throw new Error(
            "You cannot reuse any of your last 5 Transaction PINs."
        );
    }
}

   // Save Current PIN into History
if (user.transactionPin) {
    user.transactionPinHistory.unshift(
        user.transactionPin
    );
}

// Keep Only Last 5 PINs
if (user.transactionPinHistory.length > 5) {
    user.transactionPinHistory =
        user.transactionPinHistory.slice(0, 5);
}

// Hash New PIN
user.transactionPin = await bcrypt.hash(
    newTransactionPin,
    10
);

await user.save();

    return;

};
module.exports = {
    registerUserService,
    loginUserService,
    getProfileService,
    setTransactionPinService,
    verifyTransactionPinService,
    changeTransactionPinService,
};