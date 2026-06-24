document.addEventListener('DOMContentLoaded', function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;

  var allProducts = [];
  var expandedId = null;

  var tbody = document.getElementById('produitsBody');
  var countEl = document.getElementById('produitsCount');
  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  var categoryFilter = document.getElementById('categoryFilter');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getProductImage(product) {
    if (!product.image) return AssigameUtils.placeholderImage();
    return product.image.split(',')[0].trim() || AssigameUtils.placeholderImage();
  }

  function parseImages(imageCsv) {
    if (!imageCsv) return [];
    return imageCsv.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function getVendorName(product) {
    var vendor = product.id_utilisateur;
    if (!vendor) return '—';
    return (vendor.prenom_utilisateur + ' ' + vendor.nom_utilisateur).trim() || '—';
  }

  function getCategoryName(product) {
    var category = product.idcategorie_produit;
    return category && category.nom_categorieproduit ? category.nom_categorieproduit : '—';
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

  function populateCategoryFilter(products) {
    if (!categoryFilter) return;
    var categories = {};
    products.forEach(function (product) {
      var category = product.idcategorie_produit;
      if (category && category.idcategorie_produit) {
        categories[category.idcategorie_produit] = category.nom_categorieproduit;
      }
    });
    Object.keys(categories).sort(function (a, b) {
      return categories[a].localeCompare(categories[b], 'fr');
    }).forEach(function (id) {
      var option = document.createElement('option');
      option.value = id;
      option.textContent = categories[id];
      categoryFilter.appendChild(option);
    });
  }

  function getFilteredProducts() {
    var query = (searchInput && searchInput.value || '').trim().toLowerCase();
    var status = statusFilter && statusFilter.value;
    var categoryId = categoryFilter && categoryFilter.value;

    return allProducts.filter(function (product) {
      var vendor = product.id_utilisateur || {};
      var vendorName = getVendorName(product).toLowerCase();
      var vendorEmail = (vendor.email_utilisateur || '').toLowerCase();
      var name = (product.nom_produit || '').toLowerCase();
      var ref = ('prd-' + product.id_produit).toLowerCase();
      var matchesSearch = !query ||
        name.indexOf(query) !== -1 ||
        ref.indexOf(query) !== -1 ||
        vendorName.indexOf(query) !== -1 ||
        vendorEmail.indexOf(query) !== -1;
      var matchesStatus = !status || product.statut === status;
      var matchesCategory = !categoryId ||
        (product.idcategorie_produit &&
          String(product.idcategorie_produit.idcategorie_produit) === categoryId);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  function renderDetailRow(product) {
    var vendor = product.id_utilisateur || {};
    var images = parseImages(product.image);
    var imagesHtml = images.length
      ? images.map(function (src) {
          return '<img src="' + escapeHtml(src) + '" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:8px;">';
        }).join('')
      : '<span style="color:var(--text-sub);">Aucune image</span>';

    return (
      '<tr class="product-detail-row" data-detail-for="' + product.id_produit + '">' +
        '<td colspan="8" style="background:var(--bg-subtle, #f8f6f3);padding:0;">' +
          '<div style="padding:1.25rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">' +
            '<div><span class="form-label">Référence</span><div>PRD-' + product.id_produit + '</div></div>' +
            '<div><span class="form-label">Vendeur</span><div>' + escapeHtml(getVendorName(product)) + '</div></div>' +
            '<div><span class="form-label">Email vendeur</span><div>' + escapeHtml(vendor.email_utilisateur || '—') + '</div></div>' +
            '<div><span class="form-label">Catégorie</span><div>' + escapeHtml(getCategoryName(product)) + '</div></div>' +
            '<div><span class="form-label">Prix</span><div>' + escapeHtml(AssigameUtils.formatPriceFCFA(product.prix)) + '</div></div>' +
            '<div><span class="form-label">Statut</span><div>' + escapeHtml(AssigameUtils.statutLabel(product.statut)) + '</div></div>' +
            '<div><span class="form-label">Date de publication</span><div>' + escapeHtml(formatDateTime(product.date_ajout)) + '</div></div>' +
            '<div style="grid-column:1 / -1;"><span class="form-label">Description</span><div style="white-space:pre-wrap;">' + escapeHtml(product.description || '—') + '</div></div>' +
            '<div style="grid-column:1 / -1;"><span class="form-label">Images</span><div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.35rem;">' + imagesHtml + '</div></div>' +
            '<div style="grid-column:1 / -1;"><a href="/fiche-produit.html?id=' + product.id_produit + '" class="btn btn-secondary" style="padding:6px 12px;" target="_blank" rel="noopener">Voir la fiche publique →</a></div>' +
          '</div>' +
        '</td>' +
      '</tr>'
    );
  }

  function renderTable() {
    if (!tbody) return;
    var products = getFilteredProducts();

    if (countEl) {
      countEl.textContent = products.length + ' produit' + (products.length > 1 ? 's' : '') + ' affiché' + (products.length > 1 ? 's' : '');
    }

    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="8">Aucun produit ne correspond à votre recherche.</td></tr>';
      return;
    }

    var rows = [];
    products.forEach(function (product) {
      var isOpen = expandedId === product.id_produit;
      rows.push(
        '<tr class="product-row" data-id="' + product.id_produit + '">' +
          '<td><img src="' + escapeHtml(getProductImage(product)) + '" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;"></td>' +
          '<td><strong>' + escapeHtml(product.nom_produit) + '</strong><br><span style="color:var(--text-sub);font-size:0.85rem;">PRD-' + product.id_produit + '</span></td>' +
          '<td>' + escapeHtml(getVendorName(product)) + '</td>' +
          '<td>' + escapeHtml(getCategoryName(product)) + '</td>' +
          '<td>' + escapeHtml(AssigameUtils.formatPriceFCFA(product.prix)) + '</td>' +
          '<td><span class="badge ' + AssigameUtils.statutBadgeClass(product.statut) + '">' + escapeHtml(AssigameUtils.statutLabel(product.statut)) + '</span></td>' +
          '<td>' + escapeHtml(AssigameUtils.formatDateFR(product.date_ajout)) + '</td>' +
          '<td class="text-right">' +
            '<button type="button" class="btn btn-secondary btn-toggle-detail" data-id="' + product.id_produit + '" style="padding:6px 12px;">' +
              '<i class="ph ' + (isOpen ? 'ph-caret-up' : 'ph-caret-down') + '"></i> ' + (isOpen ? 'Masquer' : 'Voir') +
            '</button>' +
          '</td>' +
        '</tr>'
      );
      if (isOpen) {
        rows.push(renderDetailRow(product));
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
      allProducts = await AssigameAPI.getAdminProduits();
      populateCategoryFilter(allProducts);
      renderTable();
      bindTableEvents();
    } catch (e) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="8">Erreur : ' + escapeHtml(e.message) + '</td></tr>';
      AssigameUtils.showToast(e.message || 'Erreur de chargement');
    }
  }

  if (searchInput) searchInput.addEventListener('input', function () { renderTable(); bindTableEvents(); });
  if (statusFilter) statusFilter.addEventListener('change', function () { renderTable(); bindTableEvents(); });
  if (categoryFilter) categoryFilter.addEventListener('change', function () { renderTable(); bindTableEvents(); });

  load();
});
