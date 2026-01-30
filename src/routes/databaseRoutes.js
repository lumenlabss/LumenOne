const express = require("express");
const router = express.Router();
const databaseController = require("../controllers/databaseController.js");
const { isAuthenticated } = require("../middleware/auth.js");

router.get("/web/database", isAuthenticated, databaseController.getDatabases);
router.post("/web/database/create", isAuthenticated, databaseController.createDatabase);

module.exports = router;
