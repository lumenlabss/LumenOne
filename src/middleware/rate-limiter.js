const rateLimit = require("express-rate-limit");
const config = require("../../config/config.json");

// Global limiter
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.global.windowMinutes * 60 * 1000,
  max: config.rateLimit.global.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

// Auth limiter
const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMinutes * 60 * 1000,
  max: config.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render("auth/login", {
      error: "Too many attempts. Try again later.",
    });
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};
