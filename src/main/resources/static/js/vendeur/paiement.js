document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(window.location.search);
  var plan = params.get('plan') || 'pro';
  var label = document.getElementById('planLabel');
  var price = document.getElementById('planPrice');
  var plans = {
    demarrage: { label: 'Abonnement Démarrage', price: '0 FCFA / mois' },
    pro: { label: 'Abonnement Professionnel', price: '19 000 FCFA / mois' }
  };
  var selected = plans[plan] || plans.pro;
  if (label) label.textContent = selected.label;
  if (price) price.textContent = selected.price;

  var form = document.getElementById('paymentForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = '/vendeur/confirmation-paiement.html?plan=' + encodeURIComponent(plan);
    });
  }
});
