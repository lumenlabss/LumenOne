const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const { authLimiter } = require("../middleware/rate-limiter.js");

router.get("/", authController.getLoginPage);
router.post("/login", authLimiter, authController.login);
router.get("/logout", authController.logout);

module.exports = router;
