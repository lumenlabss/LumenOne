console.log("middleware/auth.js"); // To confirm that the page has been loaded correctly

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/");
}

module.exports = {
  isAuthenticated,
};
