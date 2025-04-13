document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.querySelector(
    "[data-drawer-toggle='separator-sidebar']"
  );
  const sidebar = document.getElementById("separator-sidebar");
  const body = document.body;

  toggleButton.addEventListener("click", function () {
    sidebar.classList.toggle("-translate-x-full");
  });

  body.addEventListener("click", function (event) {
    if (
      !sidebar.contains(event.target) &&
      !toggleButton.contains(event.target)
    ) {
      sidebar.classList.add("-translate-x-full");
    }
  });
});
