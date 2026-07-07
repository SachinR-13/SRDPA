const Transaction = require("../models/Transaction");
// const User = require("../models/User");
const getTransactionsService = async (
    userId,
    query= {}
) => {

    const filter = {
        userId,
    };

    // Filter by Type
    if (query.type?.trim()) {
    filter.type = query.type.trim().toUpperCase();
}
// Filter by Status
if (query.status?.trim()) {
    filter.status = query.status.trim().toUpperCase();
}
// Filter - Today
if (query.today === "true") {

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    filter.createdAt = {
        $gte: start,
        $lte: end,
    };
}
// Filter - Yesterday
if (query.yesterday === "true") {

    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    filter.createdAt = {
        $gte: start,
        $lte: end,
    };
}
// Filter - Month
if (query.month && query.year) {

    const start = new Date(
        Number(query.year),
        Number(query.month) - 1,
        1
    );

    const end = new Date(
        Number(query.year),
        Number(query.month),
        0,
        23,
        59,
        59,
        999
    );

    filter.createdAt = {
        $gte: start,
        $lte: end,
    };
}
// Filter - Year
if (query.year && !query.month) {

    const start = new Date(
        Number(query.year),
        0,
        1
    );

    const end = new Date(
        Number(query.year),
        11,
        31,
        23,
        59,
        59,
        999
    );

    filter.createdAt = {
        $gte: start,
        $lte: end,
    };
}
// Filter - Custom Date Range
if (query.from && query.to) {

    const start = new Date(query.from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(query.to);
    end.setHours(23, 59, 59, 999);

    filter.createdAt = {
        $gte: start,
        $lte: end,
    };
}
// Filter - Amount Range
if (query.minAmount || query.maxAmount) {

    filter.amount = {};

    if (query.minAmount) {
        filter.amount.$gte = Number(query.minAmount);
    }

    if (query.maxAmount) {
        filter.amount.$lte = Number(query.maxAmount);
    }

}
// Search by Description
if (query.search?.trim()) {

    filter.description = {
        $regex: query.search.trim(),
        $options: "i",
    };

}
   // Pagination
const page = Number(query.page) || 1;
const limit = Number(query.limit) || 10;

const skip = (page - 1) * limit;

// Sorting
const sortOrder =
    query.sort === "asc" ? 1 : -1;

const transactions = await Transaction.find(filter)
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(limit);

const totalTransactions =
    await Transaction.countDocuments(filter);

return {
    transactions,
    pagination: {
        currentPage: page,
        limit,
        totalTransactions,
        totalPages: Math.ceil(
            totalTransactions / limit
        ),
    },
};
};

// ================= GET TRANSACTION DETAILS =================

const getTransactionDetailsService = async (
    userId,
    transactionId
) => {

    const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
    })

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    return {

        transactionId: transaction._id,

        type: transaction.type,

        amount: transaction.amount,

        description: transaction.description,

        status: transaction.status,

        balanceAfter: transaction.balanceAfter,

        sender: {
    fullName: transaction.senderName,
    srpayId: transaction.senderSRPayId,
},

receiver: {
    fullName: transaction.receiverName,
    srpayId: transaction.receiverSRPayId,
},

        createdAt: transaction.createdAt,

        updatedAt: transaction.updatedAt,
    };

};
// ================= MINI STATEMENT =================

const getMiniStatementService = async (
    userId,
    query
) => {
// Default = 5, Maximum = 20
const limit = Math.min(
    Number(query.limit) || 5,
    20
);
    const transactions = await Transaction.find({
    userId,
})
.sort({ createdAt: -1 })
.limit(limit);

return transactions.map((transaction) => ({
    transactionId: transaction._id,

    type: transaction.type,

    amount: transaction.amount,

    description: transaction.description,

    senderName: transaction.senderName,

    senderSRPayId: transaction.senderSRPayId,

    receiverName: transaction.receiverName,

    receiverSRPayId: transaction.receiverSRPayId,

    status: transaction.status,

    balanceAfter: transaction.balanceAfter,

    createdAt: transaction.createdAt,
}));

};
// ================= RECENT CONTACTS =================

const getRecentContactsService = async (userId) => {

    const recentContacts = await Transaction.aggregate([

        // Only Debit Transactions
        {
            $match: {
                userId,
                type: "DEBIT",
                receiverSRPayId: { $ne: null }
            }
        },

        // Latest First
        {
            $sort: {
                createdAt: -1
            }
        },

        // Remove Duplicate Contacts
        {
            $group: {
                _id: "$receiverSRPayId",

                receiverName: {
                    $first: "$receiverName"
                },

                receiverSRPayId: {
                    $first: "$receiverSRPayId"
                },

                lastTransaction: {
                    $first: "$createdAt"
                }
            }
        },

        // Sort Again
        {
            $sort: {
                lastTransaction: -1
            }
        },

        // Maximum 10 Contacts
        {
            $limit: 10
        }

    ]);

    return recentContacts.map((contact) => ({

    fullName: contact.receiverName,

    srpayId: contact.receiverSRPayId,

    lastTransaction: contact.lastTransaction,

}));

};
module.exports = {
    getTransactionsService,
    getTransactionDetailsService,
    getMiniStatementService,
    getRecentContactsService,
};