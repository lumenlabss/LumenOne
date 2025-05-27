const rateLimit = require('express-rate-limit');

// Basic rate limiter for all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false, 
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});



// Strict limiter for auth route(LOgin, Reditsr)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: "Too many login attempts, please try again later"
  }
});

module.exports = {
     globalLimiter, 
     authLimiter
     };