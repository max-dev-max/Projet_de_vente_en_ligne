document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;
  var tbody = document.getElementById('categoryTableBody');
  var createBtn = document.getElementById('createCategoryBtn');
  var modal = document.getElementById('categoryModal');
  var form = document.getElementById('categoryForm');
  var modalTitle = document.getElementById('categoryModalTitle');
  var editingNom = null;

  function openModal(title, data) {
    if (!modal) return;
    editingNom = data && data.nom_categorieproduit ? data.nom_categorieproduit : null;
    if (modalTitle) modalTitle.textContent = title;
    if (form) {
      form.nom_categorieproduit.value = data ? data.nom_categorieproduit || '' : '';
      form.description.value = data ? data.description || '' : '';
    }
    modal.hidden = false;
  }

  function closeModal() {
    if (modal) modal.hidden = true;
    editingNom = null;
  }

  async function load() {
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Chargement…</td></tr>';
    try {
      var cats = await AssigameAPI.getCategories();
      if (!cats.length) {
        tbody.innerHTML = '<tr><td colspan="4">Créez votre première catégorie.</td></tr>';
        return;
      }
      tbody.innerHTML = cats.map(function (c) {
        return (
          '<tr class="cat-row" data-nom="' + c.nom_categorieproduit.replace(/"/g, '&quot;') + '">' +
            '<td><div class="cat-name"><span class="cat-icon icon-violet"><i class="ph ph-grid-four"></i></span>' + c.nom_categorieproduit + '</div></td>' +
            '<td class="desc-cell">' + c.description + '</td>' +
            '<td class="num count-cell">—</td>' +
            '<td class="actions"><span class="row-actions">' +
              '<button type="button" class="icon-btn btn-edit" title="Modifier"><i class="ph ph-pencil-simple"></i></button>' +
              '<button type="button" class="icon-btn danger btn-delete" title="Supprimer"><i class="ph ph-trash"></i></button>' +
            '</span></td>' +
          '</tr>'
        );
      }).join('');

      tbody.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var row = btn.closest('tr');
          var nom = row.getAttribute('data-nom');
          var cat = cats.find(function (x) { return x.nom_categorieproduit === nom; });
          openModal('Modifier la catégorie', cat);
        });
      });
      tbody.querySelectorAll('.btn-delete').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var row = btn.closest('tr');
          var nom = row.getAttribute('data-nom');
          if (!confirm('Supprimer cette catégorie ?')) return;
          try {
            await AssigameAPI.deleteCategorie(nom);
            AssigameUtils.showToast('Catégorie supprimée');
            await load();
          } catch (e) { AssigameUtils.showToast(e.message); }
        });
      });
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="4">Erreur : ' + e.message + '</td></tr>';
    }
  }

  if (createBtn) createBtn.addEventListener('click', function () { openModal('Créer une catégorie', null); });
  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var payload = {
        nom_categorieproduit: form.nom_categorieproduit.value.trim(),
        description: form.description.value.trim()
      };
      try {
        if (editingNom) {
          await AssigameAPI.updateCategorie(editingNom, payload);
          AssigameUtils.showToast('Catégorie mise à jour');
        } else {
          await AssigameAPI.createCategorie(payload);
          AssigameUtils.showToast('Catégorie créée');
        }
        closeModal();
        await load();
      } catch (err) { AssigameUtils.showToast(err.message); }
    });
  }
  await load();
});
