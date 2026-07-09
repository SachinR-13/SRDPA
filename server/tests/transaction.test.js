const request = require("supertest");
const app = require("../app");
//jest.setTimeout(30000);
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

describe("Transaction API", () => {

    // ================= CREATE SAMPLE TRANSACTION =================

    async function createTransaction() {

        const sender = await registerUser(
            "Sender",
            `sender${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const receiver = await registerUser(
            "Receiver",
            `receiver${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        // Add Money
        await request(app)
            .post("/api/wallet/add-money")
            .set("Authorization", `Bearer ${sender.token}`)
            .send({
                amount: 5000,
            });

        // Set Transaction PIN
        await request(app)
            .post("/api/auth/set-transaction-pin")
            .set("Authorization", `Bearer ${sender.token}`)
            .send({
                transactionPin: "789632",
                confirmTransactionPin: "789632",
            });

        // Send Money
        await request(app)
            .post("/api/wallet/send-money")
            .set("Authorization", `Bearer ${sender.token}`)
            .send({
                receiverSRPayId: receiver.user.srpayId,
                amount: 1000,
                transactionPin: "789632",
            });

        return {
            sender,
            receiver,
        };
    }

    // ================= TRANSACTION HISTORY =================

    test("GET /api/transactions should return transaction history", async () => {

        const { sender } = await createTransaction();

        const res = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.transactions)).toBe(true);

        expect(res.body).toHaveProperty("pagination");

    });

    // ================= FILTER BY TYPE =================

    test("GET /api/transactions?type=CREDIT", async () => {

        const { sender } = await createTransaction();

        const res = await request(app)
            .get("/api/transactions?type=CREDIT")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.transactions)).toBe(true);

    });

    // ================= FILTER BY STATUS =================

    test("GET /api/transactions?status=SUCCESS", async () => {

        const { sender } = await createTransaction();

        const res = await request(app)
            .get("/api/transactions?status=SUCCESS")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.transactions)).toBe(true);

    });

    // ================= MINI STATEMENT =================

    test("GET /api/transactions/mini-statement", async () => {

        const { sender } = await createTransaction();

        const res = await request(app)
            .get("/api/transactions/mini-statement")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.transactions)).toBe(true);

    });
        // ================= RECENT CONTACTS =================

    test("GET /api/transactions/recent-contacts", async () => {

        const { sender } = await createTransaction();

        const res = await request(app)
            .get("/api/transactions/recent-contacts")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.contacts)).toBe(true);

    });

    // ================= TRANSACTION DETAILS =================

    test("GET /api/transactions/:transactionId", async () => {

        const { sender } = await createTransaction();

        // Get History
        const history = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(history.body.transactions.length).toBeGreaterThan(0);

        const transactionId =
            history.body.transactions[0]._id ||
            history.body.transactions[0].transactionId;

        const res = await request(app)
            .get(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body).toHaveProperty("transaction");

        expect(res.body.transaction).toHaveProperty("transactionId");

    });

    // ================= INVALID TRANSACTION ID =================

    test("GET /api/transactions/:transactionId should return 404", async () => {

        const { sender } = await createTransaction();

        const res = await request(app)
            .get("/api/transactions/64f111111111111111111111")
            .set("Authorization", `Bearer ${sender.token}`);

        expect(res.statusCode).toBe(404);

        expect(res.body.success).toBe(false);

    });

    // ================= UNAUTHORIZED =================

    test("GET /api/transactions should fail without token", async () => {

        const res = await request(app)
            .get("/api/transactions");

        expect(res.statusCode).toBe(401);

        expect(res.body.success).toBe(false);

    });

});