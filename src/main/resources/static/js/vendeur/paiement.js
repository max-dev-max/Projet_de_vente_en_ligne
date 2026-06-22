document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var planParam = AssigameUtils.getQueryParam('plan') || 'Professionnel';
  var label = document.getElementById('planLabel');
  var price = document.getElementById('planPrice');
  var form = document.getElementById('paymentForm');

  var prices = {
    Particulier: '0 FCFA / mois',
    Professionnel: '19 000 FCFA / mois',
    'Partenaire Vip': 'Sur devis'
  };

  try {
    var types = await AssigameAPI.getTypesVendeur();
    var type = (types || []).find(function (t) {
      return t.nom_typeutilisateur === planParam;
    });

    if (label) {
      label.textContent = type
        ? 'Abonnement ' + (type.libelle_typeutilisateur || type.nom_typeutilisateur)
        : 'Abonnement';
    }
    if (price) {
      price.textContent = prices[planParam] || '—';
    }
  } catch (err) {
    if (label) label.textContent = 'Abonnement ' + planParam;
    if (price) price.textContent = prices[planParam] || '—';
    toast(err.message || 'Impossible de charger l\'offre');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = '/vendeur/confirmation-paiement.html?plan=' + encodeURIComponent(planParam);
    });
  }
});
