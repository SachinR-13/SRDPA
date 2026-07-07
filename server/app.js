const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoSanitize =
require("./middleware/mongoSanitize");
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const app = express();
// ================= EXPRESS SECURITY =================

app.disable("x-powered-by");
// ================= TRUST PROXY =================

app.set("trust proxy", 1);
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorMiddleware =
require("./middleware/errorMiddleware");
const AppError =require("./utils/AppError");
const helmet = require("helmet");
const xssProtection =
require("./middleware/xssProtection");
const hppProtection =
require("./middleware/hppProtection");
const compression = require("compression");
const morgan = require("morgan");
const logger = require("./utils/logger");
const performanceMonitor =
require("./middleware/performanceMonitor");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec =
require("./config/swagger");
/* ---------------- Middleware ---------------- */

app.use(
    cors({

        origin: process.env.CLIENT_URL,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],

        credentials: true,

    })
);
app.use(helmet());
if (process.env.NODE_ENV === "development") {

    app.use(
        morgan("dev", {
            stream: logger.stream,
        })
    );

} else {

    app.use(
        morgan("combined", {
            stream: logger.stream,
        })
    );

}
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);
app.use(xssProtection);
app.use(hppProtection);
app.use(compression());
app.use(performanceMonitor);
// ================= SWAGGER =================

if (process.env.NODE_ENV !== "production") {

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );

}
/* ---------------- Routes ---------------- */
/* ---------------- Routes ---------------- */

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "🚀 Welcome to SRPay Backend API",

    });

});

app.use("/api/auth", authRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/users", userRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);

/* ---------------- 404 Handler ---------------- */

/* ---------------- 404 Handler ---------------- */

app.all("/{*path}", (req, res, next) => {

    next(
        new AppError(
            `Can't find ${req.originalUrl} on this server`,
            404
        )
    );

});
/* ---------------- Global Error Handler ---------------- */

app.use(errorMiddleware);

module.exports = app;
