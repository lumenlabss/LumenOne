const sqlite = require("sqlite3").verbose();

// Database initialization
const db = new sqlite.Database("lumenone.db", (err) => {
  if (err) {
    console.error("Error while opening the database: " + err.message);
  } else {
    console.log("Connected to the database.");
  }
});

// Creating the `users` table with a `rank` column
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rank TEXT DEFAULT 'default' -- By default, the rank is 'default'
  )`,
  (err) => {
    if (err) {
      console.error("Error while creating the table: " + err.message);
    } else {
      console.log("Users table created or already exists.");

      // Inserting the admin user after the table is created
      db.run(
        `INSERT OR IGNORE INTO users (username, password, rank) VALUES (?, ?, ?)`,
        ["admin", "admin", "admin"],
        (err) => {
          if (err) {
            console.error(
              "Error while inserting the admin user: " + err.message
            );
          } else {
            console.log("Admin user created or already exists.");
          }
        }
      );

      db.run(
        `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
        ["user", "123"],
        (err) => {
          if (err) {
            console.error(
              "Error while inserting a default user: " + err.message
            );
          } else {
            console.log("Default user created or already exists.");
          }
        }
      );
    }
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS containers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    container_name TEXT NOT NULL,
    image TEXT NOT NULL,
    ports TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) {
      console.error("Error creating containers table:", err.message);
    } else {
      console.log("Containers table created or already exists.");
    }
  }
);

module.exports = db;
