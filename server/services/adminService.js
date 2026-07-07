const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
// ================= ADMIN DASHBOARD =================

const getDashboardService = async () => {

    // Total Users
    const totalUsers =
        await User.countDocuments();

    // Total Wallets
    const totalWallets =
        await Wallet.countDocuments();

    // Total Wallet Balance
    const walletBalance =
        await Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: {
                        $sum: "$balance",
                    },
                },
            },
        ]);

    // Total Transactions
    const totalTransactions =
        await Transaction.countDocuments();

    // Successful Transactions
    const successfulTransactions =
        await Transaction.countDocuments({
            status: "SUCCESS",
        });

    // Failed Transactions
    const failedTransactions =
        await Transaction.countDocuments({
            status: "FAILED",
        });

    // Pending Transactions
    const pendingTransactions =
        await Transaction.countDocuments({
            status: "PENDING",
        });

    // Today's Transactions
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayTransactions =
        await Transaction.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        });

    return {

        totalUsers,

        totalWallets,

        totalWalletBalance:
            walletBalance.length
                ? walletBalance[0].totalBalance
                : 0,

        totalTransactions,

        successfulTransactions,

        failedTransactions,

        pendingTransactions,

        todayTransactions,

    };

};
// ================= GET ALL USERS =================

const getAllUsersService = async (query) => {

    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const users = await User.find().lean()
        .select(
            "-password -transactionPin -transactionPinHistory -failedPinAttempts -transactionPinLockedUntil"
        )
        .populate(
            "walletId",
            "balance currency"
        )
        .sort({
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    const totalUsers =
        await User.countDocuments();

    return {

        users,

        pagination: {

            currentPage: page,

            limit,

            totalUsers,

            totalPages: Math.ceil(
                totalUsers / limit
            ),

        },

    };

};
// ================= SEARCH USERS =================

const searchUsersService = async (query) => {

    const keyword = query.q || "";

    const users = await User.find({

        $or: [

            {
                fullName: {
                    $regex: keyword,
                    $options: "i",
                },
            },

            {
                email: {
                    $regex: keyword,
                    $options: "i",
                },
            },

            {
                phone: {
                    $regex: keyword,
                    $options: "i",
                },
            },

            {
                srpayId: {
                    $regex: keyword,
                    $options: "i",
                },
            },

        ],

    })
        .select(
    "-password -transactionPin -transactionPinHistory -failedPinAttempts -transactionPinLockedUntil -__v"
)
        .populate(
            "walletId",
            "balance currency"
        )
        .sort({
            createdAt: -1,
        })
        .lean();
    return users;

};
// ================= GET ALL WALLETS =================

const getAllWalletsService = async (query) => {

    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const wallets = await Wallet.find().lean()
        .populate(
            "userId",
            "fullName email phone srpayId"
        )

        .sort({
            balance: -1,
        })

        .skip(skip)

        .limit(limit);

    const totalWallets =
        await Wallet.countDocuments();

    return {

        wallets,

        pagination: {

            currentPage: page,

            limit,

            totalWallets,

            totalPages: Math.ceil(
                totalWallets / limit
            ),

        },

    };

};
// ================= WALLET STATISTICS =================

const getWalletStatisticsService = async () => {

    const totalWallets =
        await Wallet.countDocuments();

    const activeWallets =
        await Wallet.countDocuments({
            isActive: true,
        });

    const stats =
        await Wallet.aggregate([
            {
                $group: {
                    _id: null,

                    totalBalance: {
                        $sum: "$balance",
                    },

                    averageBalance: {
                        $avg: "$balance",
                    },

                    highestBalance: {
                        $max: "$balance",
                    },

                    lowestBalance: {
                        $min: "$balance",
                    },
                },
            },
        ]);

    return {

        totalWallets,

        activeWallets,

        totalBalance:
            stats.length
                ? stats[0].totalBalance
                : 0,

        averageBalance:
            stats.length
                ? Number(
                    stats[0].averageBalance.toFixed(2)
                )
                : 0,

        highestBalance:
            stats.length
                ? stats[0].highestBalance
                : 0,

        lowestBalance:
            stats.length
                ? stats[0].lowestBalance
                : 0,

    };

};
// ================= BLOCK / UNBLOCK USER =================

const updateUserBlockStatusService = async (
    userId,
    isBlocked
) => {

    const user = await User.findByIdAndUpdate(
        userId,
        {
            isBlocked,
        },
        {
            new: true,
        }
    ).select("-password -transactionPin");

    if (!user) {
        throw new Error("User not found");
    }

    return user;

};
// ================= TRANSACTION ANALYTICS =================

const getTransactionAnalyticsService =
    async () => {

        const totalTransactions =
            await Transaction.countDocuments();

        const successfulTransactions =
            await Transaction.countDocuments({
                status: "SUCCESS",
            });

        const failedTransactions =
            await Transaction.countDocuments({
                status: "FAILED",
            });

        const pendingTransactions =
            await Transaction.countDocuments({
                status: "PENDING",
            });

        const stats =
    await Transaction.aggregate([
        {
            $match: {
                status: "SUCCESS",
            },
        },
        {
            $group: {
                _id: null,

                totalAmountTransferred: {
                    $sum: "$amount",
                },

                averageTransactionAmount: {
                    $avg: "$amount",
                },

                highestTransaction: {
                    $max: "$amount",
                },

                lowestTransaction: {
                    $min: "$amount",
                },
            },
        },
    ]);
        return {

            totalTransactions,

            successfulTransactions,

            failedTransactions,

            pendingTransactions,

            totalAmountTransferred:
                stats.length
                    ? stats[0].totalAmountTransferred
                    : 0,

            averageTransactionAmount:
                stats.length
                    ? Number(
                        stats[0].averageTransactionAmount.toFixed(
                            2
                        )
                    )
                    : 0,

            highestTransaction:
                stats.length
                    ? stats[0].highestTransaction
                    : 0,

            lowestTransaction:
                stats.length
                    ? stats[0].lowestTransaction
                    : 0,

        };

    };
  // ================= PAYMENT METHOD ANALYTICS =================

const getPaymentMethodAnalyticsService = async () => {

    const analytics =
        await Transaction.aggregate([

            {
                $match: {
                    status: "SUCCESS",
                    paymentMethod: {
                        $exists: true,
                        $ne: null,
                    },
                },
            },

            {
                $group: {

                    _id: "$paymentMethod",

                    totalTransactions: {
                        $sum: 1,
                    },

                    totalAmount: {
                        $sum: "$amount",
                    },

                },
            },

            {
                $project: {

                    _id: 0,

                    paymentMethod: "$_id",

                    totalTransactions: 1,

                    totalAmount: 1,

                },
            },

            {
                $sort: {
                    totalTransactions: -1,
                },
            },

        ]);

    return analytics;

};
// ================= DAILY TRANSACTION ANALYTICS =================

const getDailyTransactionAnalyticsService = async () => {

    const analytics = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
            },
        },

        {
            $group: {

                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                    },
                },

                totalTransactions: {
                    $sum: 1,
                },

                totalAmount: {
                    $sum: "$amount",
                },

            },
        },

        {
            $project: {

                _id: 0,

                date: "$_id",

                totalTransactions: 1,

                totalAmount: 1,

            },
        },

        {
            $sort: {
                date: 1,
            },
        },

    ]);

    return analytics;

};
// ================= MONTHLY TRANSACTION ANALYTICS =================

const getMonthlyTransactionAnalyticsService = async () => {

    const analytics = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
            },
        },

        {
            $group: {

                _id: {

                    $dateToString: {
                        format: "%Y-%m",
                        date: "$createdAt",
                    },

                },

                totalTransactions: {
                    $sum: 1,
                },

                totalAmount: {
                    $sum: "$amount",
                },

            },
        },

        {
            $project: {

                _id: 0,

                month: "$_id",

                totalTransactions: 1,

                totalAmount: 1,

            },
        },

        {
            $sort: {
                month: 1,
            },
        },

    ]);

    return analytics;

};
// ================= TOP WALLET HOLDERS =================

const getTopWalletHoldersService = async () => {

    const topWallets = await Wallet.find()

        .populate(
            "userId",
            "fullName email phone srpayId"
        )

        .select(
            "balance currency isActive userId createdAt"
        )

        .sort({
            balance: -1,
        })

        .limit(10)

        .lean();

    return topWallets;

};
// ================= MOST ACTIVE USERS =================

const getMostActiveUsersService = async () => {

    const activeUsers = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
            },
        },

        {
            $group: {

                _id: "$userId",

                totalTransactions: {
                    $sum: 1,
                },

                totalAmount: {
                    $sum: "$amount",
                },

            },
        },

        {
            $sort: {
                totalTransactions: -1,
            },
        },

        {
            $limit: 10,
        },

        {
            $lookup: {

                from: "users",

                localField: "_id",

                foreignField: "_id",

                as: "user",

            },
        },

        {
            $unwind: "$user",
        },

        {
            $project: {

                _id: 0,

                userId: "$user._id",

                fullName: "$user.fullName",

                email: "$user.email",

                phone: "$user.phone",

                srpayId: "$user.srpayId",

                totalTransactions: 1,

                totalAmount: 1,

            },
        },

    ]);

    return activeUsers;

};
// ================= LARGEST TRANSACTIONS =================

// ================= LARGEST TRANSACTIONS =================

const getLargestTransactionsService = async () => {

    const transactions = await Transaction.find({

        status: "SUCCESS",

    })

        .populate(
            "userId",
            "fullName email phone srpayId"
        )

        .select(
            "amount \
status \
paymentMethod \
type \
description \
balanceAfter \
senderName \
senderSRPayId \
receiverName \
receiverSRPayId \
createdAt \
userId"
        )

        .sort({

            amount: -1,

            createdAt: -1,

        })

        .limit(10)

        .lean();

    return transactions;

};
// ================= PAYMENT METHOD SUMMARY =================

const getPaymentMethodSummaryService = async () => {

    const analytics = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
                paymentMethod: {
                    $exists: true,
                    $ne: null,
                },
            },
        },

        {
            $group: {

                _id: "$paymentMethod",

                transactions: {
                    $sum: 1,
                },

                amount: {
                    $sum: "$amount",
                },

            },
        },

        {
            $sort: {
                transactions: -1,
            },
        },

    ]);

    const summary = analytics.reduce(

        (acc, item) => {

            acc.totalTransactions += item.transactions;

            acc.totalAmount += item.amount;

            return acc;

        },

        {
            totalTransactions: 0,
            totalAmount: 0,
        }

    );

    const paymentMethods = analytics.map((item) => ({

        paymentMethod: item._id,

        transactions: item.transactions,

        amount: item.amount,

        percentage:
            summary.totalTransactions === 0
                ? 0
                : Number(
                      (
                          (item.transactions /
                              summary.totalTransactions) *
                          100
                      ).toFixed(2)
                  ),

    }));

    return {

        summary,

        paymentMethods,

    };

};
// ================= REVENUE SUMMARY =================

const getRevenueSummaryService = async () => {

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const startMonth = new Date(
        startToday.getFullYear(),
        startToday.getMonth(),
        1
    );

    const overall = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
            },
        },

        {
            $group: {

                _id: null,

                totalRevenue: {
                    $sum: "$amount",
                },

                averageTransaction: {
                    $avg: "$amount",
                },

                highestTransaction: {
                    $max: "$amount",
                },

                lowestTransaction: {
                    $min: "$amount",
                },

            },
        },

    ]);

    const today = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
                createdAt: {
                    $gte: startToday,
                },
            },
        },

        {
            $group: {

                _id: null,

                todayRevenue: {
                    $sum: "$amount",
                },

            },
        },

    ]);

    const month = await Transaction.aggregate([

        {
            $match: {
                status: "SUCCESS",
                createdAt: {
                    $gte: startMonth,
                },
            },
        },

        {
            $group: {

                _id: null,

                monthlyRevenue: {
                    $sum: "$amount",
                },

            },
        },

    ]);

    return {

        totalTransactions:
            overall.length ? overall[0].totalRevenue : 0,

        todayTransactions:
            today.length ? today[0].todayRevenue : 0,

        monthlyTransactions:
            month.length ? month[0].monthlyRevenue : 0,

        averageTransaction:
            overall.length
                ? Number(overall[0].averageTransaction.toFixed(2))
                : 0,

        highestTransaction:
            overall.length ? overall[0].highestTransaction : 0,

        lowestTransaction:
            overall.length ? overall[0].lowestTransaction : 0,

    };

};
// ================= EXECUTIVE DASHBOARD =================

const getExecutiveDashboardService = async () => {

    const [

        totalUsers,

        blockedUsers,

        totalWallets,

        walletStats,

        transactionStats,

        revenue,

    ] = await Promise.all([

        User.countDocuments(),

        User.countDocuments({
            isBlocked: true,
        }),

        Wallet.countDocuments(),

        Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    balance: {
                        $sum: "$balance",
                    },
                },
            },
        ]),

        Transaction.aggregate([
            {
                $group: {

                    _id: null,

                    total: {
                        $sum: 1,
                    },

                    success: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "SUCCESS",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    failed: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "FAILED",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    today: {
                        $sum: {
                            $cond: [
                                {
                                    $gte: [
                                        "$createdAt",
                                        new Date(
                                            new Date().setHours(
                                                0,
                                                0,
                                                0,
                                                0
                                            )
                                        ),
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                },
            },
        ]),

        getRevenueSummaryService(),

    ]);

    return {

        users: {

            total: totalUsers,

            blocked: blockedUsers,

        },

        wallets: {

            total: totalWallets,

            balance:
                walletStats.length
                    ? walletStats[0].balance
                    : 0,

        },

        transactions: transactionStats.length
    ? {
          total: transactionStats[0].total,
          success: transactionStats[0].success,
          failed: transactionStats[0].failed,
          today: transactionStats[0].today,
      }
    : {
          total: 0,
          success: 0,
          failed: 0,
          today: 0,
      },

        revenue,

    };

};
module.exports = {
    getDashboardService,
    getAllUsersService,
    searchUsersService,
    getAllWalletsService,
     getWalletStatisticsService,
updateUserBlockStatusService,
 getTransactionAnalyticsService,
 getPaymentMethodAnalyticsService,
  getDailyTransactionAnalyticsService,
  getMonthlyTransactionAnalyticsService,
  getTopWalletHoldersService,
  getMostActiveUsersService,
  getLargestTransactionsService,
  getPaymentMethodSummaryService,
  getRevenueSummaryService,
  getExecutiveDashboardService,
};