const {
    getWalletService,
    addMoneyService,
    sendMoneyService,
} = require("../services/walletService");
const {
    getTransactionsService,
} = require("../services/transactionService");
// ================= GET WALLET =================

const getWallet = async (req, res) => {
    try {

        const wallet = await getWalletService(req.user.id);

        res.status(200).json({
            success: true,
            wallet,
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message,
        });

    }
};
// ================= ADD MONEY =================

const addMoney = async (req, res) => {
    try {

        const { amount } = req.body;

        const wallet = await addMoneyService(req.user.id, amount);

        res.status(200).json({
            success: true,
            message: "Money Added Successfully",
            wallet,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};
// ================= SEND MONEY =================

const sendMoney = async (req, res) => {
    try {

       const {
    receiverSRPayId,
    amount,
    transactionPin,
} = req.body;

const result = await sendMoneyService(
    req.user.id,
    receiverSRPayId,
    amount,
    transactionPin
);
        res.status(200).json({
            success: true,
            message: "Money Sent Successfully",
            transaction: result,
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};
// // ================= GET TRANSACTION HISTORY =================

const getTransactions = async (req, res) => {

    try {

        const result = await getTransactionsService(
            req.user.id,
            req.query
        );

        res.status(200).json({
            success: true,
            count: result.transactions.length,
            pagination: result.pagination,
            transactions: result.transactions,
        });

    } catch (error) {

    console.log(error);

    res.status(400).json({
        success: false,
        message: error.message,
    });

}

};
module.exports = {
    getWallet,
    addMoney,
    sendMoney,
    getTransactions,
};