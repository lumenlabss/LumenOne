const openBtn = document.getElementById("openDatabaseModal");
const closeBtn = document.getElementById("closeDatabaseModal");
const modal = document.getElementById("databaseModal");
const dbTypeSelect = document.getElementById("dbTypeSelect");
const usernameField = document.getElementById("usernameField");
const passwordField = document.getElementById("passwordField");
const portField = document.getElementById("portField");
const ipv4Field = document.getElementById("ipv4Field");

openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Close modal if clicked outside box
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

// Database Type Selection Modal

function toggleFields() {
    const isMySQL = dbTypeSelect.value.toLowerCase() === "mysql";
    usernameField.classList.toggle("hidden", !isMySQL);
    passwordField.classList.toggle("hidden", !isMySQL);
    portField.classList.toggle("hidden", !isMySQL);
    ipv4Field.classList.toggle("hidden", !isMySQL);
}

dbTypeSelect.addEventListener("change", toggleFields);
toggleFields(); // appel initial au cas où

document
    .getElementById("createDatabaseBtn")
    .addEventListener("click", async () => {
        const name = document.getElementById("DatabaseName").value.trim();
        const type = dbTypeSelect.value;
        const username =
            usernameField.querySelector("input").value.trim() || null;
        const password =
            passwordField.querySelector("input").value.trim() || null;
        const portInput = document.getElementById("DatabasePort");
        const ipv4Input = document.getElementById("DatabaseIPv4");

        const port =
            portInput && portInput.value.trim() !== ""
                ? parseInt(portInput.value)
                : null;
        const ipv4 =
            ipv4Input && ipv4Input.value.trim() !== ""
                ? ipv4Input.value.trim()
                : null;

        if (!name) {
            alert("Please enter a database name.");
            return;
        }

        // Optionnel : validations supplémentaires sur port, ipv4, etc.

        try {
            const res = await fetch("/web/database/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    type,
                    username,
                    password,
                    port,
                    ipv4,
                }),
            });

            const data = await res.json();

            if (data.success) {
                // refresh la page pour voir la nouvelle DB dans la liste
                location.reload();
            } else {
                alert(data.error || "Failed to create database.");
            }
        } catch (err) {
            alert("An error occurred while creating the database.");
            console.error(err);
        }
    });
