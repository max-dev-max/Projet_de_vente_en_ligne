document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var email = AssigameUtils.getQueryParam('email');
  var id = AssigameUtils.getQueryParam('id');
  var titleEl = document.getElementById('vendeurNom');
  var metaEl = document.getElementById('vendeurMeta');
  var badgeEl = document.getElementById('vendeurBadge');
  var infoEl = document.getElementById('vendeurInfos');
  var btnApprove = document.getElementById('btnApprouver');
  var btnRefuse = document.getElementById('btnRefuser');

  async function load() {
    try {
      var users = await AssigameAPI.getUtilisateurs();
      var user = users.find(function (u) {
        if (id) return String(u.id_utilisateur) === id;
        if (email) return u.email_utilisateur === email;
        return false;
      }) || users.find(function (u) { return u.statut_compte === 'EN_ATTENTE'; });

      if (!user) {
        AssigameUtils.showToast('Vendeur introuvable');
        return;
      }

      if (titleEl) titleEl.textContent = user.prenom_utilisateur + ' ' + user.nom_utilisateur;
      if (metaEl) metaEl.textContent = 'ID: #' + user.id_utilisateur + ' • ' + user.email_utilisateur;
      if (badgeEl) {
        badgeEl.className = 'badge ' + AssigameUtils.statutBadgeClass(user.statut_compte);
        badgeEl.textContent = AssigameUtils.statutLabel(user.statut_compte);
      }
      if (infoEl) {
        infoEl.innerHTML =
          '<div><span class="form-label">Email</span><p>' + user.email_utilisateur + '</p></div>' +
          '<div><span class="form-label">Téléphone</span><p>' + user.telephone_utilisateur + '</p></div>' +
          '<div><span class="form-label">Sexe</span><p>' + user.sexe_utilisateur + '</p></div>' +
          '<div><span class="form-label">Type</span><p>' + (user.id_typeutilisateur ? user.id_typeutilisateur.nom_typeutilisateur : '—') + '</p></div>';
      }

      var uid = user.id_utilisateur;
      if (btnApprove) {
        btnApprove.onclick = async function () {
          try {
            await AssigameAPI.approuverVendeur(uid);
            AssigameUtils.showToast('Vendeur approuvé');
            window.location.href = '/admin/demandes-vendeur.html';
          } catch (e) { AssigameUtils.showToast(e.message); }
        };
      }
      if (btnRefuse) {
        btnRefuse.onclick = async function () {
          try {
            await AssigameAPI.refuserVendeur(uid);
            AssigameUtils.showToast('Demande refusée');
            window.location.href = '/admin/demandes-vendeur.html';
          } catch (e) { AssigameUtils.showToast(e.message); }
        };
      }
    } catch (e) {
      AssigameUtils.showToast(e.message);
    }
  }
  await load();
});
