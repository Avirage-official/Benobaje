/* AFROJUNIOR — homepage motion. No libraries. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Intro: let fonts land, then drop the letters in */
  var ready = function () {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    setTimeout(function () { chars.forEach(function (c) { c.style.transitionDelay = "0s"; }); }, 2000);
  };
  var chars = document.querySelectorAll(".hero-word .ch");
  chars.forEach(function (c, i) { c.style.transitionDelay = (0.05 * i + 0.1) + "s"; });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(function () { requestAnimationFrame(ready); });
  setTimeout(ready, 1500); // never hold the page hostage to a font

  /* Singapore clock */
  var clock = document.querySelector("[data-clock]");
  var tick = function () {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Singapore", hour: "2-digit", minute: "2-digit"
    });
  };
  tick(); setInterval(tick, 15000);
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Hero: letters stretch toward the cursor (variable-font width axis) */
  if (fine && !reduce) {
    var mx = -9999, my = -9999, raf = 0;
    var stretch = function () {
      raf = 0;
      chars.forEach(function (c) {
        var r = c.getBoundingClientRect();
        var dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / 420);
        c.style.setProperty("--w", (62 + 63 * k * k).toFixed(1));
        c.classList.toggle("is-hot", k > 0.75);
      });
    };
    document.querySelector(".hero").addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(stretch);
    });
    document.querySelector(".hero").addEventListener("mouseleave", function () {
      mx = my = -9999; requestAnimationFrame(stretch);
    });
  }

  /* Roles: preview follows the cursor with a little lag and lean */
  var peek = document.querySelector(".peek");
  var peekIn = peek && peek.querySelector(".peek-in");
  if (peek && fine) {
    var cache = {};
    var tx = 0, ty = 0, px = 0, py = 0, running = false;
    var mediaFor = function (src) {
      if (!cache[src]) {
        var el;
        if (/\.mp4$/.test(src)) {
          el = document.createElement("video");
          el.muted = true; el.loop = true; el.playsInline = true; el.preload = "metadata";
        } else {
          el = document.createElement("img"); el.alt = "";
        }
        el.src = src;
        cache[src] = el;
      }
      return cache[src];
    };
    var loop = function () {
      px += (tx - px) * 0.14; py += (ty - py) * 0.14;
      var lean = Math.max(-12, Math.min(12, (tx - px) * 0.08));
      peek.style.transform = "translate3d(" + (px - 140) + "px," + (py - 175) + "px,0) rotate(" + lean + "deg)";
      if (running) requestAnimationFrame(loop);
    };
    document.querySelectorAll(".role").forEach(function (row) {
      row.addEventListener("mouseenter", function (e) {
        var m = mediaFor(row.getAttribute("data-media"));
        peekIn.innerHTML = ""; peekIn.appendChild(m);
        if (m.play) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
        tx = px = e.clientX; ty = py = e.clientY;
        peek.classList.add("is-on");
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
      row.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
      row.addEventListener("mouseleave", function () {
        peek.classList.remove("is-on");
        var v = peekIn.querySelector("video"); if (v) v.pause();
        setTimeout(function () { if (!peek.classList.contains("is-on")) running = false; }, 500);
      });
    });
  }

  /* Statement: words light up as it scrolls through the viewport */
  var words = document.querySelectorAll(".line-txt .w");
  var line = document.querySelector(".line-txt");
  if (words.length && line && !reduce) {
    var onScroll = function () {
      var r = line.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var n = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
