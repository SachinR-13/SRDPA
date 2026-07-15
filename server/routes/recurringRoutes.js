const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const controller = require("../controllers/recurringController");

router.use(authenticateUser);

router.post("/create", controller.createRecurringPayment);
router.get("/", controller.getMyRecurringPayments);
router.put("/:paymentId/toggle", controller.toggleRecurringPayment);
router.put("/:paymentId/cancel", controller.cancelRecurringPayment);

// Admin: Manually trigger due payments processing
router.post("/process-due", adminMiddleware, controller.processDuePayments);

module.exports = router;