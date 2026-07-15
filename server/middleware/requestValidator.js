// ================= REQUEST SIZE & VALIDATION PROTECTION =================

// Block excessively large JSON bodies (beyond Express limit)
const MAX_BODY_SIZE = "10mb";

// Block suspicious content types
const BLOCKED_CONTENT_TYPES = [
    "application/x-www-form-urlencoded", // Only allow via explicit routes
    "multipart/form-data",                // Only allow via multer in upload routes
    "text/html",
    "application/xml",
];

// Suspicious headers that indicate proxy attacks (not standard reverse proxy headers)
const SUSPICIOUS_HEADERS = [
    "client-ip",
    "x-client-ip",
];

// Blocked URL patterns (SQL injection, path traversal, etc.)
const BLOCKED_URL_PATTERNS = [
    /['"\\;]/g,           // SQL injection chars
    /\.\.\//g,            // Path traversal
    /\.\.\\/g,            // Windows path traversal
    /\%[0-9a-f]{2}/gi,    // Double encoding
];

// ================= INPUT SANITIZER FOR ALL STRING FIELDS =================
const sanitizeInput = (value) => {
    if (typeof value === "string") {
        // Remove null bytes
        value = value.replace(/\0/g, "");
        // Remove control characters
        value = value.replace(/[\x00-\x1F\x7F]/g, "");
        // Trim whitespace
        value = value.trim();
        return value;
    }
    return value;
};

// Deep sanitize all string fields in object
const deepSanitizeStrings = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "string") {
            obj[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === "object") {
            deepSanitizeStrings(obj[key]);
        }
    }
};

// ================= SUSPICIOUS REQUEST DETECTION =================
const isSuspiciousRequest = (req) => {
    const url = req.originalUrl || req.url;

    // Check for blocked URL patterns
    for (const pattern of BLOCKED_URL_PATTERNS) {
        if (pattern.test(url)) {
            return true;
        }
    }

    // Check for suspicious headers
    for (const header of SUSPICIOUS_HEADERS) {
        if (req.headers[header]) {
            return true;
        }
    }

    // Check content type
    const contentType = req.headers["content-type"] || "";
    for (const blocked of BLOCKED_CONTENT_TYPES) {
        if (contentType.includes(blocked) && !req.path.startsWith("/api/upload")) {
            // Block if not an upload route
            if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
                // But allow url-encoded for OTP routes
                if (req.path.includes("/otp/") && blocked === "application/x-www-form-urlencoded") {
                    continue;
                }
                return true;
            }
        }
    }

    return false;
};

// ================= MAIN REQUEST VALIDATOR MIDDLEWARE =================
const requestValidator = (req, res, next) => {
    // 1. Block suspicious requests
    if (isSuspiciousRequest(req)) {
        return res.status(400).json({
            success: false,
            message: "Bad request",
        });
    }

    // 2. Sanitize all string inputs
    deepSanitizeStrings(req.body);
    deepSanitizeStrings(req.query);
    deepSanitizeStrings(req.params);

    // 3. Validate content-type for requests with body
    if (req.method !== "GET" && req.method !== "DELETE") {
        const ct = req.headers["content-type"] || "";
        if (!ct.includes("application/json") && !ct.includes("multipart/form-data")) {
            return res.status(415).json({
                success: false,
                message: "Unsupported Media Type. Use application/json",
            });
        }
    }

    next();
};

// ================= USERNAME/EMAIL WHITELIST VALIDATOR =================
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

module.exports = {
    requestValidator,
    sanitizeInput,
    validateEmail,
    validatePhone,
    MAX_BODY_SIZE,
};