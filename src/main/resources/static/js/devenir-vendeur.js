/* Devenir vendeur — formulaire conforme à POST /api/auth/register */
document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var form = document.getElementById('sellerForm');
  var typeSelect = document.getElementById('typeVendeur');
  if (!form) return;

  try {
    var types = await AssigameAPI.getTypesVendeur();
    if (typeSelect && types && types.length) {
      typeSelect.innerHTML = types.map(function (t) {
        return '<option value="' + t.nom_typeutilisateur + '">' + (t.libelle_typeutilisateur || t.nom_typeutilisateur) + '</option>';
      }).join('');
    }
  } catch (e) {
    if (typeSelect) {
      typeSelect.innerHTML =
        '<option value="Particulier">Particulier</option>' +
        '<option value="Professionnel">Professionnel</option>' +
        '<option value="Partenaire Vip">Partenaire Vip</option>';
    }
  }

  var draftBtn = document.getElementById('draftBtn');
  if (draftBtn) {
    draftBtn.addEventListener('click', function () {
      var data = Object.fromEntries(new FormData(form));
      localStorage.setItem('assigame_vendeur_draft', JSON.stringify(data));
      toast('Brouillon enregistré localement');
    });
  }

  var draft = localStorage.getItem('assigame_vendeur_draft');
  if (draft) {
    try {
      var saved = JSON.parse(draft);
      Object.keys(saved).forEach(function (key) {
        var field = form.elements[key];
        if (field && field.type !== 'radio') field.value = saved[key];
      });
    } catch (e) { /* ignore */ }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var errorMsg = field.parentElement.querySelector('.field-error-msg');
      var isEmpty = field.type === 'radio'
        ? !form.querySelector('input[name="' + field.name + '"]:checked')
        : !String(field.value).trim();
      if (isEmpty) {
        valid = false;
        field.classList.add('field-error');
        if (errorMsg) errorMsg.classList.add('show');
      } else {
        field.classList.remove('field-error');
        if (errorMsg) errorMsg.classList.remove('show');
      }
    });

    var pass = form.querySelector('input[name="motDePasse"]');
    var confirmPass = form.querySelector('input[name="motDePasse_confirm"]');
    if (pass && confirmPass && pass.value !== confirmPass.value) {
      valid = false;
      confirmPass.classList.add('field-error');
      toast('Les mots de passe ne correspondent pas');
    }

    if (!valid) {
      toast('Veuillez corriger les champs en rouge');
      return;
    }

    var fd = new FormData(form);
    var payload = {
      nom: fd.get('nom'),
      prenom: fd.get('prenom'),
      email: fd.get('email'),
      telephone: fd.get('telephone'),
      sexe: fd.get('sexe'),
      motDePasse: fd.get('motDePasse'),
      typeVendeur: fd.get('typeVendeur')
    };

    try {
      await AssigameAPI.register(payload);
      localStorage.removeItem('assigame_vendeur_draft');
      toast('Demande envoyée avec succès');
      window.location.href = '/vendeur/offres-paiement.html';
    } catch (err) {
      toast(err.message || 'Erreur lors de l\'inscription');
    }
  });

  form.querySelectorAll('input, textarea, select').forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('field-error');
      var errorMsg = field.parentElement.querySelector('.field-error-msg');
      if (errorMsg) errorMsg.classList.remove('show');
    });
  });
});
