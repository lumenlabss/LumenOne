const openBtn = document.getElementById("openDatabaseModal");
const closeBtn = document.getElementById("closeDatabaseModal");
const modal = document.getElementById("databaseModal");
const dbTypeSelect = document.getElementById("dbTypeSelect");
const usernameField = document.getElementById("usernameField");
const passwordField = document.getElementById("passwordField");

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
dbTypeSelect.addEventListener("change", () => {
  const type = dbTypeSelect.value;

  // SQLite3 does not require username and password so we hide those fields
  if (type === "sqlite3") {
    usernameField.classList.add("hidden");
    passwordField.classList.add("hidden");
  } else {
    usernameField.classList.remove("hidden");
    passwordField.classList.remove("hidden");
  }
});

// Trigger change on load
dbTypeSelect.dispatchEvent(new Event("change"));
