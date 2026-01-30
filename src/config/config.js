require("dotenv").config();
const fs = require("fs");
const path = require("path");

let config = {};

// Load config.json first
try {
  const configData = fs.readFileSync(
    path.join(__dirname, "../../config/config.json"),
    "utf8"
  );
  config = JSON.parse(configData);
} catch (err) {
  console.error("Warning: config.json not found or invalid, relying on defaults/env vars.", err.message);
}

// Override with Environment Variables
if (process.env.APP_NAME) config.name = process.env.APP_NAME;
if (process.env.APP_VERSION) config.version = process.env.APP_VERSION;
if (process.env.PORT) config.port = parseInt(process.env.PORT);
if (process.env.HOSTNAME) config.hostname = process.env.HOSTNAME;

// Session
if (!config.session) config.session = {};
if (process.env.SESSION_SECRET) config.session.secret = process.env.SESSION_SECRET;
if (process.env.SESSION_RESAVE) config.session.resave = process.env.SESSION_RESAVE === 'true';
if (process.env.SESSION_SAVE_UNINITIALIZED) config.session.saveUninitialized = process.env.SESSION_SAVE_UNINITIALIZED === 'true';

// Ensure cookie config exists
if (!config.session.cookie) config.session.cookie = { secure: false, maxAge: 86400000 };

// Rate Limit
if (!config.rateLimit) config.rateLimit = { global: {}, auth: {} };
if (process.env.RATELIMIT_GLOBAL_WINDOW) config.rateLimit.global.windowMinutes = parseInt(process.env.RATELIMIT_GLOBAL_WINDOW);
if (process.env.RATELIMIT_GLOBAL_MAX) config.rateLimit.global.max = parseInt(process.env.RATELIMIT_GLOBAL_MAX);
if (process.env.RATELIMIT_AUTH_WINDOW) config.rateLimit.auth.windowMinutes = parseInt(process.env.RATELIMIT_AUTH_WINDOW);
if (process.env.RATELIMIT_AUTH_MAX) config.rateLimit.auth.max = parseInt(process.env.RATELIMIT_AUTH_MAX);

console.log("Configuration loaded");

module.exports = config;
