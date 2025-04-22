function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const menu = document.getElementById("dropdownMenu");
  const button = event.target.closest("button");
  if (!event.target.closest(".relative") && !button) {
    menu.classList.add("hidden");
  }
});

function restartServer(uuid) {
  fetch(`/web/restart/${uuid}`, {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Serveur redémarré !");
      } else {
        alert("Erreur : " + (data.error || "Inconnue"));
      }
    })
    .catch((err) => {
      alert("Erreur de communication avec le serveur.");
      console.error(err);
    });
}
