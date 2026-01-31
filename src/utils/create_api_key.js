const express = require("express");
const router = express.Router();
const db = require("../db.js");
const crypto = require("crypto");
const { isAuthenticated } = require("../middleware/auth.js");

// POST /api/admin/api-keys - Generates a new API key
router.post("/admin/api-keys", isAuthenticated, async (req, res) => {
    const api_key = "lumo_" + crypto.randomBytes(24).toString("hex");

    db.run(
        `INSERT INTO apikey (api_key) VALUES (?)`,
        [api_key],
        function (err) {
            if (err) {
                console.error("Error when inserting into DB :", err);
                return res
                    .status(500)
                    .json({ error: "DB error: the key may already exist ?" });
            }

            res.json({ success: true, api_key });
        },
    );
});

// DELETE /api/admin/api-keys/:id - Deletes an API key
router.delete("/admin/api-keys/:id", isAuthenticated, (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid API key ID" });
    }

    db.run(`DELETE FROM apikey WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error("DB error (deletion) :", err);
            return res.status(500).json({ error: "DB error : " + err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "API key not found" });
        }

        res.json({ success: true, message: "API key successfully deleted" });
    });
});

module.exports = router;
