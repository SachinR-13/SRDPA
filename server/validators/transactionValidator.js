const { param, query } = require("express-validator");

// ================= TRANSACTION HISTORY =================

const transactionHistoryValidator = [

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be greater than 0"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

];

// ================= TRANSACTION DETAILS =================

const transactionDetailsValidator = [

    param("transactionId")
        .isMongoId()
        .withMessage("Invalid Transaction ID"),

];

// ================= MINI STATEMENT =================

const miniStatementValidator = [];

// ================= RECENT CONTACTS =================

const recentContactsValidator = [];

module.exports = {

    transactionHistoryValidator,

    transactionDetailsValidator,

    miniStatementValidator,

    recentContactsValidator,

};