// Page détail / modification produit — espace vendeur
(function () {
  'use strict';

  var PRODUCTS_URL = '/vendeur/produits.html';
  var MIN_FILES = 4;
  var MAX_FILES = 6;
  var MAX_SIZE_MB = 5;
  var MAX_DESCRIPTION_LENGTH = 2000;
  var ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'];

  var productId = null;
  var currentProduct = null;
  var galleryItems = []; // { type: 'url'|'file', value: string|File, preview: string }

  var editName = document.getElementById('editName');
  var editDescription = document.getElementById('editDescription');
  var editPrice = document.getElementById('editPrice');
  var editCategory = document.getElementById('editCategory');
  var descCount = document.getElementById('descCount');
  var galleryMainImage = document.getElementById('galleryMainImage');
  var galleryThumbs = document.getElementById('galleryThumbs');
  var thumbAdd = document.getElementById('thumbAdd');
  var galleryHint = document.getElementById('galleryHint');
  var productReference = document.getElementById('productReference');
  var productStatusBadge = document.getElementById('productStatusBadge');
  var productStatusLabel = document.getElementById('productStatusLabel');
  var breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  var productUrl = document.getElementById('productUrl');
  var linkCard = document.getElementById('linkCard');
  var productTimeline = document.getElementById('productTimeline');
  var btnSave = document.getElementById('btnSave');
  var btnDelete = document.getElementById('btnDelete');
  var btnCopy = document.getElementById('btnCopy');
  var pageBody = document.querySelector('.page-body');

  function notify(message, duration) {
    if (window.AssigameUtils && AssigameUtils.showToast) {
      AssigameUtils.showToast(message, duration);
    } else {
      alert(message);
    }
  }

  function getProductIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'), 10);
    return isNaN(id) ? null : id;
  }

  function parseImages(imageCsv) {
    if (!imageCsv) return [];
    return imageCsv.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function updateDescCount() {
    if (descCount && editDescription) {
      descCount.textContent = String(editDescription.value.length);
    }
  }

  function setStatusBadge(statut) {
    if (!productStatusBadge || !productStatusLabel) return;
    var classMap = {
      ACTIF: '',
      EN_ATTENTE: 'attente',
      REFUSE: 'refuse',
      SUSPENDU: 'suspendu'
    };
    productStatusBadge.className = 'status-badge' + (classMap[statut] ? ' ' + classMap[statut] : '');
    productStatusLabel.textContent = AssigameUtils.statutLabel(statut);
  }

  function renderGallery() {
    if (!galleryThumbs || !galleryMainImage) return;

    galleryThumbs.querySelectorAll('.thumb-wrap').forEach(function (el) { el.remove(); });

    galleryItems.forEach(function (item, index) {
      var wrap = document.createElement('div');
      wrap.className = 'thumb-wrap';

      var thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'thumb' + (index === 0 ? ' active' : '');
      thumb.dataset.index = String(index);
      thumb.innerHTML = '<img src="' + item.preview + '" alt="Photo ' + (index + 1) + '">';
      thumb.addEventListener('click', function () {
        galleryMainImage.src = item.preview;
        galleryThumbs.querySelectorAll('.thumb').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'thumb-remove';
      removeBtn.title = 'Retirer cette photo';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        removeGalleryItem(index);
      });

      wrap.appendChild(thumb);
      wrap.appendChild(removeBtn);
      galleryThumbs.insertBefore(wrap, thumbAdd);
    });

    if (galleryItems.length) {
      galleryMainImage.src = galleryItems[0].preview;
      galleryMainImage.alt = editName ? editName.value : 'Produit';
    } else {
      galleryMainImage.src = AssigameUtils.placeholderImage();
      galleryMainImage.alt = '';
    }

    if (thumbAdd) {
      thumbAdd.style.display = galleryItems.length >= MAX_FILES ? 'none' : 'flex';
    }
    if (galleryHint) {
      galleryHint.textContent = galleryItems.length + ' / ' + MAX_FILES + ' photos (minimum ' + MIN_FILES + ')';
    }
  }

  function removeGalleryItem(index) {
    var item = galleryItems[index];
    if (item && item.type === 'file' && item.preview) {
      URL.revokeObjectURL(item.preview);
    }
    galleryItems.splice(index, 1);
    renderGallery();
  }

  function addGalleryFile(file) {
    if (!file) return;
    if (galleryItems.length >= MAX_FILES) {
      notify('Vous ne pouvez pas dépasser ' + MAX_FILES + ' photos.');
      return;
    }
    if (ALLOWED_TYPES.indexOf(file.type) === -1) {
      notify('Format non supporté : ' + file.name);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      notify('"' + file.name + '" dépasse ' + MAX_SIZE_MB + ' Mo.');
      return;
    }
    var preview = URL.createObjectURL(file);
    galleryItems.push({ type: 'file', value: file, preview: preview });
    renderGallery();
  }

  function initGalleryFromProduct(imageCsv) {
    galleryItems.forEach(function (item) {
      if (item.type === 'file' && item.preview) URL.revokeObjectURL(item.preview);
    });
    galleryItems = parseImages(imageCsv).map(function (url) {
      return { type: 'url', value: url, preview: url };
    });
    renderGallery();
  }

  function populateCategories(categories, selectedId) {
    if (!editCategory) return;
    editCategory.innerHTML = '<option value="">Sélectionner une catégorie</option>';
    (categories || []).forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = String(cat.idcategorie_produit);
      opt.textContent = cat.nom_categorieproduit;
      if (selectedId && String(cat.idcategorie_produit) === String(selectedId)) {
        opt.selected = true;
      }
      editCategory.appendChild(opt);
    });
  }

  function renderTimeline(product) {
    if (!productTimeline) return;
    var dateLabel = product.date_ajout
      ? new Date(product.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';

    productTimeline.innerHTML =
      '<li class="timeline-item">' +
        '<span class="timeline-dot green"></span>' +
        '<div class="timeline-content">' +
          '<p class="timeline-title">Produit créé</p>' +
          '<p class="timeline-desc">Ajouté à votre catalogue vendeur</p>' +
          '<span class="timeline-meta">Réf. PRD-' + product.id_produit + '</span>' +
        '</div>' +
        '<span class="timeline-time">' + dateLabel + '</span>' +
      '</li>';

    if (product.statut === 'EN_ATTENTE') {
      productTimeline.innerHTML +=
        '<li class="timeline-item">' +
          '<span class="timeline-dot orange"></span>' +
          '<div class="timeline-content">' +
            '<p class="timeline-title">En attente de validation</p>' +
            '<p class="timeline-desc">Votre produit sera revu par l\'équipe Assigame</p>' +
          '</div>' +
        '</li>';
    } else if (product.statut === 'ACTIF') {
      productTimeline.innerHTML +=
        '<li class="timeline-item">' +
          '<span class="timeline-dot green"></span>' +
          '<div class="timeline-content">' +
            '<p class="timeline-title">Produit publié</p>' +
            '<p class="timeline-desc">Visible sur le catalogue public</p>' +
          '</div>' +
        '</li>';
    } else if (product.statut === 'REFUSE') {
      productTimeline.innerHTML +=
        '<li class="timeline-item">' +
          '<span class="timeline-dot grey"></span>' +
          '<div class="timeline-content">' +
            '<p class="timeline-title">Publication refusée</p>' +
            '<p class="timeline-desc">Modifiez le produit puis enregistrez pour une nouvelle validation</p>' +
          '</div>' +
        '</li>';
    }
  }

  function populateForm(product) {
    currentProduct = product;
    productId = product.id_produit;

    if (editName) editName.value = product.nom_produit || '';
    if (editDescription) editDescription.value = product.description || '';
    if (editPrice) editPrice.value = product.prix != null ? String(product.prix) : '';
    updateDescCount();

    var categoryId = product.idcategorie_produit && product.idcategorie_produit.idcategorie_produit;
    if (editCategory && categoryId) editCategory.value = String(categoryId);

    if (productReference) {
      productReference.textContent = 'Référence : PRD-' + product.id_produit;
    }
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = product.nom_produit || 'Modifier le produit';
    }
    document.title = (product.nom_produit || 'Produit') + ' - Assigame';

    setStatusBadge(product.statut || 'EN_ATTENTE');
    initGalleryFromProduct(product.image);
    renderTimeline(product);

    if (product.statut === 'ACTIF' && linkCard && productUrl) {
      var publicPath = window.location.origin + '/fiche-produit.html?id=' + product.id_produit;
      productUrl.textContent = publicPath.replace(/^https?:\/\//, '');
      linkCard.hidden = false;
    } else if (linkCard) {
      linkCard.hidden = true;
    }
  }

  function validateForm() {
    if (!editName || !editName.value.trim()) {
      notify('Le nom du produit est obligatoire.');
      editName && editName.focus();
      return false;
    }
    if (!editDescription || !editDescription.value.trim()) {
      notify('La description est obligatoire.');
      editDescription && editDescription.focus();
      return false;
    }
    if (editDescription.value.length > MAX_DESCRIPTION_LENGTH) {
      notify('La description ne peut pas dépasser ' + MAX_DESCRIPTION_LENGTH + ' caractères.');
      return false;
    }
    var price = parseFloat(editPrice && editPrice.value);
    if (isNaN(price) || price < 0) {
      notify('Veuillez saisir un prix valide.');
      editPrice && editPrice.focus();
      return false;
    }
    if (!editCategory || !editCategory.value) {
      notify('Veuillez sélectionner une catégorie.');
      return false;
    }
    if (galleryItems.length < MIN_FILES || galleryItems.length > MAX_FILES) {
      notify('Vous devez avoir entre ' + MIN_FILES + ' et ' + MAX_FILES + ' photos (actuellement ' + galleryItems.length + ').');
      return false;
    }
    return true;
  }

  async function buildImageCsv() {
    var urls = [];
    var filesToUpload = [];

    galleryItems.forEach(function (item) {
      if (item.type === 'url') {
        urls.push(item.value);
      } else {
        filesToUpload.push(item.value);
      }
    });

    if (filesToUpload.length) {
      var uploaded = await AssigameAPI.uploadProduitImages(filesToUpload);
      if (!uploaded || !uploaded.length) {
        throw new Error("L'upload des nouvelles images a échoué.");
      }
      var uploadIndex = 0;
      return galleryItems.map(function (item) {
        if (item.type === 'url') return item.value;
        return uploaded[uploadIndex++];
      }).join(',');
    }

    return urls.join(',');
  }

  async function saveProduct() {
    if (!productId || !validateForm()) return;

    btnSave.disabled = true;
    try {
      var imageCsv = await buildImageCsv();
      var updated = await AssigameAPI.updateProduit(productId, {
        nom_produit: editName.value.trim(),
        description: editDescription.value.trim(),
        prix: parseFloat(editPrice.value) || 0,
        idcategorie_produit: { idcategorie_produit: parseInt(editCategory.value, 10) },
        image: imageCsv
      });

      notify('Produit enregistré. Il sera revu par l\'administrateur si nécessaire.');
      populateForm(updated);
    } catch (err) {
      notify(err.message || 'Impossible d\'enregistrer le produit.');
    } finally {
      btnSave.disabled = false;
    }
  }

  async function deleteProduct() {
    if (!productId) return;
    if (!confirm('Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    btnDelete.disabled = true;
    try {
      await AssigameAPI.deleteProduit(productId);
      if (pageBody) {
        pageBody.innerHTML =
          '<div class="deleted-message">' +
            '<p>Produit supprimé avec succès.</p>' +
            '<p><a href="' + PRODUCTS_URL + '">Retour à la liste des produits</a></p>' +
          '</div>';
      }
      setTimeout(function () {
        window.location.href = PRODUCTS_URL;
      }, 1500);
    } catch (err) {
      notify(err.message || 'Impossible de supprimer le produit.');
      btnDelete.disabled = false;
    }
  }

  function showError(message) {
    if (!pageBody) return;
    pageBody.innerHTML =
      '<div class="page-error">' +
        '<p>' + message + '</p>' +
        '<p><a href="' + PRODUCTS_URL + '">Retour à mes produits</a></p>' +
      '</div>';
  }

  function bindEvents() {
    if (editDescription) {
      editDescription.addEventListener('input', updateDescCount);
    }

    if (thumbAdd) {
      thumbAdd.addEventListener('click', function () {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', function (event) {
          var file = event.target.files && event.target.files[0];
          addGalleryFile(file);
        });
        input.click();
      });
    }

    if (btnSave) btnSave.addEventListener('click', saveProduct);
    if (btnDelete) btnDelete.addEventListener('click', deleteProduct);

    if (btnCopy && productUrl) {
      btnCopy.addEventListener('click', async function () {
        var fullUrl = 'https://' + productUrl.textContent.trim();
        try {
          await navigator.clipboard.writeText(fullUrl);
        } catch (err) {
          var tempInput = document.createElement('textarea');
          tempInput.value = fullUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        var originalContent = btnCopy.innerHTML;
        btnCopy.classList.add('copied');
        btnCopy.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M20 6 9 17l-5-5"/>' +
          '</svg> Copié !';
        setTimeout(function () {
          btnCopy.classList.remove('copied');
          btnCopy.innerHTML = originalContent;
        }, 2000);
      });
    }
  }

  async function loadProduct() {
    productId = getProductIdFromUrl();
    if (!productId) {
      showError('Identifiant de produit manquant.');
      return;
    }

    try {
      var results = await Promise.all([
        AssigameAPI.getMesProduits(),
        AssigameAPI.getCategories()
      ]);

      var products = results[0] || [];
      var categories = results[1] || [];
      var product = products.find(function (p) {
        return Number(p.id_produit) === Number(productId);
      });

      if (!product) {
        showError('Produit introuvable ou vous n\'avez pas accès à ce produit.');
        return;
      }

      populateCategories(categories, product.idcategorie_produit && product.idcategorie_produit.idcategorie_produit);
      populateForm(product);
    } catch (err) {
      showError(err.message || 'Impossible de charger le produit.');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof VendorCommon === 'undefined' || !VendorCommon.initVendorSession()) return;
    VendorCommon.initVendorSidebar('produits');
    bindEvents();
    loadProduct();
  });
})();
