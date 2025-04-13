const sqlite = require("sqlite3").verbose();

// Initialisation de la base de données
const db = new sqlite.Database("rubixone.db", (err) => {
  if (err) {
    console.error(
      "Erreur lors de l'ouverture de la base de données : " + err.message
    );
  } else {
    console.log("Connecté à la base de données.");
  }
});

// Création de la table `users` avec une colonne `rank`
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rank TEXT DEFAULT 'default' -- Par défaut, le rang est 'default'
  )`,
  (err) => {
    if (err) {
      console.error("Erreur lors de la création de la table : " + err.message);
    } else {
      console.log("Table des utilisateurs créée ou déjà existante.");

      // Insertion de l'utilisateur admin après la création de la table
      db.run(
        `INSERT OR IGNORE INTO users (username, password, rank) VALUES (?, ?, ?)`,
        ["admin", "admin", "admin"],
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de l'insertion de l'utilisateur admin : " +
                err.message
            );
          } else {
            console.log("Utilisateur admin créé ou déjà existant.");
          }
        }
      );

      db.run(
        `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
        ["user", "123"],
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de l'insertion d'un utilisateur par défaut : " +
                err.message
            );
          } else {
            console.log("Utilisateur par défaut créé ou déjà existant.");
          }
        }
      );
    }
  }
);

module.exports = db;
