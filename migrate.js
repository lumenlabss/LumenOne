const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lumenone.db');

db.serialize(() => {
    db.run("ALTER TABLE websites ADD COLUMN node_id INTEGER REFERENCES nodes(id);", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column node_id already exists.");
            } else {
                console.error("Error adding column:", err.message);
                process.exit(1);
            }
        } else {
            console.log("Column node_id added successfully.");
        }
    });
});
db.close();
