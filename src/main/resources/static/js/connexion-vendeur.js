/* Connexion vendeur — POST /api/auth/login puis redirection vers l'espace vendeur */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('loginForm');
  var errorEl = document.getElementById('loginError');
  var submitBtn = document.getElementById('btnLogin');
  var VENDOR_SPACE = '/vendeur/dashboard.html';

  function isAdminRole(role) {
    return role === 'ADMIN';
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function getRedirectUrl() {
    var next = AssigameUtils.getQueryParam('next');
    if (next && next.indexOf('/vendeur/') === 0) {
      return next;
    }
    return VENDOR_SPACE;
  }

  function redirectIfAlreadyLoggedIn() {
    var token = AssigameAPI.getToken('vendor');
    var user = AssigameAPI.getUser('vendor');
    if (!token || !user || isAdminRole(user.role)) {
      return;
    }

    AssigameAPI.me('vendor')
      .then(function (profile) {
        if (profile && profile.role && !isAdminRole(profile.role)) {
          if (profile.statut === 'ACTIF') {
            AssigameAPI.setUser(profile, 'vendor');
            window.location.href = getRedirectUrl();
          } else {
            AssigameAPI.clearScope('vendor');
          }
        }
      })
      .catch(function () {
        AssigameAPI.clearScope('vendor');
      });
  }

  redirectIfAlreadyLoggedIn();
  AssigameUtils.initPasswordToggles();
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showError('');

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connexion…';
    }

    AssigameAPI.login(email, password, 'vendor')
      .then(function (res) {
        var user = res.utilisateur || res.user || AssigameAPI.getUser('vendor');
        if (!user) {
          AssigameAPI.clearScope('vendor');
          showError('Connexion OK mais profil introuvable.');
          return;
        }
        if (isAdminRole(user.role)) {
          AssigameAPI.clearScope('vendor');
          showError('Ce compte est un compte administrateur. Utilisez la connexion admin.');
          return;
        }
        if (user.statut && user.statut !== 'ACTIF') {
          AssigameAPI.clearScope('vendor');
          if (user.statut === 'EN_ATTENTE') {
            showError('Votre compte est en attente de validation par l\'administrateur.');
          } else if (user.statut === 'REFUSE') {
            showError('Votre demande a été refusée. Contactez l\'administrateur ou réinscrivez-vous.');
          } else {
            showError('Votre compte n\'est pas actif (' + user.statut + ').');
          }
          return;
        }
        window.location.href = getRedirectUrl();
      })
      .catch(function (err) {
        var msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) ? err.message : null;
        showError(msg || 'Connexion impossible. Vérifiez vos identifiants.');
        if (console && console.error) console.error(err);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Se connecter';
        }
      });
  });
});
