console.log("pages/load.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const router = express.Router();

// Route GET to /load/:x that redirects to /x
router.get("/load/:x", (req, res) => {
  const x = req.params.x;

  if (x) {
    return res.redirect(`/${x}`);
  }

  res.render("load.ejs", { error: null });
});

// Optional fallback
router.get("/load", (req, res) => {
  res.render("load.ejs", { error: null });
});

module.exports = router;
