module.exports = {
    testEnvironment: "node",

    setupFilesAfterEnv: [
        "<rootDir>/tests/setup.js",
    ],

    collectCoverage: true,

    collectCoverageFrom: [
        "controllers/**/*.js",
        "services/**/*.js",
        "routes/**/*.js",
        "middleware/**/*.js",
        "validators/**/*.js",

        "!node_modules/**",
        "!coverage/**",
        "!tests/**",
        "!server.js",
        "!app.js",
        "!config/db.js",
        "!config/swagger.js",
        "!config/razorpay.js",
    ],
};