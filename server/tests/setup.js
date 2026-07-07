const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/db");

dotenv.config();

beforeAll(async () => {

    process.env.NODE_ENV = "test";

    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }

});

afterEach(async () => {

    const collections = mongoose.connection.collections;

    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }

});

afterAll(async () => {

    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }

});