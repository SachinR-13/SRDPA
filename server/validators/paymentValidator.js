const { body } = require("express-validator");

// ================= VERIFY PAYMENT =================

const verifyPaymentValidator = [

    body("razorpay_order_id")
        .trim()
        .notEmpty()
        .withMessage("Razorpay Order ID is required"),

    body("razorpay_payment_id")
        .trim()
        .notEmpty()
        .withMessage("Razorpay Payment ID is required"),

    body("razorpay_signature")
        .trim()
        .notEmpty()
        .withMessage("Razorpay Signature is required"),

];

module.exports = {
    verifyPaymentValidator,
};