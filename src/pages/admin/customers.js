// console.log("pages/admin/customers.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const { isAuthenticated } = require("../../middleware/auth-admin.js");

// Route for the admin customers page
router.get("/web/admin/customers", isAuthenticated, (req, res) => {
  db.all("SELECT id, username, rank FROM users", (err, rows) => {
    if (err) {
      console.error("Error fetching users: " + err.message);
      return res.status(500).send("Internal server error");
    }

    // Render the customers page with the list of users
    res.render("web/admin/customers.ejs", {
      user: req.session.user,
      rank: req.session.user.rank,
      users: rows,
    });
  });
});

// Route to delete a user
router.get("/web/admin/customers/delete/:id", isAuthenticated, (req, res) => {
  const userId = req.params.id;

  // Prevent deletion of the admin account
  if (userId === "1") {
    return res.status(403).render("error/403.ejs", {
      message: "You cannot delete the admin account.",
    });
  }

  db.run("DELETE FROM users WHERE id = ?", [userId], (err) => {
    if (err) {
      console.error("Error deleting user: " + err.message);
      return res.status(500).render("error/500.ejs", {
        message: "Internal server error",
      });
    }

    console.log(`User with ID ${userId} deleted.`); // debugging
    res.redirect("/web/admin/customers");
  });
});

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

module.exports = router;
