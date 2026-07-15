const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const bankController = require("../controllers/bankController");

// All routes require authentication
router.use(authenticateUser);

// POST /api/bank/add - Add bank account
router.post("/add", bankController.addBankAccount);

// GET /api/bank - Get all bank accounts
router.get("/", bankController.getBankAccounts);

// PUT /api/bank/:accountId/primary - Set primary bank
router.put("/:accountId/primary", bankController.setPrimaryBank);

// POST /api/bank/:accountId/verify - Verify bank account
router.post("/:accountId/verify", bankController.verifyBankAccount);

// POST /api/bank/withdraw - Withdraw to bank
router.post("/withdraw", bankController.withdrawToBank);

// DELETE /api/bank/:accountId - Delete bank account
router.delete("/:accountId", bankController.deleteBankAccount);

module.exports = router;