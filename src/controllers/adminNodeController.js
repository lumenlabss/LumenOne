const db = require("../db.js");

exports.getCreateNode = (req, res) => {
    res.render("web/admin/nodes/create.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
    });
};

exports.createNode = (req, res) => {
    const { name, ip } = req.body;

    if (!name || !ip) {
        return res.status(400).send("Name and IP are required.");
    }

    db.run(
        "INSERT INTO nodes (name, ip, status) VALUES (?, ?, ?)",
        [name, ip, "offline"],
        (err) => {
            if (err) {
                console.error("Error creating node:", err.message);
                return res.status(500).send("Error creating node.");
            }
            res.redirect("/web/admin/information");
        }
    );
};

exports.deleteNode = (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM nodes WHERE id = ?", [id], (err) => {
        if (err) {
            console.error("Error deleting node:", err.message);
            return res.status(500).send("Error deleting node.");
        }
        res.redirect("/web/admin/information");
    });
};

exports.getEditNode = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM nodes WHERE id = ?", [id], (err, node) => {
        if (err) {
            console.error("Error retrieving node:", err.message);
            return res.status(500).send("Error retrieving node.");
        }
        if (!node) {
            return res.status(404).send("Node not found.");
        }
        res.render("web/admin/nodes/edit.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            node: node,
        });
    });
};

exports.updateNode = (req, res) => {
    const { id } = req.params;
    const { name, ip, status } = req.body;

    if (!name || !ip) {
        return res.status(400).send("Name and IP are required.");
    }

    db.run(
        "UPDATE nodes SET name = ?, ip = ?, status = ? WHERE id = ?",
        [name, ip, status || "offline", id],
        (err) => {
            if (err) {
                console.error("Error updating node:", err.message);
                return res.status(500).send("Error updating node.");
            }
            res.redirect("/web/admin/information");
        }
    );
};
