const fs = require("fs");
const path = require("path");
const db = require("../db.js");
const { checkSizeBeforeCreate } = require("../web/size-limit.js");

// Helper function to calculate the total size of a folder
function getFolderSize(folderPath, callback) {
    let totalSize = 0;

    const walk = (dir) => {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, { withFileTypes: true }, async (err, entries) => {
                if (err) return reject(err);

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await walk(fullPath);
                    } else {
                        const stats = fs.statSync(fullPath);
                        totalSize += stats.size;
                    }
                }
                resolve();
            });
        });
    };

    walk(folderPath)
        .then(() => callback(null, totalSize))
        .catch((err) => callback(err));
}

// Helper function to get the volume directory path
const getVolumesDir = () => path.join(__dirname, "../../storage/volumes");

exports.getEditFile = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileName = req.params.file;

    db.get(
        "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteUuid, userId],
        (err, website) => {
            if (err) {
                console.error("DATABASE ERROR:", err.message);
                return res.status(500).render("error/500.ejs");
            }

            if (!website) {
                return res.status(404).render("error/404.ejs");
            }

            const websiteDir = path.join(getVolumesDir(), websiteUuid);

            db.get(
                "SELECT rank FROM users WHERE id = ?",
                [userId],
                (err, row) => {
                    if (err) {
                        console.error("Error recovering rank:", err.message);
                        return res.status(500).render("error/500.ejs");
                    }

                    fs.mkdir(websiteDir, { recursive: true }, (err) => {
                        if (err && err.code !== "EEXIST") {
                            console.error(
                                `Error creating directory: ${websiteDir}`,
                                err,
                            );
                            return res.status(500).render("error/500.ejs");
                        }

                        const filePath = path.join(websiteDir, fileName);

                        fs.access(filePath, fs.constants.F_OK, (err) => {
                            if (err) {
                                if (req.query.new === "true") {
                                    const fileSize = 0;
                                    checkSizeBeforeCreate(
                                        websiteUuid,
                                        fileSize,
                                        (err) => {
                                            if (err) {
                                                return res.render(
                                                    "web/edit/files.ejs",
                                                    {
                                                        user: req.session.user,
                                                        error: err.message,
                                                        websiteUuid,
                                                        fileName,
                                                        fileContent: "",
                                                        website,
                                                    },
                                                );
                                            }

                                            fs.writeFile(
                                                filePath,
                                                "",
                                                "utf8",
                                                (err) => {
                                                    if (err) {
                                                        return res
                                                            .status(500)
                                                            .render(
                                                                "error/500.ejs",
                                                            );
                                                    }

                                                    return res.render(
                                                        "web/edit/files.ejs",
                                                        {
                                                            user: req.session
                                                                .user,
                                                            rank: row
                                                                ? row.rank
                                                                : null,
                                                            error: null,
                                                            websiteUuid,
                                                            fileName,
                                                            fileContent: "",
                                                            website,
                                                        },
                                                    );
                                                },
                                            );
                                        },
                                    );
                                } else {
                                    return res
                                        .status(404)
                                        .render("error/404.ejs", {
                                            message: `File '${fileName}' not found`,
                                        });
                                }
                                return;
                            }

                            fs.readFile(
                                filePath,
                                "utf8",
                                (err, fileContent) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .render("error/500.ejs");
                                    }

                                    res.render("web/edit/files.ejs", {
                                        user: req.session.user,
                                        rank: row ? row.rank : null,
                                        error: null,
                                        websiteUuid: websiteUuid,
                                        fileName: fileName,
                                        fileContent: fileContent,
                                        website: website,
                                    });
                                },
                            );
                        });
                    });
                },
            );
        },
    );
};

exports.saveFile = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileName = req.params.file;
    const fileContent = req.body.content;

    if (fileContent === undefined) {
        return res.status(400).send("No content provided");
    }

    db.get(
        "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteUuid, userId],
        (err, website) => {
            if (err) {
                return res.status(500).render("error/500.ejs");
            }

            if (!website) {
                return res.status(404).render("error/500.ejs");
            }

            const websiteDir = path.join(getVolumesDir(), websiteUuid);

            fs.mkdir(websiteDir, { recursive: true }, (err) => {
                if (err && err.code !== "EEXIST") {
                    return res.status(500).render("error/500.ejs");
                }

                const filePath = path.join(websiteDir, fileName);
                const fileSize = Buffer.byteLength(fileContent, "utf8");

                checkSizeBeforeCreate(websiteUuid, fileSize, (err) => {
                    if (err) {
                        return res.render("web/edit/files.ejs", {
                            user: req.session.user,
                            error: err.message,
                            websiteUuid,
                            fileName,
                            fileContent,
                            website,
                        });
                    }

                    fs.writeFile(filePath, fileContent, "utf8", (err) => {
                        if (err) {
                            return res.status(500).render("error/500.ejs");
                        }
                        res.redirect(`/load?x=/web/manage/${websiteUuid}`);
                    });
                });
            });
        },
    );
};

exports.getFolderSize = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;

    db.get(
        "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteUuid, userId],
        (err, website) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (!website) {
                return res.status(404).json({ error: "Website not found" });
            }

            const websiteDir = path.join(getVolumesDir(), websiteUuid);

            getFolderSize(websiteDir, (err, size) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Failed to get folder size" });
                }

                res.json({ size });
            });
        },
    );
};
