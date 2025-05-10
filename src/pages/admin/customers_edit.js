console.log("pages/admin/customers_edit.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const { isAuthenticated } = require("../../middleware/auth-admin.js");

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
  const { username, rank, password } = req.body;

  if (!username || !rank) {
    return res.status(400).render("error/400.ejs", {
      message: "Bad request. Username and rank are required.",
    });
  }

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

    if (password && password.trim() !== "") {
      db.run(
        "UPDATE users SET username = ?, rank = ?, password = ? WHERE id = ?",
        [username, rank, password, userId],
        function (err) {
          if (err) {
            console.error("Error updating user with password: " + err.message);
            return res.status(500).render("error/500.ejs", {
              message: "Internal server error",
            });
          }

          res.redirect("/web/admin/customers");
        }
      );
    } else {
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
    }
  });
});

module.exports = router;
