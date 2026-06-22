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
    return;
  }

  async function load() {
    try {
      var p = await AssigameAPI.getProduitModeration(id);
      if (titleEl) titleEl.textContent = p.nom_produit;
      if (metaEl) {
        var vendeur = p.id_utilisateur ? p.id_utilisateur.prenom_utilisateur + ' ' + p.id_utilisateur.nom_utilisateur : '—';
        metaEl.innerHTML = 'Proposé par <strong>' + vendeur + '</strong>';
      }
      if (detailsEl) {
        detailsEl.innerHTML =
          '<div class="form-group"><span class="form-label">Description</span><div class="readonly-field">' + (p.description || '—') + '</div></div>' +
          '<div class="form-group"><span class="form-label">Prix</span><div class="readonly-field">' + AssigameUtils.formatPriceFCFA(p.prix) + '</div></div>' +
          '<div class="form-group"><span class="form-label">Catégorie</span><div class="readonly-field">' + (p.idcategorie_produit ? p.idcategorie_produit.nom_categorieproduit : '—') + '</div></div>' +
          '<div class="form-group"><span class="form-label">Statut</span><div class="readonly-field">' + AssigameUtils.statutLabel(p.statut) + '</div></div>';
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
