async function createApiToken() {
  try {
    const response = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    if (data.success) {
      alert("Clé API générée : " + data.api_key);
    } else {
      alert("Erreur : " + (data.error || "Échec inconnu"));
    }
  } catch (err) {
    alert("Erreur réseau : " + err.message);
  }
}
