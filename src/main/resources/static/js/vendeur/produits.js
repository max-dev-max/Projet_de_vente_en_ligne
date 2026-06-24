document.addEventListener('DOMContentLoaded', function () {
  if (!VendorCommon.initVendorSession()) return;
  VendorCommon.initVendorSidebar('produits');

  var PAGE_SIZE = 8;
  var allProducts = [];
  var filteredProducts = [];
  var currentPage = 1;

  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  var categoryFilter = document.getElementById('categoryFilter');
  var tableBody = document.getElementById('productsTableBody');
  var tableCount = document.getElementById('productsTableCount');
  var pagination = document.getElementById('productsPagination');

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

  function getCategoryName(product) {
    var category = product.idcategorie_produit;
    return category && category.nom_categorieproduit ? category.nom_categorieproduit : '—';
  }

  function getStatusClass(statut) {
    var map = {
      ACTIF: 'actif',
      EN_ATTENTE: 'attente',
      REFUSE: 'refuse',
      SUSPENDU: 'suspendu'
    };
    return map[statut] || 'brouillon';
  }

  function formatProductDate(dateStr) {
    if (!dateStr) return '—';
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    var today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function populateCategoryFilter(categories) {
    if (!categoryFilter) return;
    categories.forEach(function (cat) {
      var option = document.createElement('option');
      option.value = String(cat.idcategorie_produit);
      option.textContent = cat.nom_categorieproduit;
      categoryFilter.appendChild(option);
    });
  }

  function applyFilters() {
    var query = (searchInput.value || '').trim().toLowerCase();
    var status = statusFilter.value;
    var categoryId = categoryFilter.value;

    filteredProducts = allProducts.filter(function (product) {
      var name = (product.nom_produit || '').toLowerCase();
      var ref = ('prd-' + product.id_produit).toLowerCase();
      var matchesSearch = !query || name.indexOf(query) !== -1 || ref.indexOf(query) !== -1;
      var matchesStatus = !status || product.statut === status;
      var productCategoryId = product.idcategorie_produit && product.idcategorie_produit.idcategorie_produit;
      var matchesCategory = !categoryId || String(productCategoryId) === categoryId;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    if (!tableBody) return;

    if (!filteredProducts.length) {
      tableBody.innerHTML =
        '<tr><td colspan="7" class="table-empty">' +
          'Aucun produit trouvé. <a href="/vendeur/produits-ajout.html">Publier un produit</a>' +
        '</td></tr>';
      tableCount.textContent = 'Affichage de 0 produit';
      pagination.innerHTML = '';
      return;
    }

    var total = filteredProducts.length;
    var start = (currentPage - 1) * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, total);
    var pageItems = filteredProducts.slice(start, end);

    tableBody.innerHTML = pageItems.map(function (product) {
      var viewLink = '/vendeur/detail-produit-vendeur.html?id=' + product.id_produit;

      return (
        '<tr>' +
          '<td><img class="product-img" src="' + escapeHtml(getProductImage(product)) + '" alt="' + escapeHtml(product.nom_produit) + '"></td>' +
          '<td>' +
            '<div class="product-name">' + escapeHtml(product.nom_produit || 'Sans nom') + '</div>' +
            '<div class="product-ref">Ref: PRD-' + escapeHtml(product.id_produit) + '</div>' +
          '</td>' +
          '<td>' + escapeHtml(getCategoryName(product)) + '</td>' +
          '<td><span class="product-price">' + escapeHtml(AssigameUtils.formatPriceFCFA(product.prix)) + '</span></td>' +
          '<td><span class="status-badge ' + getStatusClass(product.statut) + '">' + escapeHtml(AssigameUtils.statutLabel(product.statut)) + '</span></td>' +
          '<td><span class="product-date">' + escapeHtml(formatProductDate(product.date_ajout)) + '</span></td>' +
          '<td>' +
            '<div class="table-actions">' +
              '<a class="action-btn" href="' + viewLink + '" title="Voir le produit" aria-label="Voir le produit">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>' +
              '</a>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    tableCount.textContent = 'Affichage de ' + (start + 1) + ' à ' + end + ' sur ' + total + ' produit' + (total > 1 ? 's' : '');
    renderPagination(total);
  }

  function renderPagination(total) {
    var totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    pagination.innerHTML =
      '<button type="button" class="page-btn" id="prevPage" ' + (currentPage === 1 ? 'disabled' : '') + '>Précédent</button>' +
      '<button type="button" class="page-btn" id="nextPage" ' + (currentPage === totalPages ? 'disabled' : '') + '>Suivant</button>';

    document.getElementById('prevPage').addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage -= 1;
        renderTable();
      }
    });

    document.getElementById('nextPage').addEventListener('click', function () {
      if (currentPage < totalPages) {
        currentPage += 1;
        renderTable();
      }
    });
  }

  async function loadProducts() {
    try {
      var results = await Promise.all([
        AssigameAPI.getMesProduits(),
        AssigameAPI.getCategories()
      ]);

      allProducts = results[0] || [];
      populateCategoryFilter(results[1] || []);
      filteredProducts = allProducts.slice();
      renderTable();
    } catch (err) {
      tableBody.innerHTML =
        '<tr><td colspan="7" class="table-empty">Impossible de charger vos produits.</td></tr>';
      AssigameUtils.showToast(err.message || 'Erreur de chargement');
    }
  }

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);

  loadProducts();
});
