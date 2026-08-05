const galleries = {
  "song-pro": [
    { src: "assets/gallery/song-pro/01-exterior-principal.jpg", alt: "BYD Song Pro DM-i 2026, exterior principal" },
    { src: "assets/gallery/song-pro/02-exterior-frontal.jpg", alt: "BYD Song Pro DM-i 2026, vista frontal" },
    { src: "assets/gallery/song-pro/03-exterior-lateral.jpg", alt: "BYD Song Pro DM-i 2026, vista lateral" },
    { src: "assets/gallery/song-pro/04-exterior-trasero.jpg", alt: "BYD Song Pro DM-i 2026, vista trasera" },
    { src: "assets/gallery/song-pro/05-interior-tablero.png", alt: "BYD Song Pro DM-i 2026, tablero e interior" },
    { src: "assets/gallery/song-pro/06-segunda-fila.png", alt: "BYD Song Pro DM-i 2026, segunda fila" }
  ],
  "song-l": [
    { src: "assets/gallery/song-l/01-exterior-principal.jpg", alt: "BYD Song L Smart Driving DM-i 2025, exterior principal" },
    { src: "assets/gallery/song-l/02-exterior-frontal.jpg", alt: "BYD Song L Smart Driving DM-i 2025, vista frontal" },
    { src: "assets/gallery/song-l/03-exterior-lateral.png", alt: "BYD Song L Smart Driving DM-i 2025, vista lateral" },
    { src: "assets/gallery/song-l/04-exterior-trasero.jpg", alt: "BYD Song L Smart Driving DM-i 2025, vista trasera" },
    { src: "assets/gallery/song-l/05-interior-tablero.jpg", alt: "BYD Song L Smart Driving DM-i 2025, tablero e interior" },
    { src: "assets/gallery/song-l/06-segunda-fila.jpg", alt: "BYD Song L Smart Driving DM-i 2025, segunda fila" }
  ],
  "deepal": [
    { src: "assets/gallery/deepal/01-exterior-principal.jpg", alt: "Deepal S05 2026, exterior principal" },
    { src: "assets/gallery/deepal/02-exterior-frontal.jpg", alt: "Deepal S05 2026, vista frontal" },
    { src: "assets/gallery/deepal/03-interior-naranja.jpg", alt: "Deepal S05 2026, interior naranja" },
    { src: "assets/gallery/deepal/04-segunda-fila.jpg", alt: "Deepal S05 2026, segunda fila" },
    { src: "assets/gallery/deepal/05-interior-tablero.jpg", alt: "Deepal S05 2026, tablero e interior" },
    { src: "assets/gallery/deepal/06-detalle-puerta.jpg", alt: "Deepal S05 2026, detalle interior de puerta" }
  ]
};

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCounter = document.getElementById("lightbox-counter");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");

let activeGallery = "";
let activeIndex = 0;

function setMainImage(galleryName, index) {
  const gallery = galleries[galleryName];
  if (!gallery || !gallery[index]) return;

  const showcase = document.querySelector(`[data-gallery="${galleryName}"]`)?.closest(".vehicle-showcase");
  const mainImage = showcase?.querySelector(".gallery-open img");
  if (mainImage) {
    mainImage.src = gallery[index].src;
    mainImage.alt = gallery[index].alt;
  }

  showcase?.querySelectorAll(".gallery-thumbs button").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.index) === index);
  });
}

function renderLightbox() {
  const gallery = galleries[activeGallery];
  const item = gallery[activeIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.alt;
  lightboxCounter.textContent = `${activeIndex + 1} / ${gallery.length}`;
}

function openLightbox(galleryName, index) {
  activeGallery = galleryName;
  activeIndex = Number(index);
  renderLightbox();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  closeButton.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
}

function changeImage(direction) {
  const gallery = galleries[activeGallery];
  activeIndex = (activeIndex + direction + gallery.length) % gallery.length;
  renderLightbox();
  setMainImage(activeGallery, activeIndex);
}

document.querySelectorAll(".gallery-thumbs button").forEach((button) => {
  button.addEventListener("click", () => {
    const galleryName = button.dataset.gallery;
    const index = Number(button.dataset.index);
    setMainImage(galleryName, index);
    openLightbox(galleryName, index);
  });
});

document.querySelectorAll(".gallery-open").forEach((button) => {
  button.addEventListener("click", () => {
    const showcase = button.closest(".vehicle-showcase");
    const activeThumb = showcase.querySelector(".gallery-thumbs button.is-active");
    const index = activeThumb ? Number(activeThumb.dataset.index) : Number(button.dataset.index);
    openLightbox(button.dataset.gallery, index);
  });
});

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", () => changeImage(-1));
nextButton.addEventListener("click", () => changeImage(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") changeImage(-1);
  if (event.key === "ArrowRight") changeImage(1);
});

document.querySelectorAll(".gallery-thumbs").forEach((thumbs) => {
  const first = thumbs.querySelector("button");
  first?.classList.add("is-active");
});
