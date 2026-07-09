const request = require("supertest");
const app = require("../app");
jest.setTimeout(30000);
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

describe("User API", () => {

    // ================= SEARCH USERS =================

    test("GET /api/users/search should return matching users", async () => {

        await registerUser(
            "Rahul Kumar",
            `rahul${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const loggedUser = await registerUser(
            "Search User",
            `search${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const res = await request(app)
            .get("/api/users/search?q=Rahul")
            .set("Authorization", `Bearer ${loggedUser.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(Array.isArray(res.body.users)).toBe(true);

    });

    // ================= MY QR =================

    test("GET /api/users/my-qr should return QR", async () => {

        const user = await registerUser(
            "QR User",
            `qr${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const res = await request(app)
            .get("/api/users/my-qr")
            .set("Authorization", `Bearer ${user.token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.qr).toHaveProperty("srpayId");

        expect(res.body.qr).toHaveProperty("qrData");

        expect(res.body.qr).toHaveProperty("qrImage");

    });

    // ================= SCAN QR =================

    test("POST /api/users/scan-qr should return user details", async () => {

        const target = await registerUser(
            "Target User",
            `target${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const scanner = await registerUser(
            "Scanner",
            `scanner${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const qr = await request(app)
            .get("/api/users/my-qr")
            .set("Authorization", `Bearer ${target.token}`);

        const res = await request(app)
            .post("/api/users/scan-qr")
            .set("Authorization", `Bearer ${scanner.token}`)
            .send({
                qrData: qr.body.qr.qrData,
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.user.fullName).toBe("Target User");

        expect(res.body.user).toHaveProperty("srpayId");

    });
        // ================= GENERATE DYNAMIC QR =================

    test("POST /api/users/generate-dynamic-qr should generate QR", async () => {

        const user = await registerUser(
            "Dynamic QR User",
            `dynamic${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const res = await request(app)
            .post("/api/users/generate-dynamic-qr")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 500,
                note: "Dinner Payment",
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.qr).toHaveProperty("srpayId");
        expect(res.body.qr).toHaveProperty("amount");
        expect(res.body.qr).toHaveProperty("qrData");
        expect(res.body.qr).toHaveProperty("qrImage");

        expect(res.body.qr.amount).toBe(500);

    });

    // ================= SCAN DYNAMIC QR =================

    test("POST /api/users/scan-dynamic-qr should return payment details", async () => {

        const owner = await registerUser(
            "QR Owner",
            `owner${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const scanner = await registerUser(
            "Scanner User",
            `scanner${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const qr = await request(app)
            .post("/api/users/generate-dynamic-qr")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({
                amount: 1200,
                note: "Rent",
            });

        const res = await request(app)
            .post("/api/users/scan-dynamic-qr")
            .set("Authorization", `Bearer ${scanner.token}`)
            .send({
                qrData: qr.body.qr.qrData,
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.qr.fullName).toBe("QR Owner");
        expect(res.body.qr.amount).toBe(1200);
        expect(res.body.qr.note).toBe("Rent");

    });

    // ================= SEARCH VALIDATION =================

    test("GET /api/users/search should fail for empty query", async () => {

        const user = await registerUser(
            "Validation User",
            `validation${Date.now()}@example.com`,
            `9${Math.floor(100000000 + Math.random() * 900000000)}`
        );

        const res = await request(app)
            .get("/api/users/search?q=")
            .set("Authorization", `Bearer ${user.token}`);

        expect(res.statusCode).toBe(400);

        expect(res.body.success).toBe(false);

    });

    // ================= UNAUTHORIZED =================

    test("GET /api/users/my-qr should fail without token", async () => {

        const res = await request(app)
            .get("/api/users/my-qr");

        expect(res.statusCode).toBe(401);

        expect(res.body.success).toBe(false);

    });

});