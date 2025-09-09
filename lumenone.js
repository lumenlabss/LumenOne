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

// === INTERNAL MODULES ===
const config = require("./src/config/config.js");

// Auth Routes
const loginRoutes = require("./src/pages/auth/login.js");
const logoutRoutes = require("./src/pages/auth/logout.js");

// Users Routes
const homeRoutes = require("./src/pages/user/home.js");
const manageRoute = require("./src/pages/user/manage.js");
const filesRoutes = require("./src/pages/user/edit/files.js");
const accountRoutes = require("./src/pages/user/account.js");
const settingsadminRoutes = require("./src/pages/admin/settings.js");
const DatabaseRoutes = require("./src/pages/user/database.js");
const backupRoutes = require("./src/pages/user/backup.js");

// Admin Routes
const customersRoutes = require("./src/pages/admin/customers.js");
const customersEditRoutes = require("./src/pages/admin/customers_edit.js");
const subscriptions_createRoute = require("./src/pages/admin/subscriptions/create.js");
const subscriptionsRoute = require("./src/pages/admin/subscriptions.js");
const createuserRoutes = require("./src/pages/admin/customers/create.js");
const informationRoutes = require("./src/pages/admin/information.js");
const modulesRoutes = require("./src/pages/admin/modules.js");

// Api routes
const apiV1Router = require("./src/api/official/v1.js");

// Various Routes
const loadRoutes = require("./src/pages/load.js");
const { generateKey } = require("./src/utils/SecretKey-generator.js");
const getIPRouter = require("./src/web/get-ip.js");

// === APPLICATION INITIALIZATION ===
const app = express();

// === GLOBAL MIDDLEWARE ===
// Body parsing JSON and URL-encoded, with adapted limits
app.use(express.json({ limit: "80mb" }));
app.use(express.urlencoded({ extended: true, limit: "80mb" }));

// Sessions with configuration from config.js
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false, // evite de generer des sessions inutiles pour eviter les DoS par sessions vides
    cookie: {
      httpOnly: true, // pour empecher des failles du genre xss
      secure: process.env.NODE_ENV === "production", // en gros tu met dans ta config un truc pour dire que t en mode dev pour rester en http et sinon tu use de l'https
      sameSite: "lax", // limite l'envoie de cookie sur des requetes croos site et protege contre certaines attaques csrf (lax bloque les formulaires et requetes cross site)
      maxAge: 1000 * 60 * 60 * 2 // durée de vie du cookie de 2h apres le cookie expire et l'user doit se reco
    },
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

// Auth Routes
app.use("/", loginRoutes);
app.use("/", logoutRoutes);

// Users Routes
app.use("/", homeRoutes);
app.use("/", manageRoute);
app.use("/", filesRoutes);
app.use("/", accountRoutes);
app.use("/", DatabaseRoutes);
app.use("/", backupRoutes);

// Admin Routes
app.use("/", customersRoutes);
app.use("/", customersEditRoutes);
app.use("/", subscriptions_createRoute);
app.use("/", subscriptionsRoute);
app.use("/", createuserRoutes);
app.use("/", informationRoutes);
app.use("/", settingsadminRoutes);
app.use("/", modulesRoutes);

//  Various Routes
app.use("/", loadRoutes);
app.use("/", getIPRouter);

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
