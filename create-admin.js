const readline = require("readline");
const db = require("./src/db");

// Check if an admin already exists
db.get(`SELECT * FROM users WHERE rank = 'admin' LIMIT 1`, (err, row) => {
  if (err) {
    process.exit(1);
  }

  if (row) {
    process.exit(0);
  } else {
    createAdminPrompt();
  }
});

function createAdminPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Username admin : ", (username) => {
    rl.question("Admin password : ", (password) => {
      db.run(
        `INSERT INTO users (username, password, rank) VALUES (?, ?, 'admin')`,
        [username, password],
        (err) => {
          if (err) {
            console.error("Error while creating the admin:", err.message);
          } else {
            console.log(`Admin account ‘${username}’ successfully created!`);
          }
          rl.close();
          process.exit(0);
        }
      );
    });
  });
}
