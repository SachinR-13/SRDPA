const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const logger = winston.createLogger({

    level:
    process.env.NODE_ENV === "production"
        ? "info"
        : "debug",

    format: winston.format.combine(

        winston.format.timestamp({

            format: "YYYY-MM-DD HH:mm:ss",

        }),

        winston.format.errors({

            stack: true,

        }),

        winston.format.printf(

            ({ level, message, timestamp, stack }) => {

                return stack
                    ? `${timestamp} [${level.toUpperCase()}] ${stack}`
                    : `${timestamp} [${level.toUpperCase()}] ${message}`;

            }

        )

    ),

    transports: [

    ...(process.env.NODE_ENV !== "production"
        ? [new winston.transports.Console()]
        : []),

        // ================= ERROR LOG ROTATION =================

new DailyRotateFile({

    filename: "logs/error-%DATE%.log",

    datePattern: "YYYY-MM-DD",

    level: "error",

    maxSize: "20m",

    maxFiles: "14d",

}),

// ================= COMBINED LOG ROTATION =================

new DailyRotateFile({

    filename: "logs/combined-%DATE%.log",

    datePattern: "YYYY-MM-DD",

    maxSize: "20m",

    maxFiles: "30d",

}),
    ],

});
logger.stream = {

    write: (message) => {

        logger.info(message.trim());

    },

};
module.exports = logger;