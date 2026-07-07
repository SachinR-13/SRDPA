const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = async (req, res, next) => {

    try {

        const token =
            req.header("Authorization")
                ?.replace("Bearer ", "");

        if (!token) {
            throw new Error("Authentication required");
        }
const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);

// Fetch latest user
const user = await User.findById(decoded.id);

if (!user) {
    throw new Error("User not found");
}

// Check blocked
if (user.isBlocked) {

    return res.status(401).json({

        success: false,

        message:
            "Your account has been blocked. Please contact support.",

    });

}

req.user = {

    id: user._id,

    role: user.role,

};

next();
    } catch (error) {

        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });

    }

};

module.exports = authMiddleware;