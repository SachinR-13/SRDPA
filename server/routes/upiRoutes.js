const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const upiController = require("../controllers/upiController");

// All routes require authentication
router.use(authenticateUser);

// GET /api/upi/resolve?upiId=xxx - Resolve UPI ID (public-like, but authenticated)
router.get("/resolve", upiController.resolveUpiId);

// POST /api/upi/create - Create new UPI ID
router.post("/create", upiController.createUpiId);

// GET /api/upi - Get all user's UPI IDs
router.get("/", upiController.getUserUpiIds);

// PUT /api/upi/:upiId/primary - Set primary UPI
router.put("/:upiId/primary", upiController.setPrimaryUpi);

// DELETE /api/upi/:upiId - Delete UPI ID
router.delete("/:upiId", upiController.deleteUpiId);

module.exports = router;