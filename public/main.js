const list = document.getElementById("list");
const form = document.getElementById("add-form");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("desc");

async function fetchDinos() {
  const res = await fetch("/api/dinosaurs");
  const items = await res.json();
  list.innerHTML = "";
  for (const it of items) {
    const li = document.createElement("li");
    li.textContent = `${it.name} — ${it.description || ""}`;
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "danger";
    del.onclick = async () => {
      await fetch(`/api/dinosaurs/${it.id}`, { method: "DELETE" });
      await fetchDinos();
    };
    li.appendChild(del);
    list.appendChild(li);
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const description = descInput.value.trim();
  if (!name) return;
  await fetch("/api/dinosaurs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, description })
  });
  nameInput.value = "";
  descInput.value = "";
  await fetchDinos();
};

fetchDinos();
