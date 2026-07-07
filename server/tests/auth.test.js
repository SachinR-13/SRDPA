const request = require("supertest");
const app = require("../app");

// ================= HELPER =================

async function getAuthToken() {

    await request(app)
        .post("/api/auth/register")
        .send({
            fullName: "Login User",
            email: "login@example.com",
            phone: "9876543211",
            password: "Password@123"
        });

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email: "login@example.com",
            password: "Password@123"
        });

    return login.body.token;
}

describe("Authentication API", () => {

    // ================= HOME =================

    test("GET / should return welcome message", async () => {

        const res = await request(app).get("/");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("🚀 Welcome to SRPay Backend API");

    });

    // ================= LOGIN =================

    test("POST /api/auth/login should login successfully", async () => {

        await request(app)
            .post("/api/auth/register")
            .send({
                fullName: "Login User",
                email: "login@example.com",
                phone: "9876543211",
                password: "Password@123"
            });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "Password@123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("token");

    });

    // ================= INVALID LOGIN =================

    test("POST /api/auth/login should fail with invalid password", async () => {

        await request(app)
            .post("/api/auth/register")
            .send({
                fullName: "Login User",
                email: "login@example.com",
                phone: "9876543211",
                password: "Password@123"
            });

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "WrongPassword123"
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);

    });

    // ================= PROFILE =================

    test("GET /api/auth/profile should return logged-in user", async () => {

        const token = await getAuthToken();

        const res = await request(app)
            .get("/api/auth/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe("login@example.com");

    });

    // ================= PROFILE WITHOUT TOKEN =================

    test("GET /api/auth/profile should fail without token", async () => {

        const res = await request(app)
            .get("/api/auth/profile");

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);

    });

// ================= SET TRANSACTION PIN =================

test("POST /api/auth/set-transaction-pin", async () => {

    const token = await getAuthToken();

    const res = await request(app)
        .post("/api/auth/set-transaction-pin")
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionPin: "789632",
    confirmTransactionPin: "789632"
        });

    console.log("SET PIN:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

});

// ================= VERIFY TRANSACTION PIN =================

test("POST /api/auth/verify-transaction-pin", async () => {

    const token = await getAuthToken();

    // Set PIN first
    await request(app)
        .post("/api/auth/set-transaction-pin")
        .set("Authorization", `Bearer ${token}`)
        .send({
             transactionPin: "789632",
    confirmTransactionPin: "789632"
        });

    const res = await request(app)
        .post("/api/auth/verify-transaction-pin")
        .set("Authorization", `Bearer ${token}`)
        .send({
            transactionPin: "789632"
        });

    console.log("VERIFY PIN:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

});

// ================= CHANGE TRANSACTION PIN =================

test("POST /api/auth/change-transaction-pin", async () => {

    const token = await getAuthToken();

    // Set PIN first
    await request(app)
        .post("/api/auth/set-transaction-pin")
        .set("Authorization", `Bearer ${token}`)
        .send({
             transactionPin: "789632",
    confirmTransactionPin: "789632"
        });

    const res = await request(app)
        .post("/api/auth/change-transaction-pin")
        .set("Authorization", `Bearer ${token}`)
        .send({
             oldTransactionPin: "789632",
    newTransactionPin: "751932",
    confirmTransactionPin: "751932"
        });

    console.log("CHANGE PIN:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

});

});