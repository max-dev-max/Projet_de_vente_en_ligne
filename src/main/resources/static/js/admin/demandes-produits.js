document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var tbody = document.getElementById('produitsBody');
  if (!tbody) return;

  async function load() {
    tbody.innerHTML = '<tr><td colspan="7">Chargement…</td></tr>';
    try {
      var produits = await AssigameAPI.getProduits();
      var attente = produits.filter(function (p) { return p.statut === 'EN_ATTENTE'; });
      if (!attente.length) {
        tbody.innerHTML = '<tr><td colspan="7">Aucun produit en attente de modération.</td></tr>';
        return;
      }
      tbody.innerHTML = attente.map(function (p) {
        var vendeur = p.id_utilisateur ? (p.id_utilisateur.prenom_utilisateur + ' ' + p.id_utilisateur.nom_utilisateur) : '—';
        var cat = p.idcategorie_produit ? p.idcategorie_produit.nom_categorieproduit : '—';
        return (
          '<tr>' +
            '<td><input type="checkbox" aria-label="Sélectionner"></td>' +
            '<td><strong>' + p.nom_produit + '</strong></td>' +
            '<td>' + vendeur + '</td>' +
            '<td>' + cat + '</td>' +
            '<td>' + AssigameUtils.formatPriceFCFA(p.prix) + '</td>' +
            '<td><span class="badge badge-pending">En attente</span></td>' +
            '<td class="text-right"><a href="/admin/moderation-produits.html?id=' + p.id_produit + '" class="btn btn-secondary" style="padding:6px 12px;"><i class="ph ph-magnifying-glass"></i> Modérer</a></td>' +
          '</tr>'
        );
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="7">Erreur : ' + e.message + '</td></tr>';
    }
  }
  await load();
});
