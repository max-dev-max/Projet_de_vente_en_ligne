document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var tbody = document.getElementById('demandesBody');
  if (!tbody) return;

  async function load() {
    tbody.innerHTML = '<tr><td colspan="6">Chargement…</td></tr>';
    try {
      var users = await AssigameAPI.getUtilisateurs();
      var demandes = users.filter(function (u) { return u.statut_compte === 'EN_ATTENTE'; });
      if (!demandes.length) {
        tbody.innerHTML = '<tr><td colspan="6">Toutes les demandes ont été traitées.</td></tr>';
        return;
      }
      tbody.innerHTML = demandes.map(function (d) {
        return (
          '<tr>' +
            '<td>#' + d.id_utilisateur + '</td>' +
            '<td><strong>' + d.prenom_utilisateur + ' ' + d.nom_utilisateur + '</strong></td>' +
            '<td>' + d.email_utilisateur + '</td>' +
            '<td>—</td>' +
            '<td><span class="badge ' + AssigameUtils.statutBadgeClass(d.statut_compte) + '">' + AssigameUtils.statutLabel(d.statut_compte) + '</span></td>' +
            '<td class="text-right"><a href="/admin/fiche-vendeur.html?id=' + d.id_utilisateur + '" class="btn btn-secondary" style="padding:6px 12px;"><i class="ph ph-eye"></i> Examiner</a></td>' +
          '</tr>'
        );
      }).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="6">Erreur : ' + e.message + '</td></tr>';
    }
  }
  await load();
});
