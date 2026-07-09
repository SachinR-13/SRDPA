const request = require("supertest");
const app = require("../app");
//jest.setTimeout(30000);
// ================= HELPER =================

async function getAuthToken() {

    const email = `wallet${Date.now()}@example.com`;

    const register = await request(app)
        .post("/api/auth/register")
        .send({
            fullName: "Wallet User",
            email,
            phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
            password: "Password@123"
        });

    console.log("REGISTER:", register.body);

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password: "Password@123"
        });

    return login.body.token;
}
// ================= REGISTER USER =================

async function registerUser(name, email, phone) {

    await request(app)
        .post("/api/auth/register")
        .send({
            fullName: name,
            email,
            phone,
            password: "Password@123"
        });

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password: "Password@123"
        });

    return login.body;
}
describe("Wallet API", () => {
// ================= GET WALLET =================

test("GET /api/wallet should return wallet details", async () => {

    const token = await getAuthToken();

    const res = await request(app)
    .get("/api/wallet")
    .set("Authorization", `Bearer ${token}`);

console.log(res.body);
    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body).toHaveProperty("wallet");

    expect(res.body.wallet).toHaveProperty("balance");

});
// ================= ADD MONEY =================

test("POST /api/wallet/add-money should add money successfully", async () => {

    const token = await getAuthToken();

    const res = await request(app)
        .post("/api/wallet/add-money")
        .set("Authorization", `Bearer ${token}`)
        .send({
            amount: 1000
        });

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.message).toBe("Money Added Successfully");

    expect(res.body.wallet).toHaveProperty("balance");

    expect(res.body.wallet.balance).toBe(1000);

});
// ================= ADD MONEY (INVALID AMOUNT) =================

test("POST /api/wallet/add-money should fail for invalid amount", async () => {

    const token = await getAuthToken();

    const res = await request(app)
        .post("/api/wallet/add-money")
        .set("Authorization", `Bearer ${token}`)
        .send({
            amount: -100
        });

    expect(res.statusCode).toBe(400);

    expect(res.body.success).toBe(false);

});
// ================= SEND MONEY =================

test("POST /api/wallet/send-money should transfer money successfully", async () => {

    // Sender
    const sender = await registerUser(
        "Sender",
        `sender${Date.now()}@example.com`,
        `9${Math.floor(100000000 + Math.random() * 900000000)}`
    );

    // Receiver
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
            amount: 5000
        });

    // Set Transaction PIN
    await request(app)
        .post("/api/auth/set-transaction-pin")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            transactionPin: "789632",
            confirmTransactionPin: "789632"
        });

    // Send Money
    const res = await request(app)
        .post("/api/wallet/send-money")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            receiverSRPayId: receiver.user.srpayId,
            amount: 1000,
            transactionPin: "789632"
        });
console.log("SEND MONEY:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Money Sent Successfully");

});
// ================= SEND MONEY (INSUFFICIENT BALANCE) =================

test("POST /api/wallet/send-money should fail for insufficient balance", async () => {

    // Sender
    const sender = await registerUser(
        "Sender",
        `sender${Date.now()}@example.com`,
        `9${Math.floor(100000000 + Math.random() * 900000000)}`
    );

    // Receiver
    const receiver = await registerUser(
        "Receiver",
        `receiver${Date.now()}@example.com`,
        `9${Math.floor(100000000 + Math.random() * 900000000)}`
    );

    // Set Transaction PIN
    await request(app)
        .post("/api/auth/set-transaction-pin")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            transactionPin: "789632",
            confirmTransactionPin: "789632"
        });

    // Try sending money without adding balance
    const res = await request(app)
        .post("/api/wallet/send-money")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            receiverSRPayId: receiver.user.srpayId,
            amount: 500,
            transactionPin: "789632"
        });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);

});
// ================= SEND MONEY (INVALID RECEIVER) =================

test("POST /api/wallet/send-money should fail for invalid receiver", async () => {

    const sender = await registerUser(
        "Sender",
        `sender${Date.now()}@example.com`,
        `9${Math.floor(100000000 + Math.random() * 900000000)}`
    );

    // Add Money
    await request(app)
        .post("/api/wallet/add-money")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            amount: 5000
        });

    // Set Transaction PIN
    await request(app)
        .post("/api/auth/set-transaction-pin")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            transactionPin: "789632",
            confirmTransactionPin: "789632"
        });

    // Send to invalid SRPay ID
    const res = await request(app)
        .post("/api/wallet/send-money")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({
            receiverSRPayId: "SRP999999",
            amount: 1000,
            transactionPin: "789632"
        });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);

});
// ================= GET TRANSACTION HISTORY =================

test("GET /api/wallet/transactions should return transaction history", async () => {

    const user = await registerUser(
        "History User",
        `history${Date.now()}@example.com`,
        `9${Math.floor(100000000 + Math.random() * 900000000)}`
    );

    // Add money so at least one transaction exists
    await request(app)
        .post("/api/wallet/add-money")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
            amount: 1000
        });

    const res = await request(app)
        .get("/api/wallet/transactions")
        .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body).toHaveProperty("transactions");

    expect(Array.isArray(res.body.transactions)).toBe(true);

});
// ================= UNAUTHORIZED WALLET =================

test("GET /api/wallet should fail without token", async () => {

    const res = await request(app)
        .get("/api/wallet");

    expect(res.statusCode).toBe(401);

    expect(res.body.success).toBe(false);

});
});