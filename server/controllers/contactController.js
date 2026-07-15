const asyncHandler = require("../middleware/asyncHandler");
const contactService = require("../services/contactService");
const AppError = require("../utils/AppError");

// ================= ADD CONTACT =================
exports.addContact = asyncHandler(async (req, res) => {
    const { srpayId, nickname } = req.body;

    if (!srpayId) {
        throw new AppError("SRPay ID is required", 400);
    }

    const result = await contactService.addContactService(req.user.id, srpayId, nickname);

    res.status(201).json({
        success: true,
        message: "Contact added successfully",
        data: result,
    });
});

// ================= GET ALL CONTACTS =================
exports.getContacts = asyncHandler(async (req, res) => {
    const result = await contactService.getContactsService(req.user.id);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// ================= TOGGLE FAVORITE =================
exports.toggleFavorite = asyncHandler(async (req, res) => {
    const { contactId } = req.params;
    const result = await contactService.toggleFavoriteService(req.user.id, contactId);

    res.status(200).json({
        success: true,
        message: result.isFavorite ? "Added to favorites" : "Removed from favorites",
        data: result,
    });
});

// ================= UPDATE NICKNAME =================
exports.updateNickname = asyncHandler(async (req, res) => {
    const { contactId } = req.params;
    const { nickname } = req.body;

    if (!nickname) {
        throw new AppError("Nickname is required", 400);
    }

    const result = await contactService.updateNicknameService(req.user.id, contactId, nickname);

    res.status(200).json({
        success: true,
        message: "Nickname updated",
        data: result,
    });
});

// ================= DELETE CONTACT =================
exports.deleteContact = asyncHandler(async (req, res) => {
    const { contactId } = req.params;
    const result = await contactService.deleteContactService(req.user.id, contactId);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// ================= SYNC CONTACTS =================
exports.syncContacts = asyncHandler(async (req, res) => {
    const result = await contactService.syncContactsFromTransactionsService(req.user.id);

    res.status(200).json({
        success: true,
        message: `${result.synced.length} new contacts synced`,
        data: result,
    });
});