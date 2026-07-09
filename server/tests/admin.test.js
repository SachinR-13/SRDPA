const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

// ================= HELPERS =================

function uniqueEmail(prefix = "user") {
    return `${prefix}_${Date.now()}_${Math.floor(
        Math.random() * 100000
    )}@example.com`;
}

function uniquePhone() {
    return `9${Math.floor(
        100000000 + Math.random() * 900000000
    )}`;
}

async function registerUser(
    name,
    email = uniqueEmail("user"),
    phone = uniquePhone()
) {

    const register = await request(app)
        .post("/api/auth/register")
        .send({
            fullName: name,
            email,
            phone,
            password: "Password@123",
        });

    if (register.statusCode !== 201) {
    console.log("REGISTER STATUS:", register.statusCode);
    console.log("REGISTER BODY:", JSON.stringify(register.body, null, 2));
    console.log("EMAIL:", email);
    console.log("PHONE:", phone);
}

expect(register.statusCode).toBe(201);
    const login = await request(app)
    .post("/api/auth/login")
    .send({
        email,
        password: "Password@123",
    });

if (login.statusCode !== 200) {
    console.log("LOGIN RESPONSE:", login.body);
    console.log("EMAIL:", email);
}
    expect(login.statusCode).toBe(200);

    return login.body;
}

async function createAdmin() {

    const email = uniqueEmail("admin");
    const phone = uniquePhone();

    const admin = await registerUser(
        "Admin User",
        email,
        phone
    );

    await User.findByIdAndUpdate(
        admin.user.id,
        {
            role: "admin",
        }
    );

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password: "Password@123",
        });

    if (login.statusCode !== 200) {
    console.log("LOGIN STATUS:", login.statusCode);
    console.log("LOGIN BODY:", JSON.stringify(login.body, null, 2));
}

expect(login.statusCode).toBe(200);

    return login.body;
}

describe("Admin API", () => {

    // ================= DASHBOARD =================

    test("GET /api/admin/dashboard", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/dashboard")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("dashboard");

    });

    // ================= GET ALL USERS =================

    test("GET /api/admin/users", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/users")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("users");
        expect(res.body).toHaveProperty("pagination");
        expect(Array.isArray(res.body.users)).toBe(true);

    });

    // ================= SEARCH USERS =================

    test("GET /api/admin/users/search", async () => {

        await registerUser(
            "Rahul Kumar",
            uniqueEmail("rahul"),
            uniquePhone()
        );

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/users/search?q=Rahul")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.users)).toBe(true);

    });
        // ================= GET ALL WALLETS =================

    test("GET /api/admin/wallets", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/wallets")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("wallets");
        expect(res.body).toHaveProperty("pagination");
        expect(Array.isArray(res.body.wallets)).toBe(true);

    });

    // ================= WALLET STATISTICS =================

    test("GET /api/admin/wallets/statistics", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/wallets/statistics")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("statistics");

    });

    // ================= BLOCK USER =================

    test("PATCH /api/admin/users/:id/block", async () => {

        const admin = await createAdmin();

        const user = await registerUser(
            "Normal User",
            uniqueEmail("user"),
            uniquePhone()
        );

        const res = await request(app)
            .patch(`/api/admin/users/${user.user.id}/block`)
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

    console.log("BLOCK RESPONSE:", res.statusCode);
    console.log("BLOCK BODY:", res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message)
            .toBe("User blocked successfully");

    });

    // ================= UNBLOCK USER =================

    test("PATCH /api/admin/users/:id/unblock", async () => {

        const admin = await createAdmin();

        const user = await registerUser(
            "Blocked User",
            uniqueEmail("blocked"),
            uniquePhone()
        );

        await request(app)
            .patch(`/api/admin/users/${user.user.id}/block`)
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

    // console.log("BLOCK RESPONSE:", res.statusCode);
    // console.log("BLOCK BODY:", res.body);
        const res = await request(app)
            .patch(`/api/admin/users/${user.user.id}/unblock`)
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message)
            .toBe("User unblocked successfully");

    });

    // ================= TRANSACTION ANALYTICS =================

    test("GET /api/admin/analytics/transactions", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/analytics/transactions")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("analytics");

    });

    // ================= PAYMENT METHOD ANALYTICS =================

    test("GET /api/admin/analytics/payment-methods", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/analytics/payment-methods")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("analytics");

    });

    // ================= DAILY TRANSACTION ANALYTICS =================

    test("GET /api/admin/analytics/daily-transactions", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/analytics/daily-transactions")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("analytics");

    });

    // ================= MONTHLY TRANSACTION ANALYTICS =================

    test("GET /api/admin/analytics/monthly-transactions", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/analytics/monthly-transactions")
            .set(
                "Authorization",
                `Bearer ${admin.token}`
            );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.analytics)).toBe(true);

    });
        // ================= TOP WALLET HOLDERS =================

    test("GET /api/admin/reports/top-wallets", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/reports/top-wallets")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.wallets)).toBe(true);

    });

    // ================= MOST ACTIVE USERS =================

    test("GET /api/admin/reports/top-users", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/reports/top-users")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.users)).toBe(true);

    });

    // ================= LARGEST TRANSACTIONS =================

    test("GET /api/admin/reports/largest-transactions", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/reports/largest-transactions")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.transactions)).toBe(true);

    });

    // ================= PAYMENT METHOD SUMMARY =================

    test("GET /api/admin/reports/payment-method-summary", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/reports/payment-method-summary")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

    });

    // ================= REVENUE SUMMARY =================

    test("GET /api/admin/reports/revenue", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/reports/revenue")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("summary");

    });

    // ================= EXECUTIVE DASHBOARD =================

    test("GET /api/admin/reports/executive-dashboard", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/reports/executive-dashboard")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("dashboard");

    });

    // ================= NON-ADMIN ACCESS =================

    test("GET /api/admin/dashboard should fail for normal user", async () => {

        const user = await registerUser(
            "Normal User",
            uniqueEmail("normal"),
            uniquePhone()
        );

        const res = await request(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${user.token}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);

    });

    // ================= UNAUTHORIZED =================

    test("GET /api/admin/dashboard should fail without token", async () => {

        const res = await request(app)
            .get("/api/admin/dashboard");

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);

    });

    // ================= SEARCH VALIDATION =================

    test("GET /api/admin/users/search should fail for invalid query", async () => {

        const admin = await createAdmin();

        const res = await request(app)
            .get("/api/admin/users/search?q=")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);

    });

});