/* BEN OBAJE — site behaviour: nav, reveals, media placeholders */

(function () {
  "use strict";

  /* Header background on scroll */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  var btn = document.querySelector(".menu-btn");
  var overlay = document.querySelector(".nav-overlay");
  if (btn && overlay) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      overlay.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        btn.setAttribute("aria-expanded", "false");
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* Scroll reveals */
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealed.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* Media slots: mark figures whose image is present; hide broken images so
     the styled placeholder (with its upload path) shows through. */
  document.querySelectorAll(".media img").forEach(function (img) {
    var fig = img.closest(".media");
    var markLoaded = function () { fig && fig.classList.add("is-loaded"); };
    var markMissing = function () { img.classList.add("is-missing"); };
    if (img.complete) {
      img.naturalWidth > 0 ? markLoaded() : markMissing();
    } else {
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markMissing);
    }
  });

  /* Video slots: same contract as images — hide a missing video so the
     placeholder (with its upload path) shows through. */
  document.querySelectorAll(".media video").forEach(function (v) {
    var fig = v.closest(".media");
    var fail = function () { v.classList.add("is-missing"); };
    v.addEventListener("error", fail);
    v.querySelectorAll("source").forEach(function (s) {
      s.addEventListener("error", fail);
    });
    v.addEventListener("loadeddata", function () {
      fig && fig.classList.add("is-loaded");
    });
    if (v.readyState >= 2) fig && fig.classList.add("is-loaded");
  });

  document.querySelectorAll(".media iframe").forEach(function (f) {
    var fig = f.closest(".media");
    fig && fig.classList.add("is-loaded");
  });

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
