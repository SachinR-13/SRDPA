const {
    registerUserService,
    loginUserService,
    getProfileService,
    setTransactionPinService,
    verifyTransactionPinService,
    changeTransactionPinService,
} = require("../services/authService");

// ================= REGISTER USER =================

const registerUser = async (req, res) => {
    try {

        const user = await registerUserService(req.body);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};

// ================= LOGIN USER =================

const loginUser = async (req, res) => {
    try {

        const data = await loginUserService(req.body);

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token: data.token,
            user: data.user,
        });

    } catch (error) {

        res.status(401).json({
            success: false,
            message: error.message,
        });

    }
};

// ================= GET PROFILE =================

const getProfile = async (req, res) => {
    try {

        const user = await getProfileService(req.user.id);

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message,
        });

    }
};

// ================= SET TRANSACTION PIN =================

const setTransactionPin = async (req, res) => {
    try {

        await setTransactionPinService(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Transaction PIN set successfully",
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};
// ================= VERIFY TRANSACTION PIN =================

const verifyTransactionPin = async (req, res) => {

    try {

        const { transactionPin } = req.body;

        await verifyTransactionPinService(
            req.user.id,
            transactionPin
        );

        res.status(200).json({
            success: true,
            message: "Transaction PIN verified successfully",
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= CHANGE TRANSACTION PIN =================

const changeTransactionPin = async (req, res) => {

    try {

        await changeTransactionPinService(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Transaction PIN changed successfully",
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
module.exports = {
    registerUser,
    loginUser,
    getProfile,
    setTransactionPin,
    verifyTransactionPin,
    changeTransactionPin,
};