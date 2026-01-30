const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController.js");
const { isAuthenticated } = require("../middleware/auth.js");

router.get("/web/backup", isAuthenticated, backupController.getBackups);
router.post("/web/backup/create", isAuthenticated, backupController.createBackup);
router.get("/web/backup/download/:id", isAuthenticated, backupController.downloadBackup);
router.post("/web/backup/delete/:id", isAuthenticated, backupController.deleteBackup);

module.exports = router;
