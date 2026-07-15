const asyncHandler = require("../middleware/asyncHandler");
const paymentRequestService = require("../services/paymentRequestService");
const AppError = require("../utils/AppError");

exports.requestMoney = asyncHandler(async (req, res) => {
    const { payerSRPayId, amount, description } = req.body;
    if (!payerSRPayId || !amount) throw new AppError("Payer SRPay ID and amount are required", 400);
    const result = await paymentRequestService.requestMoneyService(req.user.id, payerSRPayId, amount, description);
    res.status(201).json({ success: true, message: "Money request sent", data: result });
});

exports.splitBill = asyncHandler(async (req, res) => {
    const { participants, totalAmount, description } = req.body;
    if (!participants || !totalAmount) throw new AppError("Participants and total amount are required", 400);
    const result = await paymentRequestService.splitBillService(req.user.id, participants, totalAmount, description);
    res.status(201).json({ success: true, message: "Bill split created", data: result });
});

exports.payRequest = asyncHandler(async (req, res) => {
    const { requestId, transactionPin } = req.body;
    if (!requestId || !transactionPin) throw new AppError("Request ID and transaction PIN are required", 400);
    const result = await paymentRequestService.payRequestService(req.user.id, requestId, transactionPin);
    res.status(200).json({ success: true, message: result.message, data: result });
});

exports.declineRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const result = await paymentRequestService.declineRequestService(req.user.id, requestId);
    res.status(200).json({ success: true, message: result.message });
});

exports.getPendingRequests = asyncHandler(async (req, res) => {
    const result = await paymentRequestService.getPendingRequestsService(req.user.id);
    res.status(200).json({ success: true, data: result });
});

exports.getRequestHistory = asyncHandler(async (req, res) => {
    const result = await paymentRequestService.getRequestHistoryService(req.user.id);
    res.status(200).json({ success: true, data: result });
});

exports.cancelRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const result = await paymentRequestService.cancelRequestService(req.user.id, requestId);
    res.status(200).json({ success: true, message: result.message });
});