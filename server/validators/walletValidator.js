const { body } = require("express-validator");

// ================= ADD MONEY =================

const addMoneyValidator = [

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({
            gt: 0,
            max: 100000,
        })
        .withMessage(
            "Amount must be between ₹1 and ₹100000"
        ),

];

const sendMoneyValidator = [

    body("receiverSRPayId")
        .trim()
        .notEmpty()
        .withMessage("Receiver SRPay ID is required")
        .matches(/^SRP\d{6}$/)
        .withMessage("Invalid SRPay ID"),

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({
            gt: 0,
            max: 100000,
        })
        .withMessage(
            "Amount must be between ₹1 and ₹100000"
        ),

    body("transactionPin")
        .trim()
        .notEmpty()
        .withMessage("Transaction PIN is required")
        .isLength({
            min: 6,
            max: 6,
        })
        .withMessage("Transaction PIN must be exactly 6 digits")
        .isNumeric()
        .withMessage("Transaction PIN must contain only numbers"),

];
// ================= WITHDRAW MONEY =================

const withdrawMoneyValidator = [

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({
            gt: 0,
            max: 100000,
        })
        .withMessage(
            "Amount must be between ₹1 and ₹100000"
        ),

];

// ================= BALANCE ENQUIRY =================

const balanceValidator = [];

module.exports = {

    addMoneyValidator,

    withdrawMoneyValidator,

    balanceValidator,
sendMoneyValidator,
};