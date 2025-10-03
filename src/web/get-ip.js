// console.log("web/get-ip.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const { isAuthenticated } = require("../middleware/auth.js"); // adapter le chemin si besoin
const { getNetworkIP } = require("../utils/network.js"); // fonction util

const router = express.Router();

router.get("/web/get-ip", isAuthenticated, async (req, res) => {
  const ip = await getNetworkIP();
  res.json({ ip });
});

module.exports = router;
