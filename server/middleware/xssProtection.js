const sanitize = (obj) => {

    if (!obj || typeof obj !== "object") {
        return;
    }

    for (const key of Object.keys(obj)) {

        const value = obj[key];

        if (typeof value === "string") {

            obj[key] = value
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");

        } else if (typeof value === "object") {

            sanitize(value);

        }

    }

};

const xssProtection = (req, res, next) => {

    sanitize(req.body);

    sanitize(req.query);

    sanitize(req.params);

    next();

};

module.exports = xssProtection;