const readline = require("readline");
const db = require("./src/db");
const bcrypt = require("bcrypt");

function createAdminPrompt() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Username admin : ", (username) => {
        rl.question("Admin password : ", (password) => {
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error("Error while hashing password:", err);
                    rl.close();
                    process.exit(1);
                }

                db.run(
                    `INSERT INTO users (username, password, rank) VALUES (?, ?, 'admin')`,
                    [username, hashedPassword],
                    (dbErr) => {
                        if (dbErr) {
                            console.error(
                                "Error while creating the admin:",
                                dbErr.message,
                            );
                        } else {
                            console.log(
                                `Admin account ‘${username}’ successfully created!`,
                            );
                        }
                        rl.close();
                        process.exit(0);
                    },
                );
            });
        });
    });
}
createAdminPrompt();
module.exports = { createAdminPrompt };
