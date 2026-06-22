document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var planEl = document.getElementById('confirmPlan');
  var amountEl = document.getElementById('confirmAmount');
  var txEl = document.getElementById('confirmTx');
  var planParam = AssigameUtils.getQueryParam('plan') || 'Professionnel';

  var prices = {
    Particulier: '0 FCFA',
    Professionnel: '19 000 FCFA',
    'Partenaire Vip': 'Sur devis'
  };

  if (txEl) {
    txEl.textContent = '#TX-' + Date.now().toString(36).toUpperCase();
  }

  try {
    var types = await AssigameAPI.getTypesVendeur();
    var type = (types || []).find(function (t) {
      return t.nom_typeutilisateur === planParam;
    });

    if (planEl) {
      planEl.textContent = type
        ? (type.libelle_typeutilisateur || type.nom_typeutilisateur)
        : planParam;
    }
    if (amountEl) {
      amountEl.textContent = prices[planParam] || '—';
    }
  } catch (err) {
    if (planEl) planEl.textContent = planParam;
    if (amountEl) amountEl.textContent = prices[planParam] || '—';
    toast(err.message || 'Impossible de charger les détails de l\'offre');
  }
});
