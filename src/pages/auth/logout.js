const express = require("express");

const router = express.Router();

// Route pour gérer la déconnexion
router.get("/logout", (req, res) => {
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
