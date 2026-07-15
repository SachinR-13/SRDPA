const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const controller = require("../controllers/paymentLinkController");

// Public route (no auth needed to view payment link details)
router.get("/:code", controller.getPaymentLinkDetails);

// Protected routes
router.post("/create", authenticateUser, controller.createPaymentLink);
router.post("/pay", authenticateUser, controller.payViaLink);
router.get("/", authenticateUser, controller.getMyPaymentLinks);
router.delete("/:linkId", authenticateUser, controller.cancelPaymentLink);

module.exports = router;