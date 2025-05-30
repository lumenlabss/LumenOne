const rateLimit = require("express-rate-limit");

// Basic rate limiter for all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

// Strict limiter for auth route(Login, Reditsr)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    // Render the login page with an error message
    res.status(429).render("auth/login.ejs", {
      error: "Too many requests, please try again later.",
    });
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};
