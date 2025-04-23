/*
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 *      LumenOne - Open Source Project by Lumen
 *
 *     © 2025 Lumen. Licensed under the MIT License
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
const customersRoutes = require("./src/pages/admin/customers.js");
const customersEditRoutes = require("./src/pages/admin/customers_edit.js");
const subscriptions_createRoute = require("./src/pages/admin/subscriptions/create.js");
const subscriptionsRoute = require("./src/pages/admin/subscriptions.js");
const manageRoute = require("./src/pages/user/manage.js");
const filesRoutes = require("./src/pages/user/edit/files.js");

// Application initialization
const app = express();
let config;
app.use(require("./src/start-webserver.js"));

// Loading configuration
try {
  const configData = fs.readFileSync("config/config.json", "utf8");
  config = JSON.parse(configData);
  console.log("Configuration loaded:", config);
} catch (err) {
  console.error("Error reading or parsing config.json:", err);
  process.exit(1);
}

// Configuration parameters
const port = config.port || 3000;
const hostname = config.hostname || "localhost";

// Global variables for EJS
app.use((req, res, next) => {
  res.locals.appName = config.name;
  res.locals.appVersion = config.version;
  next();
});

// Middleware configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret-key", // Replace with a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use `secure: true` if using HTTPS
  })
);

// Rendering engine and static files configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Registering routes
app.use("/", loginRoutes);
app.use("/", logoutRoutes);
app.use("/", homeRoutes);
app.use("/", customersRoutes);
app.use("/", customersEditRoutes);
app.use("/", subscriptions_createRoute);
app.use("/", subscriptionsRoute);
app.use("/", manageRoute);
app.use("/", filesRoutes);

// Middleware to handle errors
app.use((req, res, next) => {
  res.status(404).render("error/404.ejs");
});
app.use((req, res, next) => {
  res.status(500).render("error/500.ejs", {
    message: "Internal server error",
  });
});
app.use((req, res, next) => {
  res.status(403).render("error/403.ejs", {
    message: "Access denied.",
  });
});
app.use((req, res, next) => {
  res.status(400).render("error/400.ejs", {
    message: "Bad request.",
  });
});

// Starting the server
app.listen(port, hostname, () => {
  console.log(`LumenOne successfully started: http://${hostname}:${port}`);
});
