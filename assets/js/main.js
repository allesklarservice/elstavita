/* Elsta Vita — interakcje */
(function () {
  "use strict";

  /* ---------- Nagłówek: cień po przewinięciu + przycisk "do góry" ---------- */
  const header = document.querySelector("header.site-header");
  const toTop = document.getElementById("to-top");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
    toTop.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });

  /* ---------- Menu mobilne ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  navToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
  document.querySelectorAll("nav.main-nav a").forEach((a) => {
    a.addEventListener("click", () => document.body.classList.remove("nav-open"));
  });

  /* ---------- Scroll-spy: aktywny link menu ---------- */
  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll("nav.main-nav a[href^='#']")];

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((l) =>
          l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id)
        );
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Animacje wejścia ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Karuzele (bungalow, bar) ---------- */
  document.querySelectorAll(".carousel").forEach((car) => {
    const slides = [...car.querySelectorAll(".slide")];
    const dotsWrap = car.querySelector(".c-dots");
    let idx = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement("i");
      if (i === 0) dot.classList.add("on");
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.children];

    function go(n) {
      slides[idx].classList.remove("active");
      dots[idx].classList.remove("on");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active");
      dots[idx].classList.add("on");
    }
    function auto() {
      clearInterval(timer);
      timer = setInterval(() => go(idx + 1), 4500);
    }

    car.querySelector(".c-prev").addEventListener("click", () => { go(idx - 1); auto(); });
    car.querySelector(".c-next").addEventListener("click", () => { go(idx + 1); auto(); });
    auto();
  });

  /* ---------- Galeria: lightbox ---------- */
  const items = [...document.querySelectorAll(".gallery-item")];
  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox.querySelector("img");
  const lbTitle = lightbox.querySelector(".lb-caption h4");
  const lbDesc = lightbox.querySelector(".lb-caption p");
  let current = 0;

  function openLb(i) {
    current = (i + items.length) % items.length;
    const el = items[current];
    lbImg.src = el.querySelector("img").src;
    lbTitle.textContent = el.dataset.title || "";
    lbDesc.textContent = el.dataset.desc || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  items.forEach((el, i) => el.addEventListener("click", () => openLb(i)));
  lightbox.querySelector(".lb-close").addEventListener("click", closeLb);
  lightbox.querySelector(".lb-prev").addEventListener("click", () => openLb(current - 1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => openLb(current + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") openLb(current - 1);
    if (e.key === "ArrowRight") openLb(current + 1);
  });

  /* ---------- Opinie: pokaż więcej ---------- */
  const reviews = document.querySelector(".reviews");
  const moreBtn = document.getElementById("reviews-more-btn");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      const expanded = reviews.classList.toggle("expanded");
      moreBtn.textContent = expanded ? "Pokaż mniej opinii" : "Pokaż wszystkie opinie";
    });
  }

  /* ---------- Formularz rezerwacji → e-mail ---------- */
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(bookingForm);
      const body = [
        "Rezerwacja — zapytanie ze strony www",
        "",
        "Przyjazd: " + f.get("arrival"),
        "Wyjazd: " + f.get("departure"),
        "Pokój: " + f.get("room"),
        "Liczba dorosłych: " + f.get("adults"),
        "Liczba dzieci: " + f.get("children"),
        "",
        "Imię i nazwisko: " + f.get("name"),
        "Telefon: " + f.get("phone"),
        "",
        "Wiadomość:",
        f.get("message") || "-",
      ].join("\n");
      window.location.href =
        "mailto:elstavita@elstavita.pl?subject=" +
        encodeURIComponent("Rezerwacja: " + f.get("arrival") + " – " + f.get("departure")) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- Formularz kontaktowy → e-mail ---------- */
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(contactForm);
      const body = [
        "Wiadomość ze strony www",
        "",
        "Od: " + f.get("name"),
        "",
        f.get("message") || "-",
      ].join("\n");
      window.location.href =
        "mailto:elstavita@elstavita.pl?subject=" +
        encodeURIComponent("Kontakt ze strony www — " + f.get("name")) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- Rok w stopce ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
