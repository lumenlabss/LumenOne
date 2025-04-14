const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Middleware to check if the user is authenticated and has the admin rank
// Middleware to check if the user is authenticated and has the admin rank
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    // Check the user's rank in the database
    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error while checking user rank: " + err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank; // Store the rank in the session
        return next(); // User is authenticated and has admin rank
      }

      // If the user is not admin, show a 403 error page
      return res.status(403).render("error/403.ejs", {
        message: "Access denied. Admins only.",
      });
    });
  } else {
    // Redirect to the login page if the user is not authenticated
    res.redirect("/");
  }
}

// Route to edit a user
router.get("/web/admin/customers/edit/:id", isAuthenticated, (req, res) => {
  const userId = req.params.id;
  db.get(
    "SELECT id, username, rank FROM users WHERE id = ?",
    [userId],
    (err, row) => {
      if (err) {
        console.error("Error fetching user: " + err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (!row) {
        return res.status(404).render("error/404.ejs", {
          message: "User not found.",
        });
      }

      // Render the edit user page with the user's details
      res.render("web/admin/customers_edit.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
        userToEdit: row,
      });
    }
  );
});

// Route to update a user
router.post("/web/admin/customers/edit/:id", isAuthenticated, (req, res) => {
  const userId = req.params.id;
  const { username, rank } = req.body;

  // Validate input
  if (!username || !rank) {
    return res.status(400).render("error/400.ejs", {
      message: "Bad request. Username and rank are required.",
    });
  }

  // Prevent modifying the currently logged-in user (optional)
  if (userId === req.session.user.id.toString()) {
    return res.status(403).render("error/403.ejs", {
      message: "You cannot modify your own account.",
    });
  }

  // Check if the user exists
  db.get("SELECT id FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
      console.error("Error fetching user: " + err.message);
      return res.status(500).render("error/500.ejs", {
        message: "Internal server error",
      });
    }

    if (!row) {
      return res.status(404).render("error/404.ejs", {
        message: "User not found.",
      });
    }

    // Update the user
    db.run(
      "UPDATE users SET username = ?, rank = ? WHERE id = ?",
      [username, rank, userId],
      function (err) {
        if (err) {
          console.error("Error updating user: " + err.message);
          return res.status(500).render("error/500.ejs", {
            message: "Internal server error",
          });
        }

        res.redirect("/web/admin/customers");
      }
    );
  });
});

module.exports = router;
