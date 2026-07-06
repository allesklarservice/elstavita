/* ELSTA VITA — interakcje i animacje */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var animOn = hasGsap && !reduceMotion;
  if (!animOn) document.documentElement.classList.add("anim-off");

  /* ---------- Lenis: płynny scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }

  function scrollToEl(target) {
    var el = document.querySelector(target);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---------- Preloader ---------- */
  var loader = document.getElementById("loader");
  var countEl = loader.querySelector(".l-count");
  var n = 0;
  var cnt = setInterval(function () {
    n = Math.min(100, n + Math.ceil(Math.random() * 14));
    countEl.textContent = n;
    if (n >= 100) {
      clearInterval(cnt);
      setTimeout(function () {
        loader.classList.add("done");
        heroIn();
        setTimeout(function () { loader.remove(); }, 1100);
      }, 250);
    }
  }, 70);

  /* ---------- Custom cursor ---------- */
  var cursor = document.getElementById("cursor");
  if (window.matchMedia("(hover: hover)").matches) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("on");
    });
    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .g-card figure, .am-row, .p-row").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add(el.matches(".g-card figure") ? "grow" : "grow-sm");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("grow", "grow-sm");
      });
    });
  }

  /* ---------- Menu fullscreen ---------- */
  var burger = document.getElementById("burger");
  burger.addEventListener("click", function () {
    document.body.classList.toggle("menu-open");
    if (lenis) document.body.classList.contains("menu-open") ? lenis.stop() : lenis.start();
  });
  // opóźnienia linków menu
  document.querySelectorAll("#menu .m-links a").forEach(function (a, i) {
    a.style.transitionDelay = (0.12 + i * 0.05) + "s";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.remove("menu-open");
      if (lenis) lenis.start();
      setTimeout(function () { scrollToEl(a.getAttribute("href")); }, 350);
    });
  });
  // pozostałe kotwice
  document.querySelectorAll('a[href^="#"]:not(#menu a)').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (href.length > 1) { e.preventDefault(); scrollToEl(href); }
    });
  });

  /* ---------- Hero: wejście linii ---------- */
  function heroIn() {
    if (!animOn) return;
    gsap.to(".hero h1 .line > span", {
      yPercent: 0, duration: 1.3, stagger: 0.09, ease: "power4.out", delay: 0.15
    });
    gsap.fromTo(".hero .kick, .hero .hero-foot",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.12, delay: 0.7, ease: "power3.out" });
  }
  if (animOn) {
    gsap.set(".hero h1 .line > span", { yPercent: 115 });
  }

  /* ---------- GSAP scroll animacje ---------- */
  if (animOn) {
    // hero parallax + zoom-out
    gsap.to(".hero .hero-bg", {
      yPercent: 14, scale: 1.0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    // generyczne wejścia
    gsap.utils.toArray(".rv").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // obrazki intro: odsłona + parallax wewnętrzny
    gsap.utils.toArray("#intro .imgs .im").forEach(function (im, i) {
      gsap.fromTo(im, { clipPath: "inset(100% 0 0 0)" }, {
        clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power4.inOut",
        scrollTrigger: { trigger: im, start: "top 85%" }
      });
      gsap.fromTo(im.querySelector("img"), { yPercent: -8, scale: 1.15 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: im, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // statystyki: odliczanie
    gsap.utils.toArray("#intro .stats b[data-to]").forEach(function (el) {
      var to = parseFloat(el.dataset.to);
      var suffix = el.dataset.suffix || "";
      var obj = { v: 0 };
      gsap.to(obj, {
        v: to, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
      });
    });

    // galeria pozioma (desktop)
    ScrollTrigger.matchMedia({
      "(min-width: 901px)": function () {
        var track = document.querySelector(".g-track");
        var dist = track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: -dist, ease: "none",
          scrollTrigger: {
            trigger: "#galeria .g-track-wrap",
            start: "top top",
            end: "+=" + dist,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }
    });

    // bar parallax
    gsap.fromTo("#bar .bar-bg", { yPercent: -10 }, {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: "#bar", start: "top bottom", end: "bottom top", scrub: true }
    });

    // stopka watermark
    gsap.fromTo("footer .f-watermark", { yPercent: 40 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: true }
    });
  }

  /* ---------- Bungalow: przełącznik zdjęć ---------- */
  var bImgs = document.querySelectorAll("#bungalow .frame img");
  var bCount = document.querySelector("#bungalow .count");
  var bi = 0;
  function bGo(k) {
    bImgs[bi].classList.remove("on");
    bi = (k + bImgs.length) % bImgs.length;
    bImgs[bi].classList.add("on");
    bCount.textContent = (bi + 1) + " / " + bImgs.length;
  }
  document.querySelector("#bungalow .b-prev").addEventListener("click", function () { bGo(bi - 1); });
  document.querySelector("#bungalow .b-next").addEventListener("click", function () { bGo(bi + 1); });
  setInterval(function () { bGo(bi + 1); }, 5200);

  /* ---------- Bar: miniatury ---------- */
  var barBg = document.querySelector("#bar .bar-bg");
  document.querySelectorAll("#bar .bar-thumbs img").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll("#bar .bar-thumbs img").forEach(function (x) { x.classList.remove("on"); });
      t.classList.add("on");
      barBg.style.backgroundImage = "url('" + t.dataset.full + "')";
    });
  });

  /* ---------- Opinie ---------- */
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
  setInterval(function () { qGo(qi + 1); }, 7000);

  /* ---------- Lightbox galerii ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".g-card"));
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img");
  var lbT = lb.querySelector(".lb-cap h4");
  var lbD = lb.querySelector(".lb-cap p");
  var li = 0;
  function lbOpen(k) {
    li = (k + cards.length) % cards.length;
    var c = cards[li];
    lbImg.src = c.querySelector("img").src;
    lbT.textContent = c.dataset.title || "";
    lbD.textContent = c.dataset.desc || "";
    lb.classList.add("open");
    if (lenis) lenis.stop();
  }
  function lbClose() {
    lb.classList.remove("open");
    if (lenis) lenis.start();
  }
  cards.forEach(function (c, k) {
    c.querySelector("figure").addEventListener("click", function () { lbOpen(k); });
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

  /* ---------- Magnetyczny przycisk ---------- */
  if (window.matchMedia("(hover: hover)").matches && animOn) {
    document.querySelectorAll(".btn-big").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, {
          x: (e.clientX - r.left - r.width / 2) * 0.3,
          y: (e.clientY - r.top - r.height / 2) * 0.4,
          duration: 0.4
        });
      });
      b.addEventListener("mouseleave", function () {
        gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  /* ---------- Formularz rezerwacji → e-mail ---------- */
  var bookingForm = document.getElementById("booking-form");
  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(bookingForm);
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

  /* ---------- Rok ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
