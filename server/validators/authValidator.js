const { body } = require("express-validator");

// ================= REGISTER =================

const registerValidator = [

    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Full name must be between 3 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid Indian phone number"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 20 })
        .withMessage("Password must be between 8 and 20 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),

];

// ================= LOGIN =================

const loginValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

];

// ================= CHANGE PASSWORD =================

const changePasswordValidator = [

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8, max: 20 })
        .withMessage("Password must be between 8 and 20 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),

];

// ================= CHANGE PIN =================

const changePinValidator = [

    body("oldPin")
        .notEmpty()
        .withMessage("Old PIN is required")
        .isLength({ min: 4, max: 4 })
        .withMessage("PIN must be exactly 4 digits")
        .isNumeric()
        .withMessage("PIN must contain only numbers"),

    body("newPin")
        .notEmpty()
        .withMessage("New PIN is required")
        .isLength({ min: 4, max: 4 })
        .withMessage("PIN must be exactly 4 digits")
        .isNumeric()
        .withMessage("PIN must contain only numbers"),

];

module.exports = {

    registerValidator,

    loginValidator,

    changePasswordValidator,

    changePinValidator,

};