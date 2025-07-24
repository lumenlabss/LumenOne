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
      location.reload();
    } else {
      console.error(
        "Error during key creation :",
        data.error || "Unknown error"
      );
    }
  } catch (err) {
    console.error("Network Error :", err.message);
  }
}

async function deleteApiKey(id) {
  if (!confirm("Do you really want to delete this API key?")) return;

  try {
    const response = await fetch(`/api/admin/api-keys/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      location.reload();
    } else {
      alert("Error : " + (data.error || "Unable to delete."));
    }
  } catch (err) {
    alert("Network Error : " + err.message);
  }
}
