// console.log("db.js loaded"); // To confirm that the page has been loaded correctly
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
    }
  }
);

// Website table
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

// Databases table (not using now)
db.run(
  `CREATE TABLE IF NOT EXISTS Databases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website_id INTEGER NOT NULL,
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

// statistic table (not using now)
db.run(
  `CREATE TABLE IF NOT EXISTS statistic (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT UNIQUE,
  visitors_month INTEGER DEFAULT 0,
  visitors_week INTEGER DEFAULT 0,
  visitors_day INTEGER DEFAULT 0,
  visitors_total INTEGER DEFAULT 0
  )`
);

// api key table
db.run(`
  CREATE TABLE IF NOT EXISTS apikey (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Backup table
db.run(`
  CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    website_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

// User-activity table
db.run(`
CREATE TABLE IF NOT EXISTS users_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity TEXT NOT NULL,
  browser TEXT,
  ip TEXT,
  os TEXT,
  activity_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

module.exports = db;
