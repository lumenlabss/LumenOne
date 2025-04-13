/**
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 *      RubixOne - Open Source Project by Rubix
 *
 *     © 2025 Rubix. Licensed under the MIT License
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 */

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const session = require("express-session");
const fs = require("fs");
const db = require("./src/db.js");
const loginRoutes = require("./src/pages/auth/login.js");
const { log } = require("console");

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

// Json utile pour ejs
app.use((req, res, next) => {
  res.locals.appName = config.name;
  res.locals.appVersion = config.version;
  next();
});

// components
const components = {
  footer: path.join(__dirname, "views/components/footer.ejs"),
};
app.locals.components = components;

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

//Route
// Route pour la page d'accueil
app.use("/", loginRoutes);
app.use("/logout", loginRoutes);

// Page d'accueil
app.get("/panel/web/list", isAuthenticated, (req, res) => {
  db.get(
    "SELECT rank FROM users WHERE id = ?",
    [req.session.user.id],
    (err, row) => {
      if (err) {
        console.error(
          "Erreur lors de la récupération du rang : " + err.message
        );
        return res.status(500).send("Erreur interne du serveur");
      }

      res.render("web/list.ejs", {
        user: req.session.user,
        rank: row ? row.rank : null,
      });
    }
  );
});

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).render("404.ejs");
});

// Démarrage du serveur
app.listen(port, hostname, () => {
  console.log(`RubixOne à démarrer avec succès : http://${hostname}:${port}`);
});
