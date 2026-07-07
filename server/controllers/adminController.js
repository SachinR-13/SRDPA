const {
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
} = require("../services/adminService");

// ================= ADMIN DASHBOARD =================

const getDashboard = async (
    req,
    res
) => {

    try {

        const dashboard =
            await getDashboardService();

        res.status(200).json({

            success: true,

            dashboard,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= GET ALL USERS =================

const getAllUsers = async (
    req,
    res
) => {

    try {

        const result =
            await getAllUsersService(
                req.query
            );

        res.status(200).json({

            success: true,

            ...result,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= SEARCH USERS =================

const searchUsers = async (req, res) => {

    try {

        const users =
            await searchUsersService(req.query);

        res.status(200).json({

            success: true,

            count: users.length,

            users,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= GET ALL WALLETS =================

const getAllWallets = async (
    req,
    res
) => {

    try {

        const result =
            await getAllWalletsService(
                req.query
            );

        res.status(200).json({

            success: true,

            ...result,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= WALLET STATISTICS =================

const getWalletStatistics = async (
    req,
    res
) => {

    try {

        const statistics =
            await getWalletStatisticsService();

        res.status(200).json({

            success: true,

            statistics,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= BLOCK USER =================

const blockUser = async (
    req,
    res
) => {

    try {

        const user =
            await updateUserBlockStatusService(
                req.params.id,
                true
            );

        res.status(200).json({

            success: true,

            message: "User blocked successfully",

            user,

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= UNBLOCK USER =================

const unblockUser = async (
    req,
    res
) => {

    try {

        const user =
            await updateUserBlockStatusService(
                req.params.id,
                false
            );

        res.status(200).json({

            success: true,

            message: "User unblocked successfully",

            user,

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= TRANSACTION ANALYTICS =================

const getTransactionAnalytics =
    async (req, res) => {

        try {

            const analytics =
                await getTransactionAnalyticsService();

            res.status(200).json({

                success: true,

                analytics,

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message: error.message,

            });

        }

    };
    // ================= PAYMENT METHOD ANALYTICS =================

const getPaymentMethodAnalytics =
    async (req, res) => {

        try {

            const analytics =
                await getPaymentMethodAnalyticsService();

            res.status(200).json({

                success: true,

                analytics,

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message: error.message,

            });

        }

    };
    // ================= DAILY TRANSACTION ANALYTICS =================

const getDailyTransactionAnalytics = async (
    req,
    res
) => {

    try {

        const analytics =
            await getDailyTransactionAnalyticsService();

        res.status(200).json({

            success: true,

            analytics,

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= MONTHLY TRANSACTION ANALYTICS =================

const getMonthlyTransactionAnalytics = async (req, res) => {

    try {

        const analytics =
            await getMonthlyTransactionAnalyticsService();

        return res.status(200).json({

            success: true,

            count: analytics.length,

            analytics,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= TOP WALLET HOLDERS =================

const getTopWalletHolders = async (req, res) => {

    try {

        const wallets =
            await getTopWalletHoldersService();

        return res.status(200).json({

            success: true,

            count: wallets.length,

            wallets,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= MOST ACTIVE USERS =================

const getMostActiveUsers = async (req, res) => {

    try {

        const users =
            await getMostActiveUsersService();

        return res.status(200).json({

            success: true,

            count: users.length,

            users,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= LARGEST TRANSACTIONS =================

const getLargestTransactions = async (req, res) => {

    try {

        const transactions =
            await getLargestTransactionsService();

        return res.status(200).json({

            success: true,

            count: transactions.length,

            transactions,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= PAYMENT METHOD SUMMARY =================

const getPaymentMethodSummary = async (req, res) => {

    try {

        const report =
            await getPaymentMethodSummaryService();

        return res.status(200).json({

            success: true,

            ...report,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
// ================= REVENUE SUMMARY =================

const getRevenueSummary = async (req, res) => {

    try {

        const summary =
            await getRevenueSummaryService();

        return res.status(200).json({

            success: true,

            summary,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};  
// ================= EXECUTIVE DASHBOARD =================

const getExecutiveDashboard = async (req, res) => {

    try {

        const dashboard =
            await getExecutiveDashboardService();

        return res.status(200).json({

            success: true,

            dashboard,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};
module.exports = {
    getDashboard,
    getAllUsers,
    searchUsers,
    getAllWallets,
getWalletStatistics,
 blockUser,
 unblockUser,
 getTransactionAnalytics,
  getPaymentMethodAnalytics,
   getDailyTransactionAnalytics,
 getMonthlyTransactionAnalytics,
 getTopWalletHolders,
 getMostActiveUsers,
getLargestTransactions,
getPaymentMethodSummary,
getRevenueSummary,
getExecutiveDashboard,
};