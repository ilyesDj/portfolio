const header = document.querySelector(".site-header");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("nav-toggle");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxClose = document.getElementById("lightbox-close");
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const year = document.getElementById("year");

const EMAIL = "userc8816@gmail.com";

if (year) {
  year.textContent = new Date().getFullYear();
}

const onScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const closeNav = () => {
  nav.classList.remove("open");
  navToggle.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("lock");
};

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("lock", open);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeNav();
});

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => revealObserver.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
const sections = [...document.querySelectorAll("section[id]")];

if ("IntersectionObserver" in window) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => spyObserver.observe(section));
}

let lastFocused = null;
let slideIndex = 0;
let activeSlides = [];

const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxCounter = document.getElementById("lightbox-counter");

const getSlides = (button) => {
  const card = button.closest(".work-card");
  const preview = button.querySelector("img");
  const sources = (card.dataset.images || button.dataset.lightbox || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  return sources.map((src, index) => ({
    src,
    title: card.dataset.title,
    desc: card.dataset.desc,
    alt: index === 0 && preview ? preview.alt : `${card.dataset.title} render ${index + 1}`,
  }));
};

const showSlide = (index) => {
  if (!activeSlides.length) return;
  slideIndex = (index + activeSlides.length) % activeSlides.length;
  const slide = activeSlides[slideIndex];
  lightboxImg.src = slide.src;
  lightboxImg.alt = slide.alt || slide.title;
  lightboxTitle.textContent = slide.title;
  lightboxDesc.textContent = slide.desc;
  if (lightboxCounter) {
    lightboxCounter.textContent = `${slideIndex + 1} / ${activeSlides.length}`;
  }
};

const openLightbox = (button) => {
  activeSlides = getSlides(button);
  const hasMultiple = activeSlides.length > 1;
  [lightboxPrev, lightboxNext, lightboxCounter].forEach((el) => {
    if (el) el.style.display = hasMultiple ? "" : "none";
  });
  lastFocused = document.activeElement;
  showSlide(0);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
  lightboxClose.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
  if (lastFocused) lastFocused.focus();
};

const nextSlide = () => showSlide(slideIndex + 1);
const prevSlide = () => showSlide(slideIndex - 1);

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => openLightbox(button));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", prevSlide);
lightboxNext.addEventListener("click", nextSlide);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

let touchStartX = 0;

lightbox.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true }
);

lightbox.addEventListener(
  "touchend",
  (event) => {
    if (!lightbox.classList.contains("open")) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  },
  { passive: true }
);

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") nextSlide();
  if (event.key === "ArrowLeft") prevSlide();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const email = String(data.get("email")).trim();
  const type = String(data.get("type"));
  const message = String(data.get("message")).trim();

  const subject = encodeURIComponent(`Project inquiry — ${type} — ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nProject type: ${type}\n\n${message}`
  );

  window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  formNote.textContent = `Opening your email app — if nothing happens, email me directly at ${EMAIL}.`;
  formNote.classList.add("ok");
  form.reset();
});
