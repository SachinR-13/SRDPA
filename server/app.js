const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoSanitize = require("./middleware/mongoSanitize");
const helmet = require("helmet");
const xssProtection = require("./middleware/xssProtection");
const hppProtection = require("./middleware/hppProtection");
const compression = require("compression");
const morgan = require("morgan");
const logger = require("./utils/logger");
const performanceMonitor = require("./middleware/performanceMonitor");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// ================= ENTERPRISE SECURITY IMPORTS =================
const securityHeaders = require("./middleware/securityHeaders");
const { requestValidator } = require("./middleware/requestValidator");
const { authLimiter, apiLimiter, pinLimiter, transactionLimiter } = require("./middleware/rateLimiter");

// ================= ROUTES =================
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const otpRoutes = require("./routes/otpRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const upiRoutes = require("./routes/upiRoutes");
const contactRoutes = require("./routes/contactRoutes");
const bankRoutes = require("./routes/bankRoutes");
const paymentRequestRoutes = require("./routes/paymentRequestRoutes");
const paymentLinkRoutes = require("./routes/paymentLinkRoutes");
const recurringRoutes = require("./routes/recurringRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/AppError");

const app = express();

// =====================================================================
//  SECURITY LAYER 1: CORS (MUST be first — preflight OPTIONS requests
//  need CORS headers BEFORE any other middleware can block them)
// =====================================================================
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, mobile apps, curl)
        if (!origin) return callback(null, true);

        // Exact match whitelist
        const allowedOrigins = [
            process.env.CLIENT_URL,
            "https://srpay.vercel.app",
            "https://srpay-client.vercel.app",
            "https://srdpa.vercel.app",
            "https://srdpa-client.vercel.app",
            "http://localhost:5173",
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);

        // Allow any *.vercel.app subdomain (for Vercel preview deployments)
        if (origin.endsWith('.vercel.app') || origin === 'https://vercel.app') {
            return callback(null, true);
        }

        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
}));

// =====================================================================
//  SECURITY LAYER 2: HARDENING & HEADERS (Applied First - No Exceptions)
// =====================================================================
app.disable("x-powered-by");
app.disable("etag");
app.set("trust proxy", 1);
app.use(helmet());
app.use(securityHeaders);

// =====================================================================
//  SECURITY LAYER 3: RATE LIMITING (Applied Early - Blocks Flood Attacks)
// =====================================================================
app.use("/api/", apiLimiter); // Global API rate limit
app.use("/api/auth/", authLimiter); // Strict auth rate limit
app.use("/api/otp/", authLimiter); // Strict OTP rate limit

// =====================================================================
//  SECURITY LAYER 4: REQUEST VALIDATION (Sanitize & Block Malformed Requests)
// =====================================================================
app.use(requestValidator);

// =====================================================================
//  SECURITY LAYER 5: GENERAL HTTP MIDDLEWARE
// =====================================================================
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev", { stream: logger.stream }));
} else {
    app.use(morgan("combined", { stream: logger.stream }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize);
app.use(xssProtection);
app.use(hppProtection);
app.use(compression());
app.use(performanceMonitor);

// =====================================================================
//  SWAGGER API DOCUMENTATION
// =====================================================================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =====================================================================
//  API ROUTES
// =====================================================================
app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Welcome to SRPay Backend API",
    });
});

app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upi", upiRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/requests", paymentRequestRoutes);
app.use("/api/pay-links", paymentLinkRoutes);
app.use("/api/recurring", recurringRoutes);

// =====================================================================
//  HEALTH CHECK (for Render)
// =====================================================================
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SRPay Backend is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// =====================================================================
//  FRONTEND STATIC SERVING (Fallback - Vercel handles production)
// =====================================================================
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// =====================================================================
//  404 HANDLER (API routes only)
// =====================================================================
app.use((req, res, next) => {
    if (req.path.startsWith("/api/") || req.path === "/api") {
        return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    }
    next();
});

// =====================================================================
//  SPA FALLBACK
// =====================================================================
app.use((req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
        if (err) {
            res.status(200).json({
                success: true,
                message: "🚀 SRPay API is running. Frontend is served via Vercel.",
            });
        }
    });
});

// =====================================================================
//  GLOBAL ERROR HANDLER (Final Security Layer)
// =====================================================================
app.use(errorMiddleware);

module.exports = app;