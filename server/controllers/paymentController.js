const {
    createOrderService,
    verifyPaymentService,
     getPaymentHistoryService,
     failedPaymentService,
} = require("../services/paymentService");

// ================= CREATE ORDER =================

const createOrder = async (req, res) => {

    try {

        const { amount } = req.body;

        const order = await createOrderService(
            req.user.id,
            amount
        );

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {

        if (process.env.NODE_ENV !== "test") {
            console.error(error);
        }

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= VERIFY PAYMENT =================

const verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
        } = req.body;

        const result =
            await verifyPaymentService(
                req.user.id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount
            );

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= PAYMENT HISTORY =================

const getPaymentHistory = async (req, res) => {

    try {

        const result =
            await getPaymentHistoryService(
                req.user.id,
                req.query
            );

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= FAILED PAYMENT =================

const failedPayment = async (req, res) => {

    try {

        const {
            amount,
            reason,
            razorpayOrderId,
        } = req.body;

        const result =
            await failedPaymentService(
                req.user.id,
                amount,
                reason,
                razorpayOrderId
            );

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }

};
module.exports = {
    createOrder,
        verifyPayment,
        getPaymentHistory, 
        failedPayment, 
};