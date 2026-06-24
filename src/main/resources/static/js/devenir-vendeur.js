/* Devenir vendeur — étape 1 : informations personnelles */
document.addEventListener('DOMContentLoaded', function () {
  var toast = AssigameUtils.showToast;
  var form = document.getElementById('sellerForm');
  var choosePlanBtn = document.getElementById('choosePlanBtn');
  if (!form) return;

  AssigameUtils.initPasswordToggles(form);

  function fieldErrorMsg(field) {
    var container = field.closest('.field');
    return container ? container.querySelector('.field-error-msg') : null;
  }

  function validateForm() {
    var valid = true;

    form.querySelectorAll('[required]').forEach(function (field) {
      var errorMsg = fieldErrorMsg(field);
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

    return valid;
  }

  function saveDraft() {
    localStorage.setItem('assigame_vendeur_draft', JSON.stringify(Object.fromEntries(new FormData(form))));
  }

  var draftBtn = document.getElementById('draftBtn');
  if (draftBtn) {
    draftBtn.addEventListener('click', function () {
      saveDraft();
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

  if (choosePlanBtn) {
    choosePlanBtn.addEventListener('click', function () {
      if (!validateForm()) {
        toast('Veuillez corriger les champs en rouge');
        return;
      }
      saveDraft();
      window.location.href = '/choix-offre-vendeur.html';
    });
  }

  form.querySelectorAll('input, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('field-error');
      var errorMsg = fieldErrorMsg(field);
      if (errorMsg) errorMsg.classList.remove('show');
    });
  });
});
