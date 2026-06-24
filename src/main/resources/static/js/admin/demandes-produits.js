document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var tbody = document.getElementById('produitsBody');
  if (!tbody) return;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function load() {
    tbody.innerHTML = '<tr><td colspan="7">Chargement…</td></tr>';
    try {
      var produits = await AssigameAPI.getDemandesProduits();
      if (!produits.length) {
        tbody.innerHTML = '<tr><td colspan="7">Aucun produit en attente de modération.</td></tr>';
        return;
      }
      tbody.innerHTML = produits.map(function (p) {
        var vendeur = p.id_utilisateur ? (p.id_utilisateur.prenom_utilisateur + ' ' + p.id_utilisateur.nom_utilisateur) : '—';
        var cat = p.idcategorie_produit ? p.idcategorie_produit.nom_categorieproduit : '—';
        return (
          '<tr>' +
            '<td><input type="checkbox" aria-label="Sélectionner"></td>' +
            '<td><strong>' + escapeHtml(p.nom_produit) + '</strong></td>' +
            '<td>' + escapeHtml(vendeur) + '</td>' +
            '<td>' + escapeHtml(cat) + '</td>' +
            '<td>' + escapeHtml(AssigameUtils.formatPriceFCFA(p.prix)) + '</td>' +
            '<td><span class="badge badge-pending">En attente</span></td>' +
            '<td class="text-right">' +
              '<a href="/admin/examen-produit.html?id=' + p.id_produit + '" class="btn btn-secondary" style="padding:6px 14px;">' +
                '<i class="ph ph-eye"></i> Examiner' +
              '</a>' +
            '</td>' +
          '</tr>'
        );
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="7">Erreur : ' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  await load();
});
