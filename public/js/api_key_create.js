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
      alert("API Create refresh your page to see the key");
    } else {
      alert("error : " + (data.error || "Unknown error"));
    }
  } catch (err) {
    alert("Network error : " + err.message);
  }
}
