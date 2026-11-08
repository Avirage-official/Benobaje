/* AFROJUNIOR — Creative page: only load and play the reel once it scrolls into view. */
(function () {
  "use strict";
  var v = document.querySelector("video[data-autoplay]");
  if (!v) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { v.controls = true; v.preload = "metadata"; return; }
  if (!("IntersectionObserver" in window)) { v.play(); return; }
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.25 }).observe(v);
})();
