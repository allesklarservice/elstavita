/* ELSTA VITA v3 — minimalne, niezawodne interakcje (vanilla JS) */
(function () {
  "use strict";

  /* ---------- header: linia po przewinięciu ---------- */
  var header = document.getElementById("site-header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  /* ---------- menu mobilne ---------- */
  var burger = document.getElementById("burger");
  burger.addEventListener("click", function () {
    document.body.classList.toggle("menu-open");
  });
  document.querySelectorAll("#mobile-menu a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("menu-open");
    });
  });

  /* ---------- delikatne wejścia ---------- */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv, .hero-media").forEach(function (el) { obs.observe(el); });

  /* ---------- galeria: scroll-snap + strzałki + licznik ---------- */
  var strip = document.querySelector(".g-strip");
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var gCount = document.querySelector(".g-count");

  function stepSize() {
    var first = items[0];
    var gap = parseFloat(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 16;
    return first.getBoundingClientRect().width + gap;
  }
  document.querySelector(".g-arrows .g-prev").addEventListener("click", function () {
    strip.scrollBy({ left: -stepSize(), behavior: "smooth" });
  });
  document.querySelector(".g-arrows .g-next").addEventListener("click", function () {
    strip.scrollBy({ left: stepSize(), behavior: "smooth" });
  });

  var ticking = false;
  strip.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var center = strip.scrollLeft + strip.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      items.forEach(function (it, i) {
        var mid = it.offsetLeft + it.offsetWidth / 2;
        var d = Math.abs(mid - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      gCount.textContent = (best + 1) + " / " + items.length;
      ticking = false;
    });
  }, { passive: true });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img");
  var lbT = lb.querySelector(".lb-cap h4");
  var lbD = lb.querySelector(".lb-cap p");
  var li = 0;

  function lbOpen(i) {
    li = (i + items.length) % items.length;
    var it = items[li];
    lbImg.src = it.querySelector("img").src;
    lbT.textContent = it.dataset.title || "";
    lbD.textContent = it.dataset.desc || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function lbClose() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  items.forEach(function (it, i) {
    it.addEventListener("click", function () { lbOpen(i); });
  });
  lb.querySelector(".lb-close").addEventListener("click", lbClose);
  lb.querySelector(".lb-prev").addEventListener("click", function () { lbOpen(li - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { lbOpen(li + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbOpen(li - 1);
    if (e.key === "ArrowRight") lbOpen(li + 1);
  });

  /* ---------- slider bungalow ---------- */
  var sImgs = document.querySelectorAll("#bungalow .frame img");
  var sCount = document.querySelector("#bungalow .s-count");
  var si = 0;
  function sGo(k) {
    sImgs[si].classList.remove("on");
    si = (k + sImgs.length) % sImgs.length;
    sImgs[si].classList.add("on");
    sCount.textContent = (si + 1) + " / " + sImgs.length;
  }
  document.querySelector("#bungalow .s-prev").addEventListener("click", function () { sGo(si - 1); });
  document.querySelector("#bungalow .s-next").addEventListener("click", function () { sGo(si + 1); });

  /* ---------- slider bar ---------- */
  var brImgs = document.querySelectorAll("#bar .frame img");
  var brCount = document.querySelector("#bar .s-count");
  var bri = 0;
  function brGo(k) {
    brImgs[bri].classList.remove("on");
    bri = (k + brImgs.length) % brImgs.length;
    brImgs[bri].classList.add("on");
    brCount.textContent = (bri + 1) + " / " + brImgs.length;
  }
  document.querySelector("#bar .s-prev").addEventListener("click", function () { brGo(bri - 1); });
  document.querySelector("#bar .s-next").addEventListener("click", function () { brGo(bri + 1); });

  /* ---------- opinie ---------- */
  var quotes = document.querySelectorAll("#opinie .quote");
  var qIdx = document.querySelector("#opinie .q-idx");
  var qi = 0;
  function qGo(k) {
    quotes[qi].classList.remove("on");
    qi = (k + quotes.length) % quotes.length;
    quotes[qi].classList.add("on");
    qIdx.textContent = (qi + 1) + " — " + quotes.length;
  }
  document.querySelector("#opinie .q-prev").addEventListener("click", function () { qGo(qi - 1); });
  document.querySelector("#opinie .q-next").addEventListener("click", function () { qGo(qi + 1); });
  setInterval(function () { qGo(qi + 1); }, 8000);

  /* ---------- rezerwacja → e-mail ---------- */
  var form = document.getElementById("booking-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var body = [
      "Zapytanie o rezerwację ze strony www", "",
      "Przyjazd: " + f.get("arrival"),
      "Wyjazd: " + f.get("departure"),
      "Zakwaterowanie: " + f.get("room"),
      "Dorośli: " + f.get("adults"),
      "Dzieci: " + f.get("children"), "",
      "Imię i nazwisko: " + f.get("name"),
      "Telefon: " + f.get("phone"), "",
      "Wiadomość:",
      f.get("message") || "-"
    ].join("\n");
    window.location.href = "mailto:elstavita@elstavita.pl?subject=" +
      encodeURIComponent("Rezerwacja: " + f.get("arrival") + " do " + f.get("departure")) +
      "&body=" + encodeURIComponent(body);
  });

  /* ---------- rok ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
