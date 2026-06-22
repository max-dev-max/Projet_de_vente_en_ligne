document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var pendingEl = document.getElementById('kpiDemandesVendeur');
  var productsEl = document.getElementById('kpiProduitsAttente');
  try {
    var demandes = await AssigameAPI.getDemandesVendeur();
    if (pendingEl) pendingEl.textContent = demandes.length;
    var produits = await AssigameAPI.getDemandesProduits();
    if (productsEl) productsEl.textContent = produits.length;
  } catch (e) {
    AssigameUtils.showToast(e.message || 'Erreur chargement dashboard');
  }
});
