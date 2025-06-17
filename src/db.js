console.log("db.js loaded"); // To confirm that the page has been loaded correctly
const sqlite = require("sqlite3").verbose();

// Database initialization
const db = new sqlite.Database("lumenone.db", (err) => {
  if (err) {
    console.error("Error while opening the database: " + err.message);
  } else {
    console.log("Connected to the database.");
  }
});

// Creating the `users` table with a `rank` column and `created_at`
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    database_use_tatal_disk INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'default', -- By default, the rank is 'default'
    created_at TEXT DEFAULT (datetime('now')) -- Auto timestamp at creation
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
  `CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    uuid TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    port INTEGER NOT NULL,
    disk_limit INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) {
      console.error("Error creating websites table:", err.message);
    } else {
      console.log("Websites table created or already exists.");
    }
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS Databases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    uuid TEXT NOT NULL,
    database_name TEXT NOT NULL,
    database_type TEXT NOT NULL,
    database_port INTEGER,
    database_ipv4 TEXT,
    database_username TEXT,
    database_password TEXT,
    disk_usage INTEGER
  )`
);

module.exports = db;
