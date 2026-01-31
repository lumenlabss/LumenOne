const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const db = require("../db.js");

const getStorageDir = () => path.join(__dirname, "../../storage");

function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date); // in ms
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const h = Math.floor(min / 60);
    const d = Math.floor(h / 24);

    if (sec < 60) return `${sec} sec`;
    if (min < 60) return `${min} min`;
    if (h < 24) return `${h} h`;
    return `${d} j`;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    else return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

exports.getBackups = (req, res) => {
    const userId = req.session.user.id;

    db.all(
        "SELECT id, name, size, created_at FROM backups WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, backups) => {
            if (err) return res.status(500).send("Internal server error");

            db.all(
                "SELECT id, name, uuid FROM websites WHERE user_id = ?",
                [userId],
                (err, websites) => {
                    if (err)
                        return res.status(500).send("Internal server error");

                    db.get(
                        "SELECT rank FROM users WHERE id = ?",
                        [userId],
                        (err, row) => {
                            if (err)
                                return res
                                    .status(500)
                                    .send("Internal server error");

                            const lastBackupTime =
                                backups.length > 0
                                    ? timeAgo(backups[0].created_at)
                                    : null;

                            let totalSize = 0;
                            backups.forEach((b) => (totalSize += b.size));
                            const totalSizeFormatted = formatBytes(totalSize);

                            res.render("web/backup.ejs", {
                                user: req.session.user,
                                backups,
                                websites,
                                rank: row ? row.rank : null,
                                lastBackupTime,
                                totalSizeFormatted,
                                formatBytes,
                            });
                        },
                    );
                },
            );
        },
    );
};

exports.createBackup = (req, res) => {
    const userId = req.session.user.id;
    const { backupName, websiteId } = req.body;

    if (!backupName || !websiteId) {
        return res.status(400).send("Missing backup name or website");
    }

    db.get(
        "SELECT uuid FROM websites WHERE uuid = ? AND user_id = ?",
        [websiteId, userId],
        (err, website) => {
            if (err || !website)
                return res.status(400).send("Website not found");

            const siteUUID = website.uuid;
            const timestamp = Date.now();
            const filename = `${backupName}-${timestamp}.zip`;
            const outputPath = path.join(getStorageDir(), "backup", filename);
            const sitePath = path.join(getStorageDir(), "volumes", siteUUID);

            if (!fs.existsSync(sitePath))
                return res.status(400).send("Website folder not found");

            // Ensure backup directory exists
            const backupDir = path.join(getStorageDir(), "backup");
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const output = fs.createWriteStream(outputPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

            output.on("close", () => {
                const size = archive.pointer();

                db.run(
                    "INSERT INTO backups (user_id, website_id, name, size, path, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
                    [userId, websiteId, filename, size, outputPath],
                    (err) => {
                        if (err) {
                            console.error("Error saving backup:", err.message);
                            return res.status(500).send("Error saving backup");
                        }
                        res.redirect("/web/backup");
                    },
                );
            });

            archive.on("error", (err) => {
                console.error("Archive error:", err.message);
                res.status(500).send("Error creating backup");
            });

            archive.pipe(output);
            archive.directory(sitePath, false);
            archive.finalize();
        },
    );
};

exports.downloadBackup = (req, res) => {
    const userId = req.session.user.id;
    const backupId = req.params.id;

    db.get(
        "SELECT name FROM backups WHERE id = ? AND user_id = ?",
        [backupId, userId],
        (err, backup) => {
            if (err || !backup) return res.status(404).send("Backup not found");

            const filePath = path.join(getStorageDir(), "backup", backup.name);
            if (!fs.existsSync(filePath))
                return res.status(404).send("Backup file not found");

            res.download(filePath, backup.name);
        },
    );
};

exports.deleteBackup = (req, res) => {
    const userId = req.session.user.id;
    const backupId = req.params.id;

    db.get(
        "SELECT name FROM backups WHERE id = ? AND user_id = ?",
        [backupId, userId],
        (err, backup) => {
            if (err || !backup) return res.status(404).send("Backup not found");

            const filePath = path.join(getStorageDir(), "backup", backup.name);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            db.run(
                "DELETE FROM backups WHERE id = ? AND user_id = ?",
                [backupId, userId],
                (err) => {
                    if (err)
                        return res.status(500).send("Error deleting backup");
                    res.redirect("/web/backup");
                },
            );
        },
    );
};
