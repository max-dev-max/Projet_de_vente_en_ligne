// ============================================
// dashboard.js — logique du dashboard vendeur
// ============================================

const SCALE_MAX = 150;
const BAR_AREA_HEIGHT = 220;

const datasets = {
  '7': [],
  '30': []
};

const tooltip = document.createElement('div');
tooltip.className = 'chart-tooltip';
document.body.appendChild(tooltip);

function showTooltip(event) {
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  tooltip.textContent = `${bar.dataset.label} : ${bar.dataset.value} annonces`;
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 8}px`;
  tooltip.classList.add('visible');
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

function renderChart(data) {
  const chartArea = document.getElementById('chartArea');
  if (!chartArea) return;
  chartArea.innerHTML = '';
  if (!data || !data.length) return;

  const highestValue = Math.max(...data.map(d => d.value));
  const scale = highestValue > SCALE_MAX ? highestValue * 1.1 : SCALE_MAX;

  data.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'bar-wrapper';

    const bar = document.createElement('div');
    bar.className = 'bar' + (item.value === highestValue ? ' highlight' : '');
    bar.style.height = `${(item.value / scale) * BAR_AREA_HEIGHT}px`;
    bar.dataset.value = item.value;
    bar.dataset.label = item.label;
    bar.addEventListener('mouseenter', showTooltip);
    bar.addEventListener('mouseleave', hideTooltip);

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = item.label;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    chartArea.appendChild(wrapper);
  });
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function setBadge(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function renderActivities(products) {
  const list = document.getElementById('activityList');
  if (!list) return;

  if (!products.length) {
    list.innerHTML = '<li class="activity-empty">Aucune activité pour le moment.</li>';
    return;
  }

  const statusLabels = {
    ACTIF: 'Publié',
    EN_ATTENTE: 'En attente',
    REFUSE: 'Refusé',
    SUSPENDU: 'Suspendu'
  };

  list.innerHTML = products.slice(0, 5).map(function (product) {
    const status = statusLabels[product.statut] || product.statut || '—';
    const dateLabel = formatActivityDate(product.date_ajout);
    const timeLabel = formatActivityTime(product.date_ajout);
    return (
      '<li class="activity-item">' +
        '<span class="activity-dot"></span>' +
        '<div class="activity-content">' +
          '<div class="activity-row">' +
            '<p class="activity-title">' + (product.nom_produit || 'Produit') + '</p>' +
            '<p class="activity-date">' + dateLabel + '</p>' +
          '</div>' +
          '<div class="activity-row">' +
            '<p class="activity-meta">' + status + '</p>' +
            '<p class="activity-time">' + timeLabel + '</p>' +
          '</div>' +
        '</div>' +
      '</li>'
    );
  }).join('');
}

function formatActivityDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatActivityTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function buildChartData(products, days) {
  const now = new Date();
  const buckets = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    buckets.push({
      key: key,
      label: days <= 7
        ? date.toLocaleDateString('fr-FR', { weekday: 'short' })
        : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      value: 0
    });
  }

  products.forEach(function (product) {
    if (!product.date_ajout) return;
    const key = String(product.date_ajout).slice(0, 10);
    const bucket = buckets.find(function (item) { return item.key === key; });
    if (bucket) bucket.value += 1;
  });

  return buckets.map(function (item) {
    return { label: item.label, value: item.value };
  });
}

async function loadDashboardData() {
  try {
    const mine = await AssigameAPI.getMesProduits();

    const published = mine.filter(function (p) { return p.statut === 'ACTIF'; }).length;
    const pending = mine.filter(function (p) { return p.statut === 'EN_ATTENTE'; }).length;
    const refused = mine.filter(function (p) { return p.statut === 'REFUSE'; }).length;
    const suspended = mine.filter(function (p) { return p.statut === 'SUSPENDU'; }).length;

    setStatValue('statPublished', published);
    setStatValue('statPending', pending);
    setStatValue('statRefused', refused);
    setStatValue('statSuspended', suspended);

    setBadge('statPublishedBadge', published ? '+' + published : '');
    setBadge('statPendingBadge', pending ? pending + ' en cours' : '');
    setBadge('statRefusedBadge', refused ? refused + ' refus' : '');

    datasets['7'] = buildChartData(mine, 7);
    datasets['30'] = buildChartData(mine, 30);
    renderChart(datasets['7']);
    renderActivities(mine);
  } catch (err) {
    AssigameUtils.showToast(err.message || 'Impossible de charger le dashboard.');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (!VendorCommon.initVendorSession()) return;
  VendorCommon.initVendorSidebar('dashboard');

  const periodSelect = document.getElementById('periodSelect');
  if (periodSelect) {
    periodSelect.addEventListener('change', function (event) {
      renderChart(datasets[event.target.value] || []);
    });
  }

  loadDashboardData();
});
