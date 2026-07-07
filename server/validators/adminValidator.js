const { param, query } = require("express-validator");

// ================= PAGINATION =================

const paginationValidator = [

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be greater than 0"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

];

// ================= SEARCH USERS =================

const searchUsersValidator = [

    query("q")
        .trim()
        .notEmpty()
        .withMessage("Search keyword is required")
        .isLength({ min: 2, max: 50 })
        .withMessage(
            "Search keyword must be between 2 and 50 characters"
        ),

];

// ================= USER ID =================

const userIdValidator = [

    param("id")
        .isMongoId()
        .withMessage("Invalid User ID"),

];

module.exports = {

    paginationValidator,

    searchUsersValidator,

    userIdValidator,

};