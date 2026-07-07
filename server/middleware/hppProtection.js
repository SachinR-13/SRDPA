const hppProtection = (req, res, next) => {

    for (const key in req.query) {

        if (Array.isArray(req.query[key])) {

            req.query[key] = req.query[key][0];

        }

    }

    next();

};

module.exports = hppProtection;