const rateLimit = require("express-rate-limit");

const message = { success: false, message: "Too many requests. Please try again later." };

// ================= AUTH (Login, Register, OTP) =================
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute per IP
    message,
    standardHeaders: true,
    legacyHeaders: false,
});

// ================= GENERAL API =================
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute per IP (enough for page loads)
    message,
    standardHeaders: true,
    legacyHeaders: false,
});

// ================= STRICT LIMIT: Transaction PIN verification =================
const pinLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Max 20 PIN attempts per hour
    message: {
        success: false,
        message: "Too many PIN attempts. Please try again after 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ================= STRICT LIMIT: Money sending =================
const transactionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Max 30 send transactions per hour
    message: {
        success: false,
        message: "Transaction limit reached. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter,
    pinLimiter,
    transactionLimiter,
};