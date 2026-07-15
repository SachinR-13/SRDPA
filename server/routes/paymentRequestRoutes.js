const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const controller = require("../controllers/paymentRequestController");

router.use(authenticateUser);

router.post("/request", controller.requestMoney);
router.post("/split", controller.splitBill);
router.post("/pay", controller.payRequest);
router.get("/pending", controller.getPendingRequests);
router.get("/history", controller.getRequestHistory);
router.put("/:requestId/decline", controller.declineRequest);
router.put("/:requestId/cancel", controller.cancelRequest);

module.exports = router;