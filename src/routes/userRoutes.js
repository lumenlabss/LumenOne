const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { isAuthenticated } = require("../middleware/auth.js");

router.get("/web/list", isAuthenticated, userController.getWebList);
router.get("/web/account", isAuthenticated, userController.getAccount);
router.post("/web/account/username/save", isAuthenticated, userController.updateUsername);
router.post("/web/account/password/save", isAuthenticated, userController.updatePassword);

module.exports = router;
