const { searchUsersService, 
    generateMyQRService,
     scanQRService,
     generateDynamicQRService,
     scanDynamicQRService,
 } = require("../services/userService");

// ================= SEARCH USERS =================

const searchUsers = async (req, res) => {
    try {

        const { q } = req.query;

        const users = await searchUsersService(q, req.user.id);

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};
// ================= MY QR =================

const getMyQR = async (req, res) => {

    try {

        const qr = await generateMyQRService(
            req.user.id
        );

        res.status(200).json({
            success: true,
            qr,
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= SCAN QR =================

const scanQR = async (req, res) => {

    try {

        const user = await scanQRService(
            req.body.qrData
        );

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= GENERATE DYNAMIC QR =================

const generateDynamicQR = async (req, res) => {

    try {

        const { amount, note } = req.body;

        const qr = await generateDynamicQRService(
            req.user.id,
            amount,
            note
        );

        res.status(200).json({
            success: true,
            qr,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= SCAN DYNAMIC QR =================

const scanDynamicQR = async (req, res) => {

    try {

        const qr = await scanDynamicQRService(
            req.body.qrData
        );

        res.status(200).json({
            success: true,
            qr,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
module.exports = {
    searchUsers,
      getMyQR,
      scanQR,
      generateDynamicQR,
       scanDynamicQR,
};