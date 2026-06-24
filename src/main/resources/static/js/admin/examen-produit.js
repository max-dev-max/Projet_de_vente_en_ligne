document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var id = AssigameUtils.getQueryParam('id');
  var titleEl = document.getElementById('produitTitre');
  var metaEl = document.getElementById('produitMeta');
  var detailsEl = document.getElementById('produitDetails');
  var btnApprove = document.getElementById('btnApprouverProduit');
  var btnReject = document.getElementById('btnRejeterProduit');

  if (!id) {
    AssigameUtils.showToast('Produit introuvable');
    window.location.href = '/admin/demandes-produits.html';
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseImages(imageCsv) {
    if (!imageCsv) return [];
    return imageCsv.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  async function load() {
    try {
      var p = await AssigameAPI.getProduitModeration(id);
      if (titleEl) titleEl.textContent = p.nom_produit;
      if (metaEl) {
        var vendeur = p.id_utilisateur ? p.id_utilisateur.prenom_utilisateur + ' ' + p.id_utilisateur.nom_utilisateur : '—';
        metaEl.innerHTML = 'Proposé par <strong>' + escapeHtml(vendeur) + '</strong>';
      }
      if (detailsEl) {
        var images = parseImages(p.image);
        var imagesHtml = images.length
          ? images.map(function (src) {
              return '<img src="' + escapeHtml(src) + '" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:8px;">';
            }).join('')
          : '<span style="color:var(--text-sub);">Aucune image</span>';

        detailsEl.innerHTML =
          '<div class="info-grid">' +
            '<div class="form-group"><span class="form-label">Description</span><div class="readonly-field">' + escapeHtml(p.description || '—') + '</div></div>' +
            '<div class="form-group"><span class="form-label">Prix</span><div class="readonly-field">' + escapeHtml(AssigameUtils.formatPriceFCFA(p.prix)) + '</div></div>' +
            '<div class="form-group"><span class="form-label">Catégorie</span><div class="readonly-field">' + escapeHtml(p.idcategorie_produit ? p.idcategorie_produit.nom_categorieproduit : '—') + '</div></div>' +
            '<div class="form-group"><span class="form-label">Statut</span><div class="readonly-field">' + escapeHtml(AssigameUtils.statutLabel(p.statut)) + '</div></div>' +
            '<div class="form-group" style="grid-column:1 / -1;"><span class="form-label">Images</span><div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.35rem;">' + imagesHtml + '</div></div>' +
          '</div>';
      }
      if (btnApprove) {
        btnApprove.onclick = async function () {
          try {
            await AssigameAPI.approuverProduit(id);
            AssigameUtils.showToast('Produit approuvé');
            window.location.href = '/admin/demandes-produits.html';
          } catch (e) { AssigameUtils.showToast(e.message); }
        };
      }
      if (btnReject) {
        btnReject.onclick = async function () {
          try {
            await AssigameAPI.refuserProduit(id);
            AssigameUtils.showToast('Produit refusé');
            window.location.href = '/admin/demandes-produits.html';
          } catch (e) { AssigameUtils.showToast(e.message); }
        };
      }
    } catch (e) {
      AssigameUtils.showToast(e.message);
    }
  }

  await load();
});
