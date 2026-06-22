// ============================================
// script.js — page "Détail du produit"
// ============================================

// ===== 1. Galerie : changer l'image principale au clic sur une miniature =====
const galleryThumbsContainer = document.getElementById("galleryThumbs");
const galleryMainImg = document.querySelector(".gallery-main img");
const thumbAdd = document.querySelector(".thumb-add");

function activateThumb(thumb, imgUrl) {
  galleryMainImg.src = imgUrl;
  document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
  thumb.classList.add("active");
}

function bindThumbClick(thumb) {
  thumb.addEventListener("click", () => {
    activateThumb(thumb, thumb.dataset.img);
  });
}

// On lie le clic sur les miniatures déjà présentes au chargement
if (galleryMainImg && galleryThumbsContainer) {
  document.querySelectorAll(".thumb[data-img]").forEach(bindThumbClick);
}

// Le bouton "+" ouvre le sélecteur de fichiers pour ajouter une nouvelle photo à la galerie
if (thumbAdd && galleryThumbsContainer && galleryMainImg) {
thumbAdd.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const newThumb = document.createElement("button");
    newThumb.type = "button";
    newThumb.className = "thumb";
    newThumb.dataset.img = url;
    newThumb.innerHTML = `<img src="${url}" alt="Nouvelle vue du produit">`;

    bindThumbClick(newThumb);
    galleryThumbsContainer.insertBefore(newThumb, thumbAdd);

    activateThumb(newThumb, url); // on affiche directement la nouvelle photo
  });

  input.click();
});
}

// ===== 2. Copier le lien public dans le presse-papier =====
const btnCopy = document.getElementById("btnCopy");
const productUrl = document.getElementById("productUrl");

if (btnCopy && productUrl) {
btnCopy.addEventListener("click", async () => {
  const fullUrl = `https://${productUrl.textContent.trim()}`;

  try {
    await navigator.clipboard.writeText(fullUrl);
  } catch (err) {
    // Solution de repli si l'API Clipboard n'est pas disponible (ancien navigateur, contexte non sécurisé...)
    const tempInput = document.createElement("textarea");
    tempInput.value = fullUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  const originalContent = btnCopy.innerHTML;

  btnCopy.classList.add("copied");
  btnCopy.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
    Copié !
  `;

  setTimeout(() => {
    btnCopy.classList.remove("copied");
    btnCopy.innerHTML = originalContent;
  }, 2000);
});
}

// ===== 3. Boutons Modifier / Supprimer =====
const btnEdit = document.getElementById("btnEdit");
const btnDelete = document.getElementById("btnDelete");

if (btnEdit) {
btnEdit.addEventListener("click", () => {
  // Dans une vraie application, ceci redirigerait vers le formulaire d'édition
  // pré-rempli avec les données du produit, ex: ajouter-produit/produit.html?id=5521
  alert("Redirection vers le formulaire de modification du produit...");
});
}

if (btnDelete) {
btnDelete.addEventListener("click", () => {
  const confirmed = confirm("Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.");

  if (!confirmed) return;

  document.querySelector(".page-body").innerHTML = `
    <div class="deleted-message">
      <p>✅ Produit supprimé avec succès.</p>
      <p>Redirection vers la liste des produits...</p>
    </div>
  `;
});
}