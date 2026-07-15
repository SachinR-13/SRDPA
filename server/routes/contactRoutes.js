const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const contactController = require("../controllers/contactController");

// All routes require authentication
router.use(authenticateUser);

// POST /api/contacts - Add a contact
router.post("/", contactController.addContact);

// GET /api/contacts - Get all contacts
router.get("/", contactController.getContacts);

// POST /api/contacts/sync - Auto-sync contacts from transactions
router.post("/sync", contactController.syncContacts);

// PUT /api/contacts/:contactId/favorite - Toggle favorite
router.put("/:contactId/favorite", contactController.toggleFavorite);

// PUT /api/contacts/:contactId/nickname - Update nickname
router.put("/:contactId/nickname", contactController.updateNickname);

// DELETE /api/contacts/:contactId - Delete contact
router.delete("/:contactId", contactController.deleteContact);

module.exports = router;