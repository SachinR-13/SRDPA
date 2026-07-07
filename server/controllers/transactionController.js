const {
    getTransactionsService,
    getTransactionDetailsService,
    getMiniStatementService,
    getRecentContactsService,
} = require("../services/transactionService");

// ================= GET TRANSACTION HISTORY =================

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

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= GET TRANSACTION DETAILS =================

const getTransactionDetails = async (
    req,
    res
) => {

    try {

        const transaction =
            await getTransactionDetailsService(
                req.user.id,
                req.params.transactionId
            );

        res.status(200).json({
            success: true,
            transaction,
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= MINI STATEMENT =================

const getMiniStatement = async (
    req,
    res
) => {

    try {

        const transactions =
    await getMiniStatementService(
        req.user.id,
        req.query
    );

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
// ================= RECENT CONTACTS =================

const getRecentContacts = async (req, res) => {

    try {

        const contacts =
            await getRecentContactsService(
                req.user.id
            );

        res.status(200).json({
            success: true,
            count: contacts.length,
            contacts,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
module.exports = {
    getTransactions,
    getTransactionDetails,
    getMiniStatement,
    getRecentContacts,
};