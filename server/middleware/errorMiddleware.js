const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
// ================= HANDLE CAST ERROR =================

const handleCastErrorDB = (err) => {

    return new AppError(

        `Invalid ${err.path}: ${err.value}`,

        400

    );

};

// ================= HANDLE DUPLICATE KEY =================

const handleDuplicateFieldsDB = (err) => {

    const field = Object.keys(err.keyValue)[0];

    return new AppError(

        `${field} already exists`,

        400

    );

};

// ================= HANDLE VALIDATION ERROR =================

const handleValidationErrorDB = (err) => {

    const errors = Object.values(err.errors).map(

        (el) => el.message

    );

    return new AppError(

        errors.join(", "),

        400

    );

};

// ================= HANDLE JWT INVALID =================

const handleJWTError = () =>

    new AppError(

        "Invalid authentication token. Please login again.",

        401

    );

// ================= HANDLE JWT EXPIRED =================

const handleJWTExpiredError = () =>

    new AppError(

        "Your session has expired. Please login again.",

        401

    );

// ================= GLOBAL ERROR HANDLER =================

const errorMiddleware = (
    err,
    req,
    res,
    next
) => {

    err.statusCode = err.statusCode || 500;

    err.status = err.status || "error";

    // ================= ERROR LOG =================

    logger.error(err.stack || err.message);

    const response = {

        success: false,

        status: err.status,

        message:
            err.message || "Internal Server Error",

    };

    if (
        process.env.NODE_ENV !== "production"
    ) {

        response.stack = err.stack;

    }

    return res
        .status(err.statusCode)
        .json(response);

};

module.exports = errorMiddleware;