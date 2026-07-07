const { body, query } = require("express-validator");

// ================= SEARCH USERS =================

const searchUsersValidator = [

    query("q")
        .trim()
        .notEmpty()
        .withMessage("Search keyword is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Search keyword must be between 2 and 50 characters"),

];

// ================= SCAN QR =================

const scanQRValidator = [

    body("qrData")
        .trim()
        .notEmpty()
        .withMessage("QR data is required"),

];

// ================= GENERATE DYNAMIC QR =================

const generateDynamicQRValidator = [

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({
            gt: 0,
            max: 100000,
        })
        .withMessage("Amount must be between ₹1 and ₹100000"),

];

// ================= SCAN DYNAMIC QR =================

const scanDynamicQRValidator = [

    body("qrData")
        .trim()
        .notEmpty()
        .withMessage("QR data is required"),

];

module.exports = {

    searchUsersValidator,

    scanQRValidator,

    generateDynamicQRValidator,

    scanDynamicQRValidator,

};