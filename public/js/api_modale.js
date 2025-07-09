document
  .getElementById("apiTokenForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const data = {
      description: formData.get("description"),
      view_website: formData.get("view_website") ? 1 : 0,
      delete_website: formData.get("delete_website") ? 1 : 0,
      create_website: formData.get("create_website") ? 1 : 0,
      view_users: formData.get("view_users") ? 1 : 0,
      modify_users: formData.get("modify_users") ? 1 : 0,
      delete_users: formData.get("delete_users") ? 1 : 0,
      create_users: formData.get("create_users") ? 1 : 0,
    };

    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("API Key créée : " + result.api_key);
        form.reset();
        document.getElementById("apiModal").classList.add("hidden");
      } else {
        alert("Erreur : " + result.error);
      }
    } catch (error) {
      alert("Erreur inattendue : " + error.message);
    }
  });
