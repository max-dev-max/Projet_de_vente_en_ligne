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
    var addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function () {
        toast((titleEl ? titleEl.textContent.trim() : 'Produit') + ' ajouté au panier');
      });
    }
    var buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', function () { toast('Fonctionnalité paiement à venir'); });
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
      if (productSubtitle) productSubtitle.textContent = produit.description || '';
      if (descText) descText.innerHTML = '<p>' + (produit.description || 'Aucune description.') + '</p>';
      if (mainImage) {
        mainImage.src = produit.image || AssigameUtils.placeholderImage();
        mainImage.alt = produit.nom_produit || '';
      }
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = produit.nom_produit || 'Produit';
      document.title = (produit.nom_produit || 'Produit') + ' - Assigame';

      var catName = produit.idcategorie_produit && produit.idcategorie_produit.nom_categorieproduit
        ? produit.idcategorie_produit.nom_categorieproduit : 'Catalogue';
      var catLink = document.querySelector('.breadcrumb a:nth-child(2)');
      if (catLink) catLink.textContent = catName;

      bindGallery();
      bindActions();
      loadSimilar(produit);
    } catch (err) {
      toast(err.message || 'Produit introuvable');
    }
  }

  async function loadSimilar(current) {
    if (!similarGrid) return;
    try {
      var all = await AssigameAPI.getProduits();
      var catId = current.idcategorie_produit && current.idcategorie_produit.idcategorie_produit;
      var similar = all.filter(function (p) {
        return p.id_produit !== current.id_produit && p.statut === 'ACTIF' &&
          p.idcategorie_produit && p.idcategorie_produit.idcategorie_produit === catId;
      }).slice(0, 4);

      if (!similar.length) {
        similarGrid.innerHTML = '<p class="similar-empty">Aucun produit similaire pour le moment.</p>';
        return;
      }

      similarGrid.innerHTML = similar.map(function (p) {
        return (
          '<a class="similar-card" href="/fiche-produit.html?id=' + p.id_produit + '">' +
            '<div class="similar-media">' +
              '<span class="similar-tag">' + (p.idcategorie_produit ? p.idcategorie_produit.nom_categorieproduit : '') + '</span>' +
              '<img src="' + (p.image || AssigameUtils.placeholderImage()) + '" alt="' + p.nom_produit + '">' +
            '</div>' +
            '<div class="similar-body">' +
              '<p class="similar-title">' + p.nom_produit + '</p>' +
              '<span class="similar-price">' + AssigameUtils.formatPriceFCFA(p.prix) + '</span>' +
            '</div>' +
          '</a>'
        );
      }).join('');
    } catch (e) { /* silencieux */ }
  }

  await loadProduit();
});
