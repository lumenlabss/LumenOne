const db = require("../../db.js");
const bcrypt = require("bcrypt");

exports.getCustomers = (req, res) => {
    db.all("SELECT id, username, rank FROM users", (err, rows) => {
        if (err) {
            console.error("Error fetching users: " + err.message);
            return res.status(500).send("Internal server error");
        }

        res.render("web/admin/customers.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            users: rows,
        });
    });
};

exports.deleteCustomer = (req, res) => {
    const userId = req.params.id;

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

        console.log(`User with ID ${userId} deleted.`);
        res.redirect("/web/admin/customers");
    });
};

exports.getEditCustomer = (req, res) => {
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
};

exports.updateCustomer = (req, res) => {
    const userId = req.params.id;
    const { username, rank, password } = req.body;

    if (!username || !rank) {
        return res.status(400).render("error/400.ejs", {
            message: "Bad request. Username and rank are required.",
        });
    }

    db.get("SELECT id FROM users WHERE id = ?", [userId], async (err, row) => {
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
            try {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                db.run(
                    "UPDATE users SET username = ?, rank = ?, password = ? WHERE id = ?",
                    [username, rank, hashedPassword, userId],
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
            } catch (e) {
                console.error("Error hashing password: ", e);
                return res.status(500).render("error/500.ejs", {
                    message: "Internal server error",
                });
            }
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
};

exports.getCreateCustomer = (req, res) => {
    res.render("web/admin/customers/create.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
    });
};

exports.createCustomer = async (req, res) => {
    const { username, password, rank } = req.body;

    if (!username || !password || !rank) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (username, password, rank) VALUES (?, ?, ?)`;

        db.run(sql, [username, hashedPassword, rank], function (err) {
            if (err) {
                console.error("User registration error :", err.message);
                return res.status(500).send("Server error during user creation.");
            }

            console.log("New user registered with ID :", this.lastID);
            res.redirect("/web/admin/customers/create");
        });
    } catch (e) {
        console.error("Error creating user: ", e);
        return res.status(500).send("Server error during user creation.");
    }
};
