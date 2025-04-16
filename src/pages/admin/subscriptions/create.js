const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const db = require("../../../db");

// Middleware to check if the user is authenticated and has the admin rank
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Erreur récupération rank:", err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Erreur serveur interne",
        });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank;
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Accès refusé. Admins uniquement.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// Route GET pour afficher la page de création
router.get("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    if (err) {
      console.error("Erreur chargement utilisateurs :", err.message);
      return res.status(500).send("Erreur serveur");
    }

    res.render("web/admin/subscriptions/create", {
      appName: "Echo-Host",
      users: rows,
      user: req.session?.user,
      rank: req.session?.user?.rank,
    });
  });
});

// Route POST pour créer un site
router.post("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  const { userId, diskLimit, port } = req.body;

  if (!userId || !diskLimit || !port) {
    return res.status(400).send("Champs manquants !");
  }

  const uuid = crypto.randomUUID();

  const sql = `
    INSERT INTO websites (user_id, uuid, name, port, disk_limit)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [userId, uuid, "Mon Site", port, diskLimit], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Erreur base de données.");
    }

    const folderPath = path.join(
      __dirname,
      "../../../../storage/volumes",
      uuid
    );

    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Erreur création dossier:", err.message);
        return res.status(500).send("Erreur création du dossier.");
      }

      console.log(`Site créé: UUID=${uuid}, Port=${port}, Disk=${diskLimit}MB`); // Debug
      return res.redirect("/web/admin/subscriptions");
    });
  });
});

module.exports = router;
