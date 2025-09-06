function openModuleModal(module) {
  const modal = document.getElementById("module-modal");
  document.getElementById("modal-name").textContent = module.name;
  document.getElementById("modal-version").textContent =
    "Version " + module.version;
  document.getElementById("modal-description").textContent =
    module.description || "No description provided.";
  document.getElementById("modal-author").textContent =
    module.author || "Unknown author";
  document.getElementById("modal-icon").src =
    module.icon || "placeholder-icon.svg"; // Add a placeholder icon
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.querySelector(".glass-card").classList.remove("scale-95");
  }, 50);
}

function closeModuleModal() {
  const modal = document.getElementById("module-modal");
  modal.querySelector(".glass-card").classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300); // Match the transition duration
}

// Close modal when clicking outside of it
document.getElementById("module-modal").addEventListener("click", (e) => {
  if (e.target.id === "module-modal") {
    closeModuleModal();
  }
});
