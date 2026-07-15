const Contact = require("../models/Contact");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ================= ADD CONTACT =================
const addContactService = async (userId, srpayId, nickname) => {
    const contactUser = await User.findOne({ srpayId });
    if (!contactUser) throw new Error("User not found");

    if (contactUser._id.toString() === userId.toString()) {
        throw new Error("Cannot add yourself as a contact");
    }

    const existing = await Contact.findOne({ userId, contactUserId: contactUser._id });
    if (existing) throw new Error("Contact already exists");

    const contact = await Contact.create({
        userId,
        contactUserId: contactUser._id,
        nickname: nickname || "",
    });

    return {
        id: contact._id,
        fullName: contactUser.fullName,
        srpayId: contactUser.srpayId,
        phone: contactUser.phone,
        profileImage: contactUser.profileImage,
        nickname: contact.nickname,
        isFavorite: contact.isFavorite,
        createdAt: contact.createdAt,
    };
};

// ================= GET ALL CONTACTS =================
const getContactsService = async (userId) => {
    const contacts = await Contact.find({ userId })
        .populate("contactUserId", "fullName srpayId phone profileImage")
        .sort({ isFavorite: -1, lastTransactionAt: -1, createdAt: -1 });

    return contacts
        .filter((c) => c.contactUserId) // Only if user still exists
        .map((contact) => ({
            id: contact._id,
            fullName: contact.contactUserId.fullName,
            srpayId: contact.contactUserId.srpayId,
            phone: contact.contactUserId.phone,
            profileImage: contact.contactUserId.profileImage,
            nickname: contact.nickname,
            isFavorite: contact.isFavorite,
            lastTransactionAt: contact.lastTransactionAt,
        }));
};

// ================= TOGGLE FAVORITE =================
const toggleFavoriteService = async (userId, contactId) => {
    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) throw new Error("Contact not found");

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    return { isFavorite: contact.isFavorite };
};

// ================= UPDATE NICKNAME =================
const updateNicknameService = async (userId, contactId, nickname) => {
    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) throw new Error("Contact not found");

    contact.nickname = nickname;
    await contact.save();

    return { nickname: contact.nickname };
};

// ================= DELETE CONTACT =================
const deleteContactService = async (userId, contactId) => {
    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) throw new Error("Contact not found");

    await Contact.deleteOne({ _id: contactId });

    return { message: "Contact deleted successfully" };
};

// ================= AUTO-SYNC CONTACTS (from transactions) =================
const syncContactsFromTransactionsService = async (userId) => {
    const transactions = await Transaction.find({
        userId,
        type: "DEBIT",
        receiverId: { $ne: null },
    })
        .sort({ createdAt: -1 })
        .populate("receiverId", "fullName srpayId phone profileImage");

    const seen = new Set();
    const synced = [];

    for (const tx of transactions) {
        if (!tx.receiverId) continue;
        const rid = tx.receiverId._id.toString();
        if (seen.has(rid)) continue;
        seen.add(rid);

        // Upsert contact
        const existing = await Contact.findOne({ userId, contactUserId: rid });
        if (!existing) {
            const contact = await Contact.create({
                userId,
                contactUserId: rid,
                lastTransactionAt: tx.createdAt,
            });
            synced.push({
                id: contact._id,
                fullName: tx.receiverId.fullName,
                srpayId: tx.receiverId.srpayId,
            });
        } else {
            // Update last transaction time
            if (!existing.lastTransactionAt || existing.lastTransactionAt < tx.createdAt) {
                existing.lastTransactionAt = tx.createdAt;
                await existing.save();
            }
        }
    }

    return { synced };
};

module.exports = {
    addContactService,
    getContactsService,
    toggleFavoriteService,
    updateNicknameService,
    deleteContactService,
    syncContactsFromTransactionsService,
};