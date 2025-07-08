document
  .getElementById("apiTokenForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Convert FormData into a simple object
    const data = {};
    formData.forEach((value, key) => {
      // For checked checkboxes, the value will be "1", otherwise nothing.
      data[key] = value === "1" ? 1 : 0;
    });

    // Mandatory description (simple check)
    if (!data.description || data.description.trim() === "") {
      alert("Description is required.");
      return;
    }

    // POST JSON to backend
    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // add an admin token if needed here
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        alert("Error: " + (err.error || "Unknown error"));
        return;
      }

      alert("API token created successfully !");
      form.reset();
      document.getElementById("apiModal").classList.add("hidden");
    } catch (err) {
      alert("Network error: " + err.message);
    }
  });
