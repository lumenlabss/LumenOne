/*
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 *      LumenOne - Open Source Project by Lumen
 *
 *     © 2025 Lumen. Licensed under the MIT License
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 */

console.log("lumenone.js loaded"); // To confirm that the page has been loaded correctly
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
const config = require("./src/config/config.js");
const createuserRoutes = require("./src/pages/admin/customers/create.js");
const informationRoutes = require("./src/pages/admin/information.js");
const accountRoutes = require("./src/pages/user/account.js");
const loadRoutes = require("./src/pages/load.js");
const statisticsdomainsRoutes = require("./src/pages/user/statistics/domains.js");
const statisticsRoutes = require("./src/pages/user/statistics/statistics.js");
const settingsadminRoutes = require("./src/pages/admin/settings.js");

// Application initialization
const app = express();

app.use(express.json({ limit: "80mb" }));
app.use(express.urlencoded({ limit: "80mb", extended: true }));

// Global variables for EJS
app.use((req, res, next) => {
  res.locals.appName = config.name;
  res.locals.appVersion = config.version;
  next();
});

// Middleware configuration
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  session({
    secret: config.session.secret, // Use of the config.json secret key
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie, // Setting cookies from config.json
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
app.use("/", createuserRoutes);
app.use("/", informationRoutes);
app.use("/", accountRoutes);
app.use("/", loadRoutes);
app.use("/", statisticsdomainsRoutes);
app.use("/", statisticsRoutes);
app.use("/", settingsadminRoutes);

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
const port = config.port || 3000;
const hostname = config.hostname || "localhost";

app.listen(port, hostname, () => {
  console.log(`LumenOne successfully started: http://${hostname}:${port}`);
});
