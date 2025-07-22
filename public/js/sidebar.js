document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.querySelector(
    "[data-drawer-toggle='separator-sidebar']"
  );
  const sidebar = document.getElementById("separator-sidebar");
  const body = document.body;

  let isSidebarOpen = false; // Track the sidebar state

  toggleButton.addEventListener("click", function () {
    isSidebarOpen = !isSidebarOpen; // Toggle the state
    sidebar.classList.toggle("-translate-x-full", !isSidebarOpen);
  });

  body.addEventListener("click", function (event) {
    if (
      isSidebarOpen &&
      !sidebar.contains(event.target) &&
      !toggleButton.contains(event.target)
    ) {
      isSidebarOpen = false; // Update the state
      sidebar.classList.add("-translate-x-full");
    }
  });
});
