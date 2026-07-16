const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const connectDB = require("../config/db");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    
    // Create an in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    
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
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop();
    }
});