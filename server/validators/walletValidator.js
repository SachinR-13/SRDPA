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

    body("pin")
        .trim()
        .notEmpty()
        .withMessage("Transaction PIN is required")
        .isLength({
            min: 4,
            max: 4,
        })
        .withMessage("PIN must be exactly 4 digits")
        .isNumeric()
        .withMessage("PIN must contain only numbers"),

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