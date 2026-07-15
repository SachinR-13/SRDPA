// ================= ENHANCED SECURITY HEADERS (beyond helmet defaults) =================
const securityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // Enable XSS filter in browsers
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions policy (restrict browser features)
    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()"
    );

    // Strict Transport Security (force HTTPS)
    if (process.env.NODE_ENV === "production") {
        res.setHeader(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload"
        );
    }

    // Content Security Policy (prevent XSS & data injection)
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.razorpay.com; frame-src https://api.razorpay.com"
    );

    // Remove Server header
    res.removeHeader("Server");
    res.removeHeader("X-Powered-By");

    next();
};

module.exports = securityHeaders;