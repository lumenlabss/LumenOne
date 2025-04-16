const { spawn } = require("child_process");
const express = require("express");
const db = require("../../../db.js");
const path = require("path");
const fs = require("fs");
const net = require("net");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Middleware pour vérifier si l'utilisateur est admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error(
          "Erreur lors de la vérification du rôle de l'utilisateur : " +
            err.message
        );
        return res.status(500).render("error/500.ejs", {
          message: "Erreur interne du serveur",
        });
      }

      if (row && row.rank === "admin") {
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Accès refusé. Réservé aux administrateurs.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// Fonction pour vérifier si un port est disponible
function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false); // Le port est déjà utilisé
      } else {
        reject(err); // Une autre erreur s'est produite
      }
    });

    server.once("listening", () => {
      server.close(() => resolve(true)); // Le port est disponible
    });

    server.listen(port);
  });
}

// Route pour afficher la page de création de site
router.get("/web/admin/subscriptions/create", isAdmin, (req, res) => {
  db.all("SELECT id, username FROM users", (err, users) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des utilisateurs :",
        err.message
      );
      return res
        .status(500)
        .render("error/500", { message: "Erreur de la base de données." });
    }
    res.render("web/admin/subscriptions/create", {
      users,
      rank: req.session.user.rank,
    });
  });
});

// Route pour gérer la création du site
router.post("/web/admin/subscriptions/create", isAdmin, async (req, res) => {
  const { userId, diskLimit, port } = req.body;

  // Vérifier si tous les champs sont remplis
  if (!userId || !diskLimit || !port) {
    return res
      .status(400)
      .render("error/400", { message: "Tous les champs sont requis." });
  }

  // Vérifier si le port est disponible
  const portAvailable = await isPortAvailable(port);
  if (!portAvailable) {
    return res.status(400).render("error/400", {
      message: "Le port est déjà utilisé ou indisponible.",
    });
  }

  const siteId = uuidv4();
  const sitePath = path.join(__dirname, "../../../../storage/volumes", siteId);

  // Vérifier si le port est déjà utilisé dans la base de données
  db.get("SELECT * FROM containers WHERE ports = ?", [port], (err, row) => {
    if (err) {
      console.error("Erreur lors de la vérification du port :", err.message);
      return res
        .status(500)
        .render("error/500", { message: "Erreur de la base de données." });
    }

    if (row) {
      return res
        .status(400)
        .render("error/400", { message: "Le port est déjà utilisé." });
    }

    try {
      createSiteFolder(sitePath, diskLimit); // Créer le dossier pour le site
    } catch (err) {
      console.error(
        "Erreur lors de la création du dossier du site :",
        err.message
      );
      return res.status(500).render("error/500", {
        message: "Échec de la création du dossier du site.",
      });
    }

    // Insérer les informations du site dans la base de données
    db.run(
      `INSERT INTO containers (user_id, container_name, image, ports) VALUES (?, ?, ?, ?)`,
      [userId, siteId, "custom-image", port],
      (err) => {
        if (err) {
          console.error(
            "Erreur lors de l'insertion dans la table containers :",
            err.message
          );
          return res
            .status(500)
            .render("error/500", { message: "Erreur de la base de données." });
        }

        // Lancer le script pour démarrer le site
        startWebsiteLauncher(siteId, port);

        res.redirect("/web/admin/subscriptions"); // Rediriger vers la page des abonnements
      }
    );
  });
});

// Fonction pour créer le dossier du site
function createSiteFolder(sitePath, diskLimit) {
  if (!diskLimit) {
    throw new Error("La limite de disque n'est pas définie");
  }

  try {
    fs.mkdirSync(sitePath, { recursive: true });

    fs.writeFileSync(path.join(sitePath, ".disk_limit"), diskLimit.toString());

    const indexContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body>
        <h1>Welcome to your new website!</h1>
        <p>Modify this file from the admin panel.</p>
      </body>
      </html>
    `;
    fs.writeFileSync(path.join(sitePath, "index.html"), indexContent.trim());
  } catch (err) {
    console.error(
      `Erreur lors de la création du dossier du site à ${sitePath} :`,
      err.message
    );
    throw err;
  }
}

module.exports = router;
const { spawn } = require("child_process");
const express = require("express");
const db = require("../../../db.js");
const path = require("path");
const fs = require("fs");
const net = require("net"); // Importer net pour vérifier les ports
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Middleware pour vérifier si l'utilisateur est admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error(
          "Erreur lors de la vérification du rôle de l'utilisateur : " +
            err.message
        );
        return res.status(500).render("error/500.ejs", {
          message: "Erreur interne du serveur",
        });
      }

      if (row && row.rank === "admin") {
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Accès refusé. Réservé aux administrateurs.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// Fonction pour vérifier si un port est disponible
function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false); // Le port est déjà utilisé
      } else {
        reject(err); // Une autre erreur s'est produite
      }
    });

    server.once("listening", () => {
      server.close(() => resolve(true)); // Le port est disponible
    });

    server.listen(port);
  });
}

// Route pour afficher la page de création de site
router.get("/web/admin/subscriptions/create", isAdmin, (req, res) => {
  db.all("SELECT id, username FROM users", (err, users) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des utilisateurs :",
        err.message
      );
      return res
        .status(500)
        .render("error/500", { message: "Erreur de la base de données." });
    }
    res.render("web/admin/subscriptions/create", {
      users,
      rank: req.session.user.rank,
    });
  });
});

// Route pour gérer la création du site
router.post("/web/admin/subscriptions/create", isAdmin, async (req, res) => {
  const { userId, diskLimit, port } = req.body;

  // Vérifier si tous les champs sont remplis
  if (!userId || !diskLimit || !port) {
    return res
      .status(400)
      .render("error/400", { message: "Tous les champs sont requis." });
  }

  // Vérifier si le port est disponible
  const portAvailable = await isPortAvailable(port);
  if (!portAvailable) {
    return res.status(400).render("error/400", {
      message: "Le port est déjà utilisé ou indisponible.",
    });
  }

  const siteId = uuidv4();
  const sitePath = path.join(__dirname, "../../../../storage/volumes", siteId);

  // Vérifier si le port est déjà utilisé dans la base de données
  db.get("SELECT * FROM containers WHERE ports = ?", [port], (err, row) => {
    if (err) {
      console.error("Erreur lors de la vérification du port :", err.message);
      return res
        .status(500)
        .render("error/500", { message: "Erreur de la base de données." });
    }

    if (row) {
      return res
        .status(400)
        .render("error/400", { message: "Le port est déjà utilisé." });
    }

    try {
      createSiteFolder(sitePath, diskLimit); // Créer le dossier pour le site
    } catch (err) {
      console.error(
        "Erreur lors de la création du dossier du site :",
        err.message
      );
      return res.status(500).render("error/500", {
        message: "Échec de la création du dossier du site.",
      });
    }

    // Insérer les informations du site dans la base de données
    db.run(
      `INSERT INTO containers (user_id, container_name, image, ports) VALUES (?, ?, ?, ?)`,
      [userId, siteId, "custom-image", port],
      (err) => {
        if (err) {
          console.error(
            "Erreur lors de l'insertion dans la table containers :",
            err.message
          );
          return res
            .status(500)
            .render("error/500", { message: "Erreur de la base de données." });
        }

        // Lancer le script pour démarrer le site
        startWebsiteLauncher(siteId, port);

        res.redirect("/web/admin/subscriptions"); // Rediriger vers la page des abonnements
      }
    );
  });
});

// Fonction pour créer le dossier du site
function createSiteFolder(sitePath, diskLimit) {
  if (!diskLimit) {
    throw new Error("La limite de disque n'est pas définie");
  }

  try {
    fs.mkdirSync(sitePath, { recursive: true });

    fs.writeFileSync(path.join(sitePath, ".disk_limit"), diskLimit.toString());

    const indexContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body>
        <h1>Welcome to your new website!</h1>
        <p>Modify this file from the admin panel.</p>
      </body>
      </html>
    `;
    fs.writeFileSync(path.join(sitePath, "index.html"), indexContent.trim());
  } catch (err) {
    console.error(
      `Erreur lors de la création du dossier du site à ${sitePath} :`,
      err.message
    );
    throw err;
  }
}

module.exports = router;
