const express = require("express");
const router = express.Router();
const utilController = require("../controllers/utilController.js");
const { isAuthenticated } = require("../middleware/auth.js");

router.get("/load/:x", utilController.loadRedirect);
router.get("/load", utilController.getLoadPage);
router.get("/web/get-ip", isAuthenticated, utilController.getIp);

module.exports = router;
