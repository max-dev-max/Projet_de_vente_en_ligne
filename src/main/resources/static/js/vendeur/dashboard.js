// ============================================
// dashboard.js — logique du dashboard vendeur
// ============================================

// ===== 1. Données du graphique =====
// L'échelle est fixe (0 à 150), comme les graduations affichées sur l'axe.
const SCALE_MAX = 150;
const BAR_AREA_HEIGHT = 220; // doit correspondre à la hauteur CSS de .chart-area

const datasets = {
  "7": [],
  "30": []
};

// ===== 2. Création de l'info-bulle (un seul élément réutilisé) =====
const tooltip = document.createElement("div");
tooltip.className = "chart-tooltip";
document.body.appendChild(tooltip);

function showTooltip(event) {
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  tooltip.textContent = `${bar.dataset.label} : ${bar.dataset.value} annonces`;
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 8}px`;
  tooltip.classList.add("visible");
}

function hideTooltip() {
  tooltip.classList.remove("visible");
}

// ===== 3. Génération des barres =====
function renderChart(data) {
  const chartArea = document.getElementById("chartArea");
  if (!chartArea) return;
  chartArea.innerHTML = "";
  if (!data || !data.length) return;

  const highestValue = Math.max(...data.map(d => d.value));
  const scale = highestValue > SCALE_MAX ? highestValue * 1.1 : SCALE_MAX;

  data.forEach(item => {
    const wrapper = document.createElement("div");
    wrapper.className = "bar-wrapper";

    const bar = document.createElement("div");
    bar.className = "bar" + (item.value === highestValue ? " highlight" : "");
    bar.style.height = `${(item.value / scale) * BAR_AREA_HEIGHT}px`;
    bar.dataset.value = item.value;
    bar.dataset.label = item.label;
    bar.addEventListener("mouseenter", showTooltip);
    bar.addEventListener("mouseleave", hideTooltip);

    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = item.label;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    chartArea.appendChild(wrapper);
  });
}

// ===== 4. Filtre de période =====
const periodSelect = document.getElementById("periodSelect");
periodSelect.addEventListener("change", (event) => {
  renderChart(datasets[event.target.value]);
});

// ===== 5. Navigation latérale (changer l'élément actif) =====
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach(item => {
  item.addEventListener("click", () => {
    document.querySelector(".nav-item.active")?.classList.remove("active");
    item.classList.add("active");
  });
});

// ===== 6. Initialisation au chargement de la page =====
renderChart(datasets["7"]);