document.addEventListener('DOMContentLoaded', async function () {
  if (!AssigameUtils.requireAuth('ADMIN')) return;

  var tbody = document.getElementById('typesTableBody');
  var modal = document.getElementById('typeModal');
  var form = document.getElementById('typeForm');
  var technicalNameEl = document.getElementById('typeTechnicalName');
  var editingId = null;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function countVendorsByType(vendors) {
    var counts = {};
    (vendors || []).forEach(function (vendor) {
      if (vendor.statut !== 'ACTIF' || !vendor.role) return;
      counts[vendor.role] = (counts[vendor.role] || 0) + 1;
    });
    return counts;
  }

  function openEditModal(type) {
    if (!modal || !form || !type) return;
    editingId = type.id_typeutilisateur;
    form.libelle_typeutilisateur.value = type.libelle_typeutilisateur || '';
    form.description_typeutilisateur.value = type.description_typeutilisateur || '';
    if (technicalNameEl) {
      technicalNameEl.textContent = 'Identifiant technique : ' + (type.nom_typeutilisateur || '—');
    }
    modal.hidden = false;
  }

  function closeModal() {
    if (modal) modal.hidden = true;
    editingId = null;
  }

  async function load() {
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5">Chargement…</td></tr>';
    try {
      var types = await AssigameAPI.getTypeUtilisateurs();
      var vendors = await AssigameAPI.getAdminVendeurs();
      var vendorCounts = countVendorsByType(vendors);

      types = types.filter(function (type) {
        return type.nom_typeutilisateur !== 'ADMIN';
      });

      if (!types.length) {
        tbody.innerHTML = '<tr><td colspan="5">Aucun type de vendeur configuré.</td></tr>';
        return;
      }

      tbody.innerHTML = types.map(function (type) {
        var count = vendorCounts[type.nom_typeutilisateur] || 0;
        return (
          '<tr class="type-row" data-id="' + type.id_typeutilisateur + '">' +
            '<td><div class="cat-name"><span class="cat-icon icon-violet"><i class="ph ph-tag"></i></span>' + escapeHtml(type.nom_typeutilisateur) + '</div></td>' +
            '<td>' + escapeHtml(type.libelle_typeutilisateur) + '</td>' +
            '<td class="desc-cell">' + escapeHtml(type.description_typeutilisateur) + '</td>' +
            '<td class="num">' + count + '</td>' +
            '<td class="actions"><span class="row-actions">' +
              '<button type="button" class="icon-btn btn-edit" title="Modifier le nom et la description"><i class="ph ph-pencil-simple"></i></button>' +
            '</span></td>' +
          '</tr>'
        );
      }).join('');

      tbody.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var row = btn.closest('tr');
          var id = Number(row.getAttribute('data-id'));
          var type = types.find(function (item) { return item.id_typeutilisateur === id; });
          openEditModal(type);
        });
      });

    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="5">Erreur : ' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!editingId) return;

      var payload = {
        libelle_typeutilisateur: form.libelle_typeutilisateur.value.trim(),
        description_typeutilisateur: form.description_typeutilisateur.value.trim()
      };

      if (!payload.libelle_typeutilisateur || !payload.description_typeutilisateur) {
        AssigameUtils.showToast('Veuillez remplir le nom et la description');
        return;
      }

      try {
        await AssigameAPI.updateTypeUtilisateur(editingId, payload);
        AssigameUtils.showToast('Type mis à jour');
        closeModal();
        await load();
      } catch (err) {
        AssigameUtils.showToast(err.message);
      }
    });
  }

  await load();
});
