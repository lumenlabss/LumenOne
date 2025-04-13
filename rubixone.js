const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const sqlite = require("sqlite3").verbose();
const session = require("express-session");
const fs = require("fs");

const app = express();
let config;

// Lecture et chargement de la configuration
try {
  const configData = fs.readFileSync("config/config.json", "utf8");
  config = JSON.parse(configData);
  console.log("Configuration lue :", config);
} catch (err) {
  console.error(
    "Erreur lors de la lecture ou de l'analyse de config.json :",
    err
  );
  process.exit(1);
}

// Utilisation des paramètres de configuration
const port = config.port || 3000;
const hostname = config.hostname || "localhost";

// Configuration des middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "cle-secrete", // Remplacez par une clé secrète sécurisée
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Utilisez `secure: true` si vous utilisez HTTPS
  })
);
app.use((req, res, next) => {
  res.locals.appName = config.name;
  next();
});

// Configuration du moteur de rendu et des fichiers statiques
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware pour vérifier si l'utilisateur est connecté
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/");
}

// Système de connexion
app.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error(
          "Erreur lors de la requête à la base de données : " + err.message
        );
        res.status(500).send("Erreur interne du serveur");
      } else if (row) {
        req.session.user = { id: row.id, username: row.username };
        console.log("Utilisateur connecté :", req.session.user); // Debugging
        res.redirect("/panel/web/list");
      } else {
        res.render("auth/login.ejs", { error: "Identifiants invalides" });
      }
    }
  );
});

// Système de déconnexion
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

// Page d'accueil protégée
app.get("/panel/web/list", isAuthenticated, (req, res) => {
  res.render("web/list.ejs", { user: req.session.user });
});

// Configuration de la base de données
const db = new sqlite.Database("rubixone.db", (err) => {
  if (err) {
    console.error(
      "Erreur lors de l'ouverture de la base de données : " + err.message
    );
  } else {
    console.log("Connecté à la base de données.");
  }
});

db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`,
  (err) => {
    if (err) {
      console.error("Erreur lors de la création de la table : " + err.message);
    } else {
      console.log("Table des utilisateurs créée ou déjà existante.");
    }
  }
);

db.run(
  `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
  ["admin", "admin"],
  (err) => {
    if (err) {
      console.error(
        "Erreur lors de l'insertion de l'utilisateur admin : " + err.message
      );
    } else {
      console.log("Utilisateur admin créé ou déjà existant.");
    }
  }
);

// Démarrage du serveur
app.listen(port, hostname, () => {
  console.log(`RubixOne à démarrer avec succès : http://${hostname}:${port}`);
});
