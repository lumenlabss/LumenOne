console.log("pages/admin/modules.js loaded");

const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

router.get("/web/admin/modules", isAuthenticated, async (req, res) => {
  // Render the modules pages
  res.render("web/admin/modules.ejs", {
    user: req.session.user,
    rank: req.session.user.rank,
  });
});

module.exports = router;
