const db = require("../db.js");
const bcrypt = require("bcrypt");
const useragent = require("useragent");

exports.getWebList = (req, res) => {
    const userId = req.session.user.id;

    db.all(
        "SELECT name, port, disk_limit, uuid FROM websites WHERE user_id = ?",
        [userId],
        (err, websites) => {
            if (err) {
                console.error("Error retrieving websites:", err.message);
                return res.status(500).send("Internal server error");
            }

            db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
                if (err) {
                    console.error("Error while retrieving the rank: " + err.message);
                    return res.status(500).send("Internal server error");
                }

                res.render("web/list.ejs", {
                    user: req.session.user,
                    websites,
                    rank: row ? row.rank : null,
                    NetworkIP: "Loading...", // placeholder
                });
            });
        }
    );
};

exports.getAccount = (req, res) => {
    const userId = req.session.user.id;

    db.get(
        "SELECT username, rank, created_at FROM users WHERE id = ?",
        [userId],
        (err, userInfo) => {
            if (err) {
                console.error("Error retrieving user info:", err.message);
                return res.status(500).send("Internal server error");
            }

            if (!userInfo) {
                return res.status(404).send("User not found");
            }

            const fullUser = {
                ...userInfo,
                id: userId,
            };

            db.all(
                "SELECT id, user_id, activity, browser, ip, os, activity_at FROM users_activity WHERE user_id = ? ORDER BY activity_at DESC",
                [userId],
                (err2, activity) => {
                    if (err2) {
                        console.error("Error retrieving user activities:", err2.message);
                        return res.status(500).send("Internal server error");
                    }

                    res.render("web/account.ejs", {
                        user: fullUser,
                        rank: userInfo.rank,
                        error: null,
                        succes: null,
                        activity: activity || [],
                    });
                }
            );
        }
    );
};

exports.updateUsername = (req, res) => {
    const userId = req.session.user.id;
    const newUsername = req.body.username;

    if (!newUsername) {
        return res.render("web/account", {
            error: "Username cannot be empty",
            succes: false,
            rank: req.session.user.rank,
            user: req.session.user,
            activity: [],
        });
    }

    db.run(
        "UPDATE users SET username = ? WHERE id = ?",
        [newUsername, userId],
        function (err) {
            if (err) {
                console.error("Error updating username:", err.message);
                return res.render("web/account", {
                    error: "Server Error",
                    succes: false,
                    rank: req.session.user.rank,
                    user: req.session.user,
                    activity: [],
                });
            }

            // Session update
            req.session.user.username = newUsername;

            // Addition to users_activity
            const agent = useragent.parse(req.headers["user-agent"]);
            const browser = agent.family || "Unknown";
            let os = agent.os ? agent.os.toString() : "Unknown";

            const now = new Date();
            const pad = (n) => n.toString().padStart(2, "0");
            const activity_at = `${now.getFullYear()}-${pad(
                now.getMonth() + 1
            )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
                now.getMinutes()
            )}:${pad(now.getSeconds())}`;

            db.run(
                `INSERT INTO users_activity (user_id, activity, browser, ip, os, activity_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    "Username Changed",
                    browser,
                    req.ip || req.connection.remoteAddress || "Unknown",
                    os,
                    activity_at,
                ],
                function (err) {
                    if (err) console.error("Error logging activity:", err.message);

                    // Recovery of recent activities for rendering
                    db.all(
                        "SELECT id, user_id, activity, browser, ip, os, activity_at FROM users_activity WHERE user_id = ? ORDER BY activity_at DESC",
                        [userId],
                        (err2, activity) => {
                            res.render("web/account", {
                                succes: "Username updated successfully",
                                error: null,
                                rank: req.session.user.rank,
                                user: req.session.user,
                                activity: activity || [],
                            });
                        }
                    )
                }
            );
        }
    );
};

exports.updatePassword = (req, res) => {
    const userId = req.session.user.id;
    const { current_password, new_password, confirm_new_password } = req.body;

    if (!current_password || !new_password || !confirm_new_password) {
        return res.render("web/account", {
            error: "All fields are required",
            succes: null,
            user: req.session.user,
            rank: req.session.user.rank,
            activity: [],
        });
    }

    if (new_password !== confirm_new_password) {
        return res.render("web/account", {
            error: "New passwords do not match",
            succes: null,
            user: req.session.user,
            rank: req.session.user.rank,
            activity: [],
        });
    }

    db.get("SELECT password FROM users WHERE id = ?", [userId], async (err, row) => {
        if (err) {
            console.error("Error fetching user password:", err.message);
            return res.render("web/account", {
                error: "Server Error",
                succes: null,
                user: req.session.user,
                rank: req.session.user.rank,
                activity: [],
            });
        }

        if (!row) {
            return res.render("web/account", {
                error: "User not found",
                succes: null,
                user: req.session.user,
                rank: req.session.user.rank,
                activity: [],
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(current_password, row.password);
        if (!isMatch) {
            return res.render("web/account", {
                error: "Current password is incorrect",
                user: req.session.user,
                succes: null,
                rank: req.session.user.rank,
                activity: [],
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        db.run(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId],
            function (err) {
                if (err) {
                    console.error("Error updating password:", err.message);
                    return res.render("web/account", {
                        error: "Server Error",
                        succes: null,
                        user: req.session.user,
                        rank: req.session.user.rank,
                        activity: [],
                    });
                }

                // Fetch activity again for consistency
                db.all(
                    "SELECT id, user_id, activity, browser, ip, os, activity_at FROM users_activity WHERE user_id = ? ORDER BY activity_at DESC",
                    [userId],
                    (err2, activity) => {
                        res.render("web/account", {
                            succes: "Password updated successfully",
                            error: null,
                            user: req.session.user,
                            rank: req.session.user.rank,
                            activity: activity || [],
                        });
                    }
                );
            }
        );
    });
};
