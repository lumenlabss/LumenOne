const openBtn = document.getElementById("openDatabaseModal");
const closeBtn = document.getElementById("closeDatabaseModal");
const modal = document.getElementById("databaseModal");

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
