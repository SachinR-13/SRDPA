const sanitize = (obj) => {

    if (!obj || typeof obj !== "object") {
        return;
    }

    for (const key of Object.keys(obj)) {

        if (key.startsWith("$") || key.includes(".")) {

            delete obj[key];

            continue;

        }

        sanitize(obj[key]);

    }

};

const mongoSanitize = (req, res, next) => {

    sanitize(req.body);

    sanitize(req.params);

    sanitize(req.query);

    next();

};

module.exports = mongoSanitize;