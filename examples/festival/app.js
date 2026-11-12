const day = document.querySelector("#day");
const performers = [...document.querySelectorAll("[data-day]")];
day.addEventListener("change", () => {
  let count = 0;
  for (const item of performers) {
    item.hidden = day.value !== "all" && item.dataset.day !== day.value;
    if (!item.hidden) count++;
  }
  document.querySelector("#result-count").textContent = `${count} performances`;
});
const save = document.querySelector("#save");
const status = document.querySelector("#save-status");
function showSaved(saved) {
  save.textContent = saved ? "Remove saved festival" : "Save this festival";
  save.setAttribute("aria-pressed", String(saved));
  status.textContent = saved
    ? "Saved in this browser."
    : "Save it in this browser for later.";
}
let saved = false;
try {
  saved = localStorage.getItem("common-frequency-saved") === "yes";
} catch {
  /* Storage may be unavailable; clicking reports the limitation. */
}
showSaved(saved);
save.addEventListener("click", () => {
  try {
    localStorage.setItem("common-frequency-saved", saved ? "no" : "yes");
    saved = !saved;
    showSaved(saved);
  } catch {
    status.textContent =
      "This browser cannot save the festival. Bookmark the page instead.";
  }
});
