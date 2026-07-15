const asyncHandler = require("../middleware/asyncHandler");
const upiService = require("../services/upiService");
const AppError = require("../utils/AppError");

// ================= CREATE UPI ID =================
exports.createUpiId = asyncHandler(async (req, res) => {
    const { nickname } = req.body;
    const result = await upiService.createUpiIdService(req.user.id, nickname);

    res.status(201).json({
        success: true,
        message: "UPI ID created successfully",
        data: result,
    });
});

// ================= GET ALL UPI IDS =================
exports.getUserUpiIds = asyncHandler(async (req, res) => {
    const result = await upiService.getUserUpiIdsService(req.user.id);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// ================= SET PRIMARY UPI =================
exports.setPrimaryUpi = asyncHandler(async (req, res) => {
    const { upiId } = req.params;
    const result = await upiService.setPrimaryUpiService(req.user.id, upiId);

    res.status(200).json({
        success: true,
        message: result.message,
        data: { upiId: result.upiId },
    });
});

// ================= DELETE UPI ID =================
exports.deleteUpiId = asyncHandler(async (req, res) => {
    const { upiId } = req.params;
    const result = await upiService.deleteUpiIdService(req.user.id, upiId);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// ================= RESOLVE UPI ID =================
exports.resolveUpiId = asyncHandler(async (req, res) => {
    const { upiId } = req.query;

    if (!upiId) {
        throw new AppError("UPI ID is required", 400);
    }

    const result = await upiService.resolveUpiIdService(upiId);

    res.status(200).json({
        success: true,
        data: result,
    });
});