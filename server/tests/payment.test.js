const request = require("supertest");
const crypto = require("crypto");
const app = require("../app");

// ================= HELPER =================

async function registerUser(name, email, phone) {

    await request(app)
        .post("/api/auth/register")
        .send({
            fullName: name,
            email,
            phone,
            password: "Password@123",
        });

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password: "Password@123",
        });

    return login.body;
}

describe("Payment API", () => {

    // ================= CREATE ORDER =================

    test("POST /api/payment/create-order should create Razorpay order", async () => {

        const user = await registerUser(
            "Payment User",
            `payment${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const res = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 1000,
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.order).toHaveProperty("id");

    });

    // ================= INVALID AMOUNT =================

    test("POST /api/payment/create-order should fail for invalid amount", async () => {

        const user = await registerUser(
            "Payment User",
            `payment${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const res = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: -500,
            });

        expect(res.statusCode).toBe(400);

        expect(res.body.success).toBe(false);

    });

    // ================= VERIFY PAYMENT =================

    test("POST /api/payment/verify-payment", async () => {

        const user = await registerUser(
            "Verify User",
            `verify${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const order = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 500,
            });

        const orderId = order.body.order.id;

        const paymentId = "pay_test_123456";

        const signature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        const res = await request(app)
            .post("/api/payment/verify-payment")
            .set("Authorization", `Bearer ${user.token}`)
            .send({

                razorpay_order_id: orderId,

                razorpay_payment_id: paymentId,

                razorpay_signature: signature,

                amount: 500,

            });

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.message)
            .toBe("Payment verified successfully");

    });
        // ================= INVALID PAYMENT SIGNATURE =================

    test("POST /api/payment/verify-payment should fail for invalid signature", async () => {

        const user = await registerUser(
            "Invalid Signature User",
            `invalid${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const order = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 500,
            });

        const res = await request(app)
            .post("/api/payment/verify-payment")
            .set("Authorization", `Bearer ${user.token}`)
            .send({

                razorpay_order_id: order.body.order.id,

                razorpay_payment_id: "pay_invalid",

                razorpay_signature: "invalid_signature",

                amount: 500,

            });

        expect(res.statusCode).toBe(400);

        expect(res.body.success).toBe(false);

    });

    // ================= PAYMENT HISTORY =================

    test("GET /api/payment/history", async () => {

        const user = await registerUser(
            "History User",
            `history${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 1000,
            });

        const res = await request(app)
            .get("/api/payment/history")
            .set("Authorization", `Bearer ${user.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.payments)).toBe(true);

        expect(res.body).toHaveProperty("pagination");

    });

    // ================= FAILED PAYMENT =================

    test("POST /api/payment/failed", async () => {

        const user = await registerUser(
            "Failed User",
            `failed${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const order = await request(app)
            .post("/api/payment/create-order")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 700,
            });

        const res = await request(app)
            .post("/api/payment/failed")
            .set("Authorization", `Bearer ${user.token}`)
            .send({

                amount: 700,

                reason: "Payment cancelled",

                razorpayOrderId: order.body.order.id,

            });

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.message)
            .toBe("Failed payment recorded");

    });

    // ================= UNAUTHORIZED =================

    test("GET /api/payment/history should fail without token", async () => {

        const res = await request(app)
            .get("/api/payment/history");

        expect(res.statusCode).toBe(401);

        expect(res.body.success).toBe(false);

    });

});