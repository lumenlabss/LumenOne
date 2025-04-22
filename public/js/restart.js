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
