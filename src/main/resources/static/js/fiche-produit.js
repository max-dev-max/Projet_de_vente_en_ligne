/* Fiche produit — chargement API + interactions */
document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var id = AssigameUtils.getQueryParam('id');
  var mainImage = document.getElementById('mainImage');
  var titleEl = document.querySelector('.product-title');
  var priceNow = document.querySelector('.price-now');
  var priceOld = document.querySelector('.price-old');
  var productRef = document.querySelector('.product-ref');
  var productSubtitle = document.querySelector('.product-subtitle');
  var descText = document.querySelector('.desc-text');
  var breadcrumbCurrent = document.querySelector('.breadcrumb .current');
  var similarGrid = document.getElementById('similarGrid');
  var thumbRow = document.querySelector('.thumb-row');
  var sellerNameEl = document.getElementById('sellerName');
  var sellerAvatarEl = document.querySelector('.seller-avatar');
  var contactSellerBtn = document.getElementById('contactSellerBtn');
  var contactSellerLabel = document.getElementById('contactSellerLabel');
  var currentSeller = null;

  function formatSellerName(vendeur) {
    if (!vendeur) return 'Vendeur';
    var full = ((vendeur.prenom_utilisateur || '') + ' ' + (vendeur.nom_utilisateur || '')).trim();
    return full || 'Vendeur';
  }

  function formatSellerInitials(vendeur) {
    if (!vendeur) return 'V';
    var prenom = (vendeur.prenom_utilisateur || '').charAt(0);
    var nom = (vendeur.nom_utilisateur || '').charAt(0);
    var initials = (prenom + nom).toUpperCase();
    return initials || 'V';
  }

  function formatSellerPhone(vendeur) {
    return vendeur && vendeur.telephone_utilisateur
      ? String(vendeur.telephone_utilisateur).trim()
      : '';
  }

  function updateContactSellerButton(vendeur) {
    if (!contactSellerBtn || !contactSellerLabel) return;
    var name = formatSellerName(vendeur);
    var phone = formatSellerPhone(vendeur);
    contactSellerLabel.textContent = phone
      ? 'Contacter ' + name + ' · ' + phone
      : 'Contacter ' + name;
    if (phone) {
      contactSellerBtn.href = 'tel:' + phone.replace(/\s/g, '');
      contactSellerBtn.setAttribute('aria-label', 'Contacter ' + name + ' au ' + phone);
    } else {
      contactSellerBtn.href = '#';
      contactSellerBtn.setAttribute('aria-label', 'Contacter ' + name);
    }
  }

  function parseImages(imageCsv) {
    if (!imageCsv) return [];
    return imageCsv.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
  }

  function renderGallery(images, altText) {
    if (!thumbRow) return;
    if (!images.length) return;
    thumbRow.innerHTML = images.map(function (src, index) {
      return '<button type="button" class="thumb' + (index === 0 ? ' active' : '') +
        '" data-full="' + src + '"><img src="' + src + '" alt="' + (altText || '') + ' ' + (index + 1) + '"></button>';
    }).join('');
  }

  function bindGallery() {
    var thumbs = document.querySelectorAll('.thumb:not(.placeholder)');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var fullSrc = thumb.getAttribute('data-full');
        if (!mainImage || !fullSrc) return;
        mainImage.src = fullSrc;
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });
  }

  function bindActions() {
    if (contactSellerBtn) {
      contactSellerBtn.addEventListener('click', function (event) {
        if (!formatSellerPhone(currentSeller)) {
          event.preventDefault();
          toast('Numéro du vendeur indisponible');
        }
      });
    }
    var favLink = document.getElementById('favLink');
    if (favLink) {
      favLink.addEventListener('click', function () {
        favLink.classList.toggle('is-fav');
        var label = favLink.querySelector('.fav-label');
        if (label) label.textContent = favLink.classList.contains('is-fav') ? 'Ajouté aux favoris' : 'Ajouter aux favoris';
      });
    }
    document.querySelectorAll('.share-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(window.location.href).then(function () {
          toast('Lien copié !');
        }).catch(function () { toast('Lien copié !'); });
      });
    });
  }

  async function loadProduit() {
    if (!id) {
      toast('Produit introuvable');
      return;
    }
    try {
      var produit = await AssigameAPI.getProduit(id);
      if (titleEl) titleEl.textContent = produit.nom_produit || 'Produit';
      if (productRef) productRef.textContent = 'Réf : ' + produit.id_produit;
      if (priceNow) priceNow.textContent = AssigameUtils.formatPriceFCFA(produit.prix);
      if (priceOld) priceOld.style.display = 'none';

      var catName = produit.idcategorie_produit && produit.idcategorie_produit.nom_categorieproduit
        ? produit.idcategorie_produit.nom_categorieproduit : 'Non classé';
      if (productSubtitle) productSubtitle.textContent = catName;
      if (descText) descText.innerHTML = '<p>' + (produit.description || 'Aucune description.') + '</p>';
      var images = parseImages(produit.image);
      if (mainImage) {
        mainImage.src = images[0] || AssigameUtils.placeholderImage();
        mainImage.alt = produit.nom_produit || '';
      }
      renderGallery(images, produit.nom_produit || '');
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = produit.nom_produit || 'Produit';
      document.title = (produit.nom_produit || 'Produit') + ' - Assigame';

      if (sellerNameEl) sellerNameEl.textContent = formatSellerName(produit.id_utilisateur);
      if (sellerAvatarEl) sellerAvatarEl.textContent = formatSellerInitials(produit.id_utilisateur);
      currentSeller = produit.id_utilisateur || null;
      updateContactSellerButton(produit.id_utilisateur);

      var catLink = document.querySelector('.breadcrumb a:nth-child(2)');
      if (catLink) catLink.textContent = catName;

      bindGallery();
      bindActions();
      loadSimilar(produit);
    } catch (err) {
      toast(err.message || 'Produit introuvable');
    }
  }

  function renderSimilarCards(products) {
    if (!similarGrid) return;
    if (!products || !products.length) {
      similarGrid.innerHTML = '<p class="similar-empty">Aucun autre produit dans cette catégorie pour le moment.</p>';
      return;
    }

    similarGrid.innerHTML = products.map(function (p) {
      var catName = p.idcategorie_produit && p.idcategorie_produit.nom_categorieproduit
        ? p.idcategorie_produit.nom_categorieproduit : '';
      var img = (p.image ? p.image.split(',')[0].trim() : '') || AssigameUtils.placeholderImage();
      return (
        '<a class="similar-card" href="/fiche-produit.html?id=' + p.id_produit + '">' +
          '<div class="similar-media">' +
            '<span class="similar-tag">' + catName + '</span>' +
            '<img src="' + img + '" alt="' + (p.nom_produit || 'Produit') + '">' +
          '</div>' +
          '<div class="similar-body">' +
            '<p class="similar-title">' + (p.nom_produit || 'Produit') + '</p>' +
            '<span class="similar-price">' + AssigameUtils.formatPriceFCFA(p.prix) + '</span>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  function extractCategoryId(produit) {
    if (!produit || !produit.idcategorie_produit) return null;
    var cat = produit.idcategorie_produit;
    if (typeof cat === 'number' || typeof cat === 'string') return Number(cat);
    return cat.idcategorie_produit != null ? Number(cat.idcategorie_produit) : null;
  }

  async function loadSimilar(current) {
    if (!similarGrid || !current) return;
    similarGrid.innerHTML = '<p class="similar-empty">Chargement des produits similaires…</p>';

    try {
      var similar = await AssigameAPI.getProduitsSimilaires(current.id_produit);
      renderSimilarCards(similar);
      return;
    } catch (apiErr) {
      /* repli : filtre côté client sur le catalogue public */
    }

    try {
      var all = await AssigameAPI.getProduits();
      var catId = extractCategoryId(current);
      var catName = current.idcategorie_produit && current.idcategorie_produit.nom_categorieproduit;

      var similar = (all || []).filter(function (p) {
        if (Number(p.id_produit) === Number(current.id_produit)) return false;
        if (catId != null) {
          return extractCategoryId(p) === catId;
        }
        if (catName && p.idcategorie_produit) {
          return p.idcategorie_produit.nom_categorieproduit === catName;
        }
        return false;
      }).slice(0, 4);

      renderSimilarCards(similar);
    } catch (e) {
      similarGrid.innerHTML = '<p class="similar-empty">Impossible de charger les produits similaires.</p>';
    }
  }

  await loadProduit();
});
