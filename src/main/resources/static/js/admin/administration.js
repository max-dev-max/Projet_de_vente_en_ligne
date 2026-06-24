document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;

  var pendingEl = document.getElementById('kpiDemandesVendeur');
  var productsPendingEl = document.getElementById('kpiProduitsAttente');
  var productsPublishedEl = document.getElementById('kpiProduitsPublies');
  var vendorsEl = document.getElementById('kpiVendeursActifs');

  function countActiveVendors(vendors) {
    return (vendors || []).filter(function (vendor) {
      return vendor.statut === 'ACTIF';
    }).length;
  }

  try {
    var results = await Promise.all([
      AssigameAPI.getDemandesVendeur(),
      AssigameAPI.getDemandesProduits(),
      AssigameAPI.getProduits(),
      AssigameAPI.getAdminVendeurs()
    ]);

    if (pendingEl) pendingEl.textContent = results[0].length;
    if (productsPendingEl) productsPendingEl.textContent = results[1].length;
    if (productsPublishedEl) productsPublishedEl.textContent = results[2].length;
    if (vendorsEl) vendorsEl.textContent = countActiveVendors(results[3]);
  } catch (e) {
    AssigameUtils.showToast(e.message || 'Erreur chargement dashboard');
  }
});
