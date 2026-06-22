// ============================================
// script.js — page "Gestion des Vendeurs"
// ============================================

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const tableBody = document.getElementById("vendorsTableBody");
const tableCount = document.getElementById("tableCount");
const btnExport = document.getElementById("btnExport");
const btnAdvancedFilters = document.getElementById("btnAdvancedFilters");
const pagination = document.getElementById("pagination");

const TOTAL_VENDORS = 0;

// Retire les accents pour que "sophie" trouve aussi "Sophie Martin"
function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ===== 1. Recherche en direct + filtres Type / Statut =====
function applyFilters() {
  const query = normalize(searchInput.value.trim());
  const typeValue = filterType.value;
  const statusValue = filterStatus.value;

  const rows = Array.from(tableBody.querySelectorAll("tr[data-name]"));
  let visibleCount = 0;

  rows.forEach(row => {
    const matchesSearch =
      query === "" ||
      normalize(row.dataset.name).includes(query) ||
      normalize(row.dataset.email).includes(query);

    const matchesType = typeValue === "all" || row.dataset.type === typeValue;
    const matchesStatus = statusValue === "all" || row.dataset.status === statusValue;

    const isVisible = matchesSearch && matchesType && matchesStatus;
    row.style.display = isVisible ? "" : "none";
    if (isVisible) visibleCount++;
  });

  updateNoResultsMessage(visibleCount);
  updateTableCount(visibleCount, rows.length);
}

function updateNoResultsMessage(visibleCount) {
  let noResultsRow = tableBody.querySelector(".no-results-row");

  if (visibleCount === 0) {
    if (!noResultsRow) {
      noResultsRow = document.createElement("tr");
      noResultsRow.className = "no-results-row";
      noResultsRow.innerHTML = `<td colspan="6">Aucun vendeur ne correspond à votre recherche.</td>`;
      tableBody.appendChild(noResultsRow);
    }
  } else if (noResultsRow) {
    noResultsRow.remove();
  }
}

function updateTableCount(visibleCount, totalRows) {
  if (visibleCount === totalRows) {
    tableCount.textContent = totalRows
      ? `Affichage de 1 à ${totalRows} sur ${totalRows} vendeur${totalRows > 1 ? "s" : ""}`
      : "Aucun vendeur à afficher";
  } else {
    tableCount.textContent = `${visibleCount} résultat${visibleCount > 1 ? "s" : ""} trouvé${visibleCount > 1 ? "s" : ""} sur cette page`;
  }
}

searchInput.addEventListener("input", applyFilters);
filterType.addEventListener("change", applyFilters);
filterStatus.addEventListener("change", applyFilters);

// ===== 2. Menu d'actions (clic sur les trois petits points) =====
let activeMenu = null;
let activeTrigger = null;

function closeMenu() {
  if (activeMenu) {
    activeMenu.remove();
    activeMenu = null;
    activeTrigger = null;
  }
}

function openMenu(button, row) {
  closeMenu();

  const isSuspended = row.dataset.status === "suspendu";

  const menu = document.createElement("div");
  menu.className = "row-menu";
  menu.innerHTML = `
    <button type="button" data-action="view">👁️ Voir le profil</button>
    <button type="button" data-action="toggle-status">${isSuspended ? "✅ Réactiver le compte" : "🚫 Suspendre le compte"}</button>
    <button type="button" data-action="delete" class="danger">🗑️ Supprimer le vendeur</button>
  `;

  document.body.appendChild(menu);

  // Positionnement sous le bouton cliqué, en évitant de sortir de l'écran
  const rect = button.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const top = Math.min(rect.bottom + 4, window.innerHeight - menuRect.height - 8);
  const left = Math.min(rect.right - menuRect.width, window.innerWidth - menuRect.width - 8);

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

  menu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => handleRowAction(btn.dataset.action, row));
  });

  activeMenu = menu;
  activeTrigger = button;
}

document.querySelectorAll(".row-action-btn").forEach(button => {
  button.addEventListener("click", (event) => {
    event.stopPropagation(); // empêche le clic de remonter jusqu'au listener "fermer" du document
    const row = button.closest("tr");

    if (activeTrigger === button) {
      closeMenu(); // re-clic sur le même bouton : on referme
    } else {
      openMenu(button, row);
    }
  });
});

document.addEventListener("click", closeMenu); // clic en dehors du menu → on ferme
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

function handleRowAction(action, row) {
  closeMenu();
  const name = row.querySelector(".vendor-name").textContent.trim();

  if (action === "view") {
    alert(`Redirection vers le profil de ${name}...`);
  }

  if (action === "toggle-status") {
    const isSuspended = row.dataset.status === "suspendu";
    const statusCell = row.querySelector(".status-pill");
    const nameEl = row.querySelector(".vendor-name");

    if (isSuspended) {
      row.dataset.status = "actif";
      row.classList.remove("row-suspended");
      nameEl.classList.remove("strikethrough");
      statusCell.className = "status-pill active";
      statusCell.innerHTML = `<span class="status-dot"></span>Actif`;
    } else {
      if (!confirm(`Suspendre le compte de ${name} ?`)) return;
      row.dataset.status = "suspendu";
      row.classList.add("row-suspended");
      nameEl.classList.add("strikethrough");
      statusCell.className = "status-pill suspended";
      statusCell.innerHTML = `<span class="status-dot"></span>Suspendu`;
    }

    applyFilters(); // réévalue l'affichage si un filtre de statut est actif
  }

  if (action === "delete") {
    if (!confirm(`Supprimer définitivement ${name} ? Cette action est irréversible.`)) return;
    row.remove();
    applyFilters();
  }
}

// ===== 3. Pagination (démo visuelle — à connecter à une vraie API) =====
pagination.addEventListener("click", (event) => {
  const button = event.target.closest(".page-btn");
  if (!button || button.disabled) return;

  const page = button.dataset.page;

  if (page === "prev" || page === "next") {
    alert("Cette démo n'affiche que 4 vendeurs. Branchez ce bouton à votre API pour charger la page suivante.");
    return;
  }

  pagination.querySelectorAll(".page-btn[data-page]").forEach(btn => {
    if (!isNaN(btn.dataset.page)) btn.classList.remove("active");
  });
  button.classList.add("active");
});

// ===== 4. Export CSV (bonus : exporte les lignes actuellement visibles) =====
btnExport.addEventListener("click", () => {
  const rows = Array.from(tableBody.querySelectorAll("tr[data-name]")).filter(
    row => row.style.display !== "none"
  );

  if (rows.length === 0) {
    alert("Aucun vendeur à exporter avec les filtres actuels.");
    return;
  }

  const header = ["Nom", "Email", "Type", "Produits", "Statut", "Date d'inscription"];
  const lines = [header.join(",")];

  rows.forEach(row => {
    const name = row.querySelector(".vendor-name").textContent.trim();
    const produits = row.children[2].textContent.trim();
    const date = row.children[4].textContent.trim();
    const line = [name, row.dataset.email, row.dataset.type, produits, row.dataset.status, date]
      .map(value => `"${value}"`)
      .join(",");
    lines.push(line);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "vendeurs.csv";
  link.click();

  URL.revokeObjectURL(url);
});

// ===== 5. Filtres avancés (placeholder) =====
btnAdvancedFilters.addEventListener("click", () => {
  alert("Panneau de filtres avancés à venir (date d'inscription, chiffre d'affaires, nombre de produits...).");
});

applyFilters();