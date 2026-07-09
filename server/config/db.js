const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Sync indexes
        await Transaction.syncIndexes();

        console.log("✅ Transaction indexes synced");

        console.log("✅ MongoDB Connected Successfully");

    } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    if (process.env.NODE_ENV !== "test") {
        process.exit(1);
    }

    throw error;
}
};

module.exports = connectDB;