const asyncHandler = require("../middleware/asyncHandler");
const paymentLinkService = require("../services/paymentLinkService");
const AppError = require("../utils/AppError");

exports.createPaymentLink = asyncHandler(async (req, res) => {
    const { amount, description } = req.body;
    if (!amount) throw new AppError("Amount is required", 400);
    const result = await paymentLinkService.createPaymentLinkService(req.user.id, amount, description);
    res.status(201).json({ success: true, message: "Payment link created", data: result });
});

exports.getPaymentLinkDetails = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const result = await paymentLinkService.getPaymentLinkDetailsService(code);
    res.status(200).json({ success: true, data: result });
});

exports.payViaLink = asyncHandler(async (req, res) => {
    const { code, transactionPin } = req.body;
    if (!code || !transactionPin) throw new AppError("Code and transaction PIN are required", 400);
    const result = await paymentLinkService.payViaLinkService(req.user.id, code, transactionPin);
    res.status(200).json({ success: true, message: result.message, data: result });
});

exports.getMyPaymentLinks = asyncHandler(async (req, res) => {
    const result = await paymentLinkService.getMyPaymentLinksService(req.user.id);
    res.status(200).json({ success: true, data: result });
});

exports.cancelPaymentLink = asyncHandler(async (req, res) => {
    const { linkId } = req.params;
    const result = await paymentLinkService.cancelPaymentLinkService(req.user.id, linkId);
    res.status(200).json({ success: true, message: result.message });
});