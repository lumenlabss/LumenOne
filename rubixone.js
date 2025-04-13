/**
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 *      RubixOne - Open Source Project by Rubix
 *
 *     © 2025 Rubix. Licensed under the MIT License
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 */

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const loginRoutes = require("./src/pages/auth/login.js");
const logoutRoutes = require("./src/pages/auth/logout.js");
const homeRoutes = require("./src/pages/user/home.js");

// Initialisation de l'application
const app = express();
let config;

// Chargement de la configuration
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

// Paramètres de configuration
const port = config.port || 3000;
const hostname = config.hostname || "localhost";

// Variables globales pour EJS
app.use((req, res, next) => {
  res.locals.appName = config.name;
  res.locals.appVersion = config.version;
  next();
});

// Configuration du moteur de rendu et des fichiers statiques
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Enregistrement des routes
app.use("/", loginRoutes);
app.use("/", logoutRoutes);
app.use("/", homeRoutes);

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

// Middleware pour gérer les erreurs
app.use((req, res, next) => {
  res.status(404).render("error/404.ejs");
});

// Démarrage du serveur
app.listen(port, hostname, () => {
  console.log(`RubixOne a démarré avec succès : http://${hostname}:${port}`);
});
