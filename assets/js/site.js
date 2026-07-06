/* ELSTA VITA — wspólny skrypt wariantów (defensywny: każdy moduł działa tylko, gdy elementy istnieją) */
(function () {
  "use strict";

  /* header: klasa po przewinięciu */
  var header = document.getElementById("site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  /* menu mobilne */
  var burger = document.getElementById("burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
    document.querySelectorAll("#mobile-menu a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  /* wejścia sekcji */
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".rv").forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("visible"); });
  }

  /* slidery fade (bungalow / bar): .slider > .frame > img, .s-prev/.s-next/.s-count */
  document.querySelectorAll(".slider").forEach(function (sl) {
    var imgs = sl.querySelectorAll(".frame img");
    var count = sl.querySelector(".s-count");
    var prev = sl.querySelector(".s-prev");
    var next = sl.querySelector(".s-next");
    if (!imgs.length) return;
    var i = 0;
    function go(k) {
      imgs[i].classList.remove("on");
      i = (k + imgs.length) % imgs.length;
      imgs[i].classList.add("on");
      if (count) count.textContent = (i + 1) + " / " + imgs.length;
    }
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });
  });

  /* galeria: pasek scroll-snap (.g-strip + .g-prev/.g-next + .g-count) */
  var strip = document.querySelector(".g-strip");
  if (strip) {
    var sItems = Array.prototype.slice.call(strip.querySelectorAll(".g-item"));
    var gCount = document.querySelector(".g-count");
    var gPrev = document.querySelector(".g-prev");
    var gNext = document.querySelector(".g-next");
    function step() {
      var gap = parseFloat(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 16;
      return sItems[0].getBoundingClientRect().width + gap;
    }
    if (gPrev) gPrev.addEventListener("click", function () { strip.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (gNext) gNext.addEventListener("click", function () { strip.scrollBy({ left: step(), behavior: "smooth" }); });
    if (gCount) {
      var tick = false;
      strip.addEventListener("scroll", function () {
        if (tick) return;
        tick = true;
        requestAnimationFrame(function () {
          var c = strip.scrollLeft + strip.clientWidth / 2;
          var best = 0, bd = Infinity;
          sItems.forEach(function (it, k) {
            var d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - c);
            if (d < bd) { bd = d; best = k; }
          });
          gCount.textContent = (best + 1) + " / " + sItems.length;
          tick = false;
        });
      }, { passive: true });
    }
  }

  /* lightbox: wszystkie .g-item na stronie */
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var lb = document.getElementById("lightbox");
  if (lb && items.length) {
    var lbImg = lb.querySelector("img");
    var lbT = lb.querySelector(".lb-cap h4");
    var lbD = lb.querySelector(".lb-cap p");
    var li = 0;
    function lbOpen(k) {
      li = (k + items.length) % items.length;
      var it = items[li];
      lbImg.src = it.querySelector("img").src;
      if (lbT) lbT.textContent = it.dataset.title || "";
      if (lbD) lbD.textContent = it.dataset.desc || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function lbClose() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
    items.forEach(function (it, k) { it.addEventListener("click", function () { lbOpen(k); }); });
    var c1 = lb.querySelector(".lb-close"), p1 = lb.querySelector(".lb-prev"), n1 = lb.querySelector(".lb-next");
    if (c1) c1.addEventListener("click", lbClose);
    if (p1) p1.addEventListener("click", function () { lbOpen(li - 1); });
    if (n1) n1.addEventListener("click", function () { lbOpen(li + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowLeft") lbOpen(li - 1);
      if (e.key === "ArrowRight") lbOpen(li + 1);
    });
  }

  /* opinie */
  var quotes = document.querySelectorAll("#opinie .quote");
  if (quotes.length) {
    var qIdx = document.querySelector("#opinie .q-idx");
    var qi = 0;
    function qGo(k) {
      quotes[qi].classList.remove("on");
      qi = (k + quotes.length) % quotes.length;
      quotes[qi].classList.add("on");
      if (qIdx) qIdx.textContent = (qi + 1) + " — " + quotes.length;
    }
    var qp = document.querySelector("#opinie .q-prev"), qn = document.querySelector("#opinie .q-next");
    if (qp) qp.addEventListener("click", function () { qGo(qi - 1); });
    if (qn) qn.addEventListener("click", function () { qGo(qi + 1); });
    setInterval(function () { qGo(qi + 1); }, 8000);
  }

  /* rezerwacja → e-mail */
  var form = document.getElementById("booking-form");
  if (form) {
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
  }

  /* rok */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
