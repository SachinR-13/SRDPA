const Razorpay = require("razorpay");

let razorpay;

if (process.env.NODE_ENV === "test") {

    razorpay = {
        orders: {
            create: async (options) => ({
                id: "order_test_12345",
                amount: options.amount,
                currency: options.currency,
                receipt: options.receipt,
            }),
        },
    };

} else {

    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

}

module.exports = razorpay;