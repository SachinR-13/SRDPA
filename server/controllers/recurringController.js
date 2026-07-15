const asyncHandler = require("../middleware/asyncHandler");
const recurringPaymentService = require("../services/recurringPaymentService");
const AppError = require("../utils/AppError");

exports.createRecurringPayment = asyncHandler(async (req, res) => {
    const { receiverSRPayId, amount, frequency, description, dayOfMonth, dayOfWeek, startDate, endDate, maxPayments } = req.body;
    if (!receiverSRPayId || !amount || !frequency || !startDate) {
        throw new AppError("Receiver SRPay ID, amount, frequency, and start date are required", 400);
    }
    const result = await recurringPaymentService.createRecurringPaymentService(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Recurring payment created", data: result });
});

exports.getMyRecurringPayments = asyncHandler(async (req, res) => {
    const result = await recurringPaymentService.getMyRecurringPaymentsService(req.user.id);
    res.status(200).json({ success: true, data: result });
});

exports.toggleRecurringPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const result = await recurringPaymentService.toggleRecurringPaymentService(req.user.id, paymentId);
    res.status(200).json({ success: true, message: result.message, data: { status: result.status } });
});

exports.cancelRecurringPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const result = await recurringPaymentService.cancelRecurringPaymentService(req.user.id, paymentId);
    res.status(200).json({ success: true, message: result.message });
});

// Admin: Process due recurring payments
exports.processDuePayments = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") throw new AppError("Admin only", 403);
    const result = await recurringPaymentService.processDuePaymentsService();
    res.status(200).json({ success: true, message: `Processed: ${result.processed}, Failed: ${result.failed}`, data: result });
});