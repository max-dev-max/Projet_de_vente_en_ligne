/* Catalogue public — chargement API + interactions UI */
document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var grid = document.getElementById('productsGrid');
  var resultsCount = document.getElementById('resultsCount');
  var categoryContainer = document.querySelector('.filter-group[data-filter="category"]');
  var productCards = [];
  var categories = [];

  function renderProductCard(produit) {
    var catName = produit.idcategorie_produit && produit.idcategorie_produit.nom_categorieproduit
      ? produit.idcategorie_produit.nom_categorieproduit : 'Général';
    var img = (produit.image ? produit.image.split(',')[0].trim() : '') || AssigameUtils.placeholderImage();
    var price = AssigameUtils.formatPriceFCFA(produit.prix);
    var id = produit.id_produit;

    return (
      '<a class="product-card" href="/fiche-produit.html?id=' + id + '" data-category="' + catName + '" data-price="' + produit.prix + '">' +
        '<div class="product-media">' +
          '<span class="product-tag">' + catName + '</span>' +
          '<button type="button" class="product-fav" aria-label="Favoris"><i class="ph ph-heart"></i></button>' +
          '<img src="' + img + '" alt="' + (produit.nom_produit || 'Produit') + '" loading="lazy">' +
        '</div>' +
        '<div class="product-body">' +
          '<p class="product-title">' + (produit.nom_produit || 'Sans nom') + '</p>' +
          '<p class="product-desc">' + (produit.description || '') + '</p>' +
          '<div class="product-meta"><i class="ph-fill ph-star"></i> Nouveau</div>' +
          '<div class="product-footer">' +
            '<span class="product-price">' + price + '</span>' +
            '<button type="button" class="cart-btn" aria-label="Ajouter au panier"><i class="ph ph-shopping-cart"></i></button>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function bindInteractions() {
    productCards = document.querySelectorAll('.product-card');

    document.querySelectorAll('.product-fav').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('is-fav');
      });
    });

    document.querySelectorAll('.cart-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var card = btn.closest('.product-card');
        var titleEl = card ? card.querySelector('.product-title') : null;
        toast((titleEl ? titleEl.textContent.trim() : 'Produit') + ' ajouté au panier');
      });
    });
  }

  function updateResultsCount(visible, total) {
    if (resultsCount) {
      resultsCount.textContent = 'Affichage de ' + visible + ' sur ' + total + ' produit' + (total > 1 ? 's' : '');
    }
  }

  async function loadCatalogue() {
    if (!grid) return;
    grid.innerHTML = '<p class="catalog-loading">Chargement du catalogue…</p>';
    try {
      var produits = await AssigameAPI.getProduits();
      if (!produits || !produits.length) {
        grid.innerHTML = '<div class="catalog-empty"><h3>Aucun produit disponible</h3><p>Revenez plus tard ou devenez vendeur.</p></div>';
        updateResultsCount(0, 0);
        return;
      }
      grid.innerHTML = produits.map(renderProductCard).join('');
      grid.querySelectorAll('.product-card').forEach(function (card, index) {
        card.classList.add('card-enter');
        card.style.animationDelay = (0.1 + index * 0.07) + 's';
      });
      updateResultsCount(produits.length, produits.length);
      bindInteractions();
      setupFilters(produits);
    } catch (err) {
      grid.innerHTML = '<div class="catalog-error"><p>Impossible de charger les produits.</p><button type="button" class="btn btn-primary" id="retryCatalogue">Réessayer</button></div>';
      var retry = document.getElementById('retryCatalogue');
      if (retry) retry.addEventListener('click', loadCatalogue);
      toast(err.message || 'Erreur de chargement');
    }
  }

  function setupFilters(produits) {
    var counts = {};
    produits.forEach(function (p) {
      var name = p.idcategorie_produit && p.idcategorie_produit.nom_categorieproduit
        ? p.idcategorie_produit.nom_categorieproduit : 'Général';
      counts[name] = (counts[name] || 0) + 1;
    });

    if (categoryContainer) {
      var html = '<h3>Catégories</h3>';
      Object.keys(counts).forEach(function (name) {
        html += '<label class="checkbox-row"><span class="cb-label"><input type="checkbox" value="' + name + '" checked> ' + name + '</span><span class="cb-count">' + counts[name] + '</span></label>';
      });
      categoryContainer.innerHTML = html;
    }

    var categoryChecks = document.querySelectorAll('.filter-group[data-filter="category"] input[type="checkbox"]');
    function applyCategoryFilter() {
      var checked = [];
      categoryChecks.forEach(function (cb) { if (cb.checked) checked.push(cb.value); });
      var visible = 0;
      productCards.forEach(function (card) {
        var tag = card.getAttribute('data-category') || '';
        var show = !checked.length || checked.indexOf(tag) !== -1;
        card.classList.toggle('hidden-by-filter', !show);
        if (show) visible++;
      });
      updateResultsCount(visible, produits.length);
    }
    categoryChecks.forEach(function (cb) { cb.addEventListener('change', applyCategoryFilter); });

    var resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        categoryChecks.forEach(function (cb) { cb.checked = true; });
        document.getElementById('priceMin').value = '';
        document.getElementById('priceMax').value = '';
        productCards.forEach(function (card) {
          card.classList.remove('hidden-by-filter');
          card.style.display = '';
        });
        updateResultsCount(productCards.length, produits.length);
        toast('Filtres réinitialisés');
      });
    }

    var applyPriceBtn = document.getElementById('applyPrice');
    if (applyPriceBtn) {
      applyPriceBtn.addEventListener('click', function () {
        var min = parseInt((document.getElementById('priceMin').value || '').replace(/\D/g, ''), 10);
        var max = parseInt((document.getElementById('priceMax').value || '').replace(/\D/g, ''), 10);
        var visible = 0;
        productCards.forEach(function (card) {
          if (card.classList.contains('hidden-by-filter')) return;
          var price = parseFloat(card.getAttribute('data-price') || '0');
          var show = true;
          if (!isNaN(min) && price < min) show = false;
          if (!isNaN(max) && price > max) show = false;
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        updateResultsCount(visible, produits.length);
        toast('Filtre de prix appliqué');
      });
    }
  }

  /* Tri */
  var sortControl = document.getElementById('sortControl');
  var sortOptions = document.getElementById('sortOptions');
  var sortLabel = document.getElementById('sortLabel');
  if (sortControl && sortOptions) {
    sortControl.addEventListener('click', function (e) {
      e.stopPropagation();
      sortOptions.classList.toggle('show');
      sortControl.classList.toggle('open');
    });
    sortOptions.querySelectorAll('.sort-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        sortOptions.querySelectorAll('.sort-option').forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        if (sortLabel) sortLabel.textContent = opt.textContent.trim();
        sortOptions.classList.remove('show');
        sortControl.classList.remove('open');
      });
    });
    document.addEventListener('click', function () {
      sortOptions.classList.remove('show');
      sortControl.classList.remove('open');
    });
  }

  await loadCatalogue();
});
