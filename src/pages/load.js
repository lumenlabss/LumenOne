console.log("pages/load.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const router = express.Router();

// Route GET to display the load page
router.get("/load", (req, res) => {
  res.render("load.ejs", { error: null });
});

module.exports = router;
