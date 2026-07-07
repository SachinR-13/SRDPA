const swaggerJsdoc = require("swagger-jsdoc");

const options = {

    definition: {

        openapi: "3.0.0",

        info: {

            title: "SRPay Digital Payment API",

            version: "1.0.0",

            description:
                "Production-ready REST API for SRPay Digital Payment Application.",

            contact: {

                name: "Sachin Kethavath",

                email: "sachin@example.com",

            },

            license: {

                name: "MIT",

            },

        },

        servers: [

    {

        url: process.env.API_URL || "http://localhost:5000",

        description:
            process.env.NODE_ENV === "production"
                ? "Production Server"
                : "Development Server",

    },

],

        tags: [

            {
                name: "Authentication",
                description: "Authentication APIs",
            },

            {
                name: "Wallet",
                description: "Wallet Management APIs",
            },

            {
                name: "Transactions",
                description: "Transaction APIs",
            },

            {
                name: "Users",
                description: "User APIs",
            },

            {
                name: "Payments",
                description: "Payment APIs",
            },

            {
                name: "Notifications",
                description: "Notification APIs",
            },

            {
                name: "Admin",
                description: "Administrator APIs",
            },

        ],

        components: {

            securitySchemes: {

                bearerAuth: {

                    type: "http",

                    scheme: "bearer",

                    bearerFormat: "JWT",

                },

            },

        },

        security: [

            {

                bearerAuth: [],

            },

        ],

    },

    apis: [

        "./routes/*.js",

    ],

};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;