module.exports = {

    testEnvironment: "node",

    verbose: true,

    collectCoverage: true,

    collectCoverageFrom: [

        "controllers/**/*.js",

        "services/**/*.js",

        "middleware/**/*.js",

        "utils/**/*.js",

    ],

    coverageDirectory: "coverage",

    testMatch: [

        "**/tests/**/*.test.js",

    ],
setupFilesAfterEnv: [
    "<rootDir>/tests/setup.js",
],
};