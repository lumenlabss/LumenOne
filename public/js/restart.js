function toggleMenu(uuid) {
    const menu = document.getElementById(`dropdownMenu-${uuid}`);
    if (menu.classList.contains("hidden")) {
        document.querySelectorAll('[id^="dropdownMenu-"]').forEach((el) => {
            el.classList.add("hidden");
        });
        menu.classList.remove("hidden");
    } else {
        menu.classList.add("hidden");
    }
}

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
            alert("Server communication error.");
            console.error(err);
        });
}
