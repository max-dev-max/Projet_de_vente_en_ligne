// ============================================
// script.js — page "Ajouter un produit"
// ============================================

const MIN_FILES = 4;
const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const MAX_DESCRIPTION_LENGTH = 2000;
const ALLOWED_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"];

// ===== 1. Éléments du DOM =====
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const mediaThumbs = document.getElementById("mediaThumbs");
const mediaCount = document.getElementById("mediaCount");

const productForm = document.querySelector(".product-form");
const fieldName = document.getElementById("productName");
const fieldDescription = document.getElementById("productDescription");
const fieldPrice = document.getElementById("productPrice");
const fieldCategory = document.getElementById("productCategory");

const statusDot = document.querySelector(".status-dot");
const statusText = document.querySelector(".status-text");

const btnCancel = document.getElementById("btnCancel");
const btnDraft = document.getElementById("btnDraft");
const btnPublish = document.getElementById("btnPublish");

let uploadedFiles = []; // { file, url }

// ===== 2. Sélection de fichiers (clic sur la dropzone) =====
// Le <label for="fileInput"> ouvre déjà le sélecteur nativement.
// On écoute juste l'événement "change" pour récupérer les fichiers choisis.
fileInput.addEventListener("change", (event) => {
  handleFiles(event.target.files);
  fileInput.value = ""; // permet de resélectionner le même fichier plus tard
});

// ===== 3. Glisser-déposer =====
["dragenter", "dragover"].forEach(eventName => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault(); // indispensable, sinon le navigateur ouvre le fichier au lieu de le déposer
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", (event) => {
  handleFiles(event.dataTransfer.files);
});

// ===== 4. Traitement et validation des fichiers reçus =====
function handleFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (uploadedFiles.length >= MAX_FILES) {
      alert(`Vous ne pouvez pas dépasser ${MAX_FILES} médias.`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`Format non supporté : ${file.name}`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`"${file.name}" dépasse la taille maximale de ${MAX_SIZE_MB}MB.`);
      return;
    }

    uploadedFiles.push({
      file,
      url: URL.createObjectURL(file) // génère une URL locale pour prévisualiser l'image
    });
  });

  renderThumbs();
  markUnsaved();
}

// ===== 5. Affichage des miniatures =====
function renderThumbs() {
  mediaThumbs.innerHTML = "";

  uploadedFiles.forEach((item, index) => {
    const thumb = document.createElement("div");
    thumb.className = "media-thumb";

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = `Média ${index + 1}`;
    thumb.appendChild(img);

    // La première image ajoutée devient l'image principale
    if (index === 0) {
      const badge = document.createElement("span");
      badge.className = "media-thumb-badge";
      badge.textContent = "PRINCIPAL";
      thumb.appendChild(badge);
    }

    const removeBtn = document.createElement("span");
    removeBtn.className = "media-thumb-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Retirer";
    removeBtn.addEventListener("click", () => removeFile(index));
    thumb.appendChild(removeBtn);

    mediaThumbs.appendChild(thumb);
  });

  // Compléter avec des emplacements vides jusqu'à atteindre MAX_FILES
  for (let i = uploadedFiles.length; i < MAX_FILES; i++) {
    const empty = document.createElement("div");
    empty.className = "media-thumb-empty";
    empty.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M12 8v8"/>
        <path d="M8 12h8"/>
      </svg>
    `;
    empty.addEventListener("click", () => fileInput.click());
    mediaThumbs.appendChild(empty);
  }

  mediaCount.textContent = `${uploadedFiles.length} / ${MAX_FILES}`;
}

function removeFile(index) {
  URL.revokeObjectURL(uploadedFiles[index].url); // libère la mémoire utilisée par la prévisualisation
  uploadedFiles.splice(index, 1);
  renderThumbs();
  markUnsaved();
}

// ===== 6. Statut "modifications non enregistrées / enregistrées" =====
function markUnsaved() {
  if (statusDot) statusDot.classList.remove("saved");
  if (statusText) statusText.textContent = "Modifications non enregistrées";
}

function markSaved(message) {
  if (statusDot) statusDot.classList.add("saved");
  if (statusText) statusText.textContent = message;
}

// Dès qu'on touche à un champ du formulaire, on repasse en "non enregistré"
productForm.addEventListener("input", markUnsaved);

// ===== 7. Validation des champs obligatoires =====
function validateForm() {
  const fields = [fieldName, fieldDescription, fieldPrice, fieldCategory];
  let isValid = true;

  fields.forEach(field => {
    // Pour le champ Prix, la bordure rouge doit s'afficher sur le conteneur .input-prefix,
    // pas sur l'input lui-même (qui n'a pas de bordure visible, cf. CSS).
    const target = field.closest(".input-prefix") || field;
    target.classList.remove("invalid");

    if (!field.value || field.value.trim() === "") {
      target.classList.add("invalid");
      isValid = false;
    }
  });

  if (fieldDescription.value.trim().length > MAX_DESCRIPTION_LENGTH) {
    fieldDescription.classList.add("invalid");
    notify(`La description ne peut pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.`);
    return false;
  }

  return isValid;
}

// ===== 8. Actions des boutons =====
function hasFormContent() {
  return [fieldName, fieldDescription, fieldPrice].some(f => f.value.trim() !== "")
    || fieldCategory.value !== ""
    || uploadedFiles.length > 0;
}

btnCancel.addEventListener("click", () => {
  if (hasFormContent() && !confirm("Annuler ? Les informations saisies seront perdues.")) {
    return;
  }

  productForm.reset();
  uploadedFiles.forEach(item => URL.revokeObjectURL(item.url));
  uploadedFiles = [];
  renderThumbs();
  markUnsaved();
});

btnDraft.addEventListener("click", () => {
  markSaved("Brouillon enregistré");
});

function notify(message, duration) {
  if (window.AssigameUtils && AssigameUtils.showToast) {
    AssigameUtils.showToast(message, duration);
  } else {
    alert(message);
  }
}

function notifyPublishSuccess() {
  var overlay = document.getElementById("publishSuccessOverlay");
  if (overlay) {
    overlay.hidden = false;
    overlay.classList.add("show");
    clearTimeout(overlay._hideTimer);
    overlay._hideTimer = setTimeout(function () {
      overlay.classList.remove("show");
      overlay.hidden = true;
    }, 1000);
    return;
  }
  notify(
    "Publication réussie ! Votre produit est en attente de validation par l'administrateur.",
    1000
  );
}

btnPublish.addEventListener("click", async () => {
  if (!validateForm()) {
    notify("Merci de remplir tous les champs obligatoires avant de publier.");
    return;
  }
  if (uploadedFiles.length < MIN_FILES || uploadedFiles.length > MAX_FILES) {
    notify(`Vous devez ajouter entre ${MIN_FILES} et ${MAX_FILES} photos (actuellement ${uploadedFiles.length}).`);
    return;
  }

  const categoryId = parseInt(fieldCategory.value, 10);
  if (isNaN(categoryId)) {
    notify("Veuillez sélectionner une catégorie valide.");
    return;
  }

  btnPublish.disabled = true;

  try {
    const files = uploadedFiles.map((item) => item.file);
    const urls = await AssigameAPI.uploadProduitImages(files);
    if (!urls || urls.length < MIN_FILES) {
      throw new Error("L'upload des images a échoué.");
    }

    await AssigameAPI.createProduit({
      nom_produit: fieldName.value.trim(),
      description: fieldDescription.value.trim(),
      prix: parseFloat(fieldPrice.value) || 0,
      idcategorie_produit: { idcategorie_produit: categoryId },
      image: urls.join(",")
    });

    notifyPublishSuccess();
    markSaved("Produit enregistré avec succès");

    productForm.reset();
    uploadedFiles.forEach((item) => URL.revokeObjectURL(item.url));
    uploadedFiles = [];
    renderThumbs();
  } catch (err) {
    notify(err.message || "Impossible de publier le produit.");
  } finally {
    btnPublish.disabled = false;
  }
});

// ===== 9. Chargement des catégories =====
async function loadCategories() {
  if (!fieldCategory) return;
  try {
    const categories = await AssigameAPI.getCategories();
    if (categories && categories.length) {
      categories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.idcategorie_produit;
        opt.textContent = cat.nom_categorieproduit;
        fieldCategory.appendChild(opt);
      });
    }
  } catch (e) {
    notify("Impossible de charger les catégories.");
  }
}

// ===== 10. Initialisation =====
renderThumbs();
loadCategories();