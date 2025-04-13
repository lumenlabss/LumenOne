const express = require("express");
const db = require("../../db.js");

const router = express.Router();

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(
        "Erreur lors de la destruction de la session : " + err.message
      );
    }
    res.redirect("/");
  });
});

module.exports = router;
