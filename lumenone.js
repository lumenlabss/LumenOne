/*
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 *      LumenOne - Open Source Project by LumenLabs
 *
 *     © 2025 LumenLabs. Licensed under the MIT License
 * ╳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╳
 */

console.log("lumenone.js loaded");

// === EXTERNAL MODULES ===
const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

// === INTERNAL MODULES ===
const config = require("./src/config/config.js");
const { generateKey } = require("./src/utils/SecretKey-generator.js");

// Routes
const authRoutes = require("./src/routes/authRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
const websiteRoutes = require("./src/routes/websiteRoutes.js");
const filesRoutes = require("./src/routes/filesRoutes.js");
const databaseRoutes = require("./src/routes/databaseRoutes.js");
const backupRoutes = require("./src/routes/backupRoutes.js");
const adminRoutes = require("./src/routes/adminRoutes.js");
const utilRoutes = require("./src/routes/utilRoutes.js");

// Api routes
const apiV1Router = require("./src/api/official/v1.js");
const getIPRouter = require("./src/web/get-ip.js"); // Keeping original file for now if not fully migrated to utilRoutes

// === APPLICATION INITIALIZATION ===
const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid breaking inline scripts/styles if any
}));
app.use(cors());
app.use(compression());

// Body parsing JSON and URL-encoded, with adapted limits
app.use(express.json({ limit: "80mb" }));
app.use(express.urlencoded({ extended: true, limit: "80mb" }));

// Sessions with configuration from config.js
app.use(
  session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    cookie: config.session.cookie,
  })
);

// Global variables accessible in EJS templates
app.use((req, res, next) => {
  res.locals.appName = config.name;
  res.locals.appVersion = config.version;
  next();
});

// Configuring views and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/modules", express.static(path.join(__dirname, "modules")));

// === ROUTES REGISTRATION ===

// Auth & Utilities
app.use("/", authRoutes);
app.use("/", utilRoutes);

// User Features
app.use("/", userRoutes);
app.use("/", websiteRoutes);
app.use("/", filesRoutes);
app.use("/", databaseRoutes);
app.use("/", backupRoutes);

// Admin Features
app.use("/", adminRoutes);

// === API ROUTES ===
app.use("/api", require("./src/utils/create_api_key.js"));
app.use("/api/v1", apiV1Router);

// === ERROR MANAGEMENT ===

// 404 - Page not found
app.use((req, res, next) => {
  res.status(404).render("error/404.ejs");
});

// Error middleware (500, etc.)
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).render("error/500.ejs", {
    message: err.message || "Internal server error",
  });
});

// 403 - Access denied
app.use((req, res, next) => {
  if (res.statusCode === 403) {
    res.render("error/403.ejs", {
      message: "Access denied.",
    });
  } else {
    next();
  }
});

// 400 - Wrong request
app.use((req, res, next) => {
  if (res.statusCode === 400) {
    res.render("error/400.ejs", {
      message: "Bad request.",
    });
  } else {
    next();
  }
});

// === SERVER LAUNCH ===
const port = config.port || 3000;
const hostname = config.hostname || "localhost";

generateKey();

app.listen(port, hostname, () => {
  console.log(`LumenOne successfully started: http://${hostname}:${port}`);
});
