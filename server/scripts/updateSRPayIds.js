require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateSRPayId = require("../utils/generateSRPayId");

const updateUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ MongoDB Connected");

        // Find users without SRPay ID
        const users = await User.find({
            $or: [
                { srpayId: { $exists: false } },
                { srpayId: null },
                { srpayId: "" }
            ]
        });

        console.log(`Found ${users.length} users to update`);

        for (const user of users) {

            let srpayId;

            while (true) {
                srpayId = generateSRPayId();

                const exists = await User.findOne({ srpayId });

                if (!exists) break;
            }

            user.srpayId = srpayId;

            await user.save();

            console.log(`✅ ${user.fullName} -> ${srpayId}`);
        }

        console.log("🎉 All users updated successfully");

        process.exit();

    } catch (error) {

        console.error(error);

        process.exit(1);

    }
};

updateUsers();