document.addEventListener('DOMContentLoaded', function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;

  var allVendors = [];
  var expandedId = null;

  var tbody = document.getElementById('vendeursBody');
  var countEl = document.getElementById('vendeursCount');
  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  var typeFilter = document.getElementById('typeFilter');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getFullName(vendor) {
    return ((vendor.prenom || '') + ' ' + (vendor.nom || '')).trim() || '—';
  }

  function formatSexe(sexe) {
    if (sexe === 'M') return 'Homme';
    if (sexe === 'F') return 'Femme';
    return sexe || '—';
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getTypeLabel(vendor) {
    return vendor.roleLibelle || vendor.role || '—';
  }

  function getFilteredVendors() {
    var query = (searchInput && searchInput.value || '').trim().toLowerCase();
    var status = statusFilter && statusFilter.value;
    var type = typeFilter && typeFilter.value;

    return allVendors.filter(function (vendor) {
      var name = getFullName(vendor).toLowerCase();
      var email = (vendor.email || '').toLowerCase();
      var phone = (vendor.telephone || '').toLowerCase();
      var ref = ('vnd-' + vendor.id).toLowerCase();
      var matchesSearch = !query ||
        name.indexOf(query) !== -1 ||
        email.indexOf(query) !== -1 ||
        phone.indexOf(query) !== -1 ||
        ref.indexOf(query) !== -1;
      var matchesStatus = !status || vendor.statut === status;
      var matchesType = !type || vendor.role === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  function renderDetailRow(vendor) {
    return (
      '<tr class="vendor-detail-row" data-detail-for="' + vendor.id + '">' +
        '<td colspan="8" style="background:var(--bg-subtle, #f8f6f3);padding:0;">' +
          '<div style="padding:1.25rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">' +
            '<div><span class="form-label">Référence</span><div>VND-' + vendor.id + '</div></div>' +
            '<div><span class="form-label">Nom complet</span><div>' + escapeHtml(getFullName(vendor)) + '</div></div>' +
            '<div><span class="form-label">Email</span><div>' + escapeHtml(vendor.email || '—') + '</div></div>' +
            '<div><span class="form-label">Téléphone</span><div>' + escapeHtml(vendor.telephone || '—') + '</div></div>' +
            '<div><span class="form-label">Sexe</span><div>' + escapeHtml(formatSexe(vendor.sexe)) + '</div></div>' +
            '<div><span class="form-label">Type de vendeur</span><div>' + escapeHtml(getTypeLabel(vendor)) + '</div></div>' +
            '<div><span class="form-label">Statut du compte</span><div>' + escapeHtml(AssigameUtils.statutLabel(vendor.statut)) + '</div></div>' +
            '<div><span class="form-label">Nombre de produits</span><div>' + (vendor.nombreProduits != null ? vendor.nombreProduits : 0) + '</div></div>' +
            '<div><span class="form-label">Date de création</span><div>' + escapeHtml(formatDateTime(vendor.dateCreation)) + '</div></div>' +
            '<div style="grid-column:1 / -1;"><span class="form-label">Description du type</span><div>' + escapeHtml(vendor.roleDescription || '—') + '</div></div>' +
          '</div>' +
        '</td>' +
      '</tr>'
    );
  }

  function renderTable() {
    if (!tbody) return;
    var vendors = getFilteredVendors();

    if (countEl) {
      countEl.textContent = vendors.length + ' vendeur' + (vendors.length > 1 ? 's' : '') + ' affiché' + (vendors.length > 1 ? 's' : '');
    }

    if (!vendors.length) {
      tbody.innerHTML = '<tr><td colspan="8">Aucun vendeur ne correspond à votre recherche.</td></tr>';
      return;
    }

    var rows = [];
    vendors.forEach(function (vendor) {
      var isOpen = expandedId === vendor.id;
      rows.push(
        '<tr class="vendor-row" data-id="' + vendor.id + '">' +
          '<td><strong>' + escapeHtml(getFullName(vendor)) + '</strong><br><span style="color:var(--text-sub);font-size:0.85rem;">VND-' + vendor.id + '</span></td>' +
          '<td>' + escapeHtml(getTypeLabel(vendor)) + '</td>' +
          '<td>' + escapeHtml(vendor.email || '—') + '</td>' +
          '<td>' + escapeHtml(vendor.telephone || '—') + '</td>' +
          '<td>' + (vendor.nombreProduits != null ? vendor.nombreProduits : 0) + '</td>' +
          '<td><span class="badge ' + AssigameUtils.statutBadgeClass(vendor.statut) + '">' + escapeHtml(AssigameUtils.statutLabel(vendor.statut)) + '</span></td>' +
          '<td>' + escapeHtml(AssigameUtils.formatDateFR(vendor.dateCreation)) + '</td>' +
          '<td class="text-right">' +
            '<button type="button" class="btn btn-secondary btn-toggle-detail" data-id="' + vendor.id + '" style="padding:6px 12px;">' +
              '<i class="ph ' + (isOpen ? 'ph-caret-up' : 'ph-caret-down') + '"></i> ' + (isOpen ? 'Masquer' : 'Voir') +
            '</button>' +
          '</td>' +
        '</tr>'
      );
      if (isOpen) {
        rows.push(renderDetailRow(vendor));
      }
    });

    tbody.innerHTML = rows.join('');
  }

  function bindTableEvents() {
    if (!tbody) return;
    tbody.querySelectorAll('.btn-toggle-detail').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = Number(btn.getAttribute('data-id'));
        expandedId = expandedId === id ? null : id;
        renderTable();
        bindTableEvents();
      });
    });
  }

  async function load() {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8">Chargement…</td></tr>';
    try {
      allVendors = await AssigameAPI.getAdminVendeurs();
      renderTable();
      bindTableEvents();
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="8">Erreur : ' + escapeHtml(e.message) + '</td></tr>';
      AssigameUtils.showToast(e.message || 'Erreur de chargement');
    }
  }

  if (searchInput) searchInput.addEventListener('input', function () { renderTable(); bindTableEvents(); });
  if (statusFilter) statusFilter.addEventListener('change', function () { renderTable(); bindTableEvents(); });
  if (typeFilter) typeFilter.addEventListener('change', function () { renderTable(); bindTableEvents(); });

  load();
});
