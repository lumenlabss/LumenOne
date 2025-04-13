const express = require("express");

const router = express.Router();

// Route to handle logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error while destroying the session: " + err.message);
    }
    res.redirect("/");
  });
});

module.exports = router;
