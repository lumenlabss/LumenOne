const fs = require("fs");
const path = require("path");
const db = require("../db.js");
const { checkSizeBeforeCreate } = require("../web/size-limit.js");

const getVolumesDir = () => path.join(__dirname, "../../storage/volumes");

exports.getManageWebsite = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;

    db.get(
        "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteUuid, userId],
        (err, website) => {
            if (err) {
                console.error("DB error:", err.message);
                return res.status(500).render("error/500.ejs");
            }
            if (!website) {
                return res.status(404).render("error/404.ejs");
            }

            db.get(
                "SELECT rank FROM users WHERE id = ?",
                [userId],
                (err, row) => {
                    if (err) {
                        console.error("Error retrieving rank:", err.message);
                        return res.status(500).render("error/500.ejs");
                    }

                    const filesPath = path.join(getVolumesDir(), websiteUuid);

                    fs.readdir(filesPath, (err, fileList) => {
                        if (err) {
                            console.error(
                                "Error reading directory:",
                                err.message,
                            );
                            return res.status(500).render("error/500.ejs");
                        }

                        const files = fileList.map((fileName) => {
                            const fileFullPath = path.join(filesPath, fileName);
                            let size = 0;
                            try {
                                const stats = fs.statSync(fileFullPath);
                                size = (stats.size / 1024 / 1024).toFixed(2);
                            } catch (e) {
                                console.error(
                                    `Error reading stats for file ${fileFullPath}:`,
                                    e,
                                );
                            }
                            return {
                                name: fileName,
                                size: size, // Size in MB
                            };
                        });

                        res.render("web/manage.ejs", {
                            user: req.session.user,
                            website,
                            rank: row ? row.rank : null,
                            websiteUuid,
                            files,
                            NetworkIP: "Loading...", // placeholder
                        });
                    });
                },
            );
        },
    );
};

exports.createFile = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const filename = req.body.filename;

    // Basic security check
    if (
        !filename ||
        filename.includes("..") ||
        filename.includes("/") ||
        filename.includes("php.ini") ||
        filename.length > 100
    ) {
        return res.status(400).send("Invalid file name.");
    }

    db.get(
        "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteUuid, userId],
        (err, website) => {
            if (err) {
                console.error("DB error:", err.message);
                return res.status(500).render("error/500.ejs");
            }
            if (!website) {
                return res.status(404).render("error/404.ejs");
            }

            const filePath = path.join(getVolumesDir(), websiteUuid, filename);

            // Check the size before creating
            checkSizeBeforeCreate(websiteUuid, 0, (err) => {
                if (err) {
                    console.error("Disk quota error:", err.message);
                    return res
                        .status(403)
                        .send("Disk limit exceeded, cannot create file.");
                }

                fs.writeFile(filePath, "", (err) => {
                    if (err) {
                        console.error("File creation error:", err.message);
                        return res.status(500).render("error/500.ejs");
                    }

                    res.redirect(`/web/manage/${websiteUuid}`);
                });
            });
        },
    );
};

exports.deleteFile = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileToDelete = req.params.file;

    // Basic security check
    if (
        !fileToDelete ||
        fileToDelete.includes("..") ||
        fileToDelete.includes("/")
    ) {
        return res.status(400).send("Invalid file name.");
    }

    db.get(
        "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteUuid, userId],
        (err, website) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).render("error/500.ejs");
            }
            if (!website) {
                return res.status(404).render("error/404.ejs");
            }

            const filePath = path.join(
                getVolumesDir(),
                websiteUuid,
                fileToDelete,
            );

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("File deletion error:", err.message);
                    return res.status(500).render("error/500.ejs");
                }

                res.redirect(`/web/manage/${websiteUuid}`);
            });
        },
    );
};
