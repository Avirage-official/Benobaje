/* AFROJUNIOR — music page motion. No libraries. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Intro */
  var chars = document.querySelectorAll(".m-title .ch");
  chars.forEach(function (c, i) { c.style.transitionDelay = (0.035 * i + 0.1) + "s"; });
  var ready = function () {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(function () { requestAnimationFrame(ready); });
  setTimeout(ready, 1500);

  /* Clock + year */
  var clock = document.querySelector("[data-clock]");
  var tick = function () {
    if (clock) clock.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Singapore", hour: "2-digit", minute: "2-digit" });
  };
  tick(); setInterval(tick, 15000);
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Images with a fallback: drop the real file in and it takes over */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    var swap = function () { img.onerror = null; img.src = img.getAttribute("data-fallback"); };
    if (img.complete && img.naturalWidth === 0) swap(); else img.onerror = swap;
  });

  /* Load the first existing file from a "a|b|c" list */
  var resolve = function (list, done, i) {
    i = i || 0;
    if (i >= list.length) { done(null); return; }
    var img = new Image();
    img.onload = function () { done(img); };
    img.onerror = function () { resolve(list, done, i + 1); };
    img.src = list[i];
  };

  /* Scroll-in */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 }) : null;
  var watch = function (el) { if (io && !reduce) io.observe(el); else el.classList.add("in"); };
  document.querySelectorAll(".up").forEach(watch);

  /* Count-up numbers */
  var counters = document.querySelectorAll("[data-count]");
  var runCount = function (el) {
    var end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "", pad = +el.getAttribute("data-pad") || 0;
    var fmt = function (v) { var s = String(Math.round(v)); while (s.length < pad) s = "0" + s; return s + suf; };
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = performance.now(), dur = 1400;
    var step = function (t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(runCount);

  /* YouTube: load the player only when asked */
  document.querySelectorAll(".yt[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + btn.getAttribute("data-yt") + "?autoplay=1&rel=0";
      f.title = "AfroJunior on YouTube";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      btn.innerHTML = ""; btn.appendChild(f); btn.style.cursor = "default";
    }, { once: true });
  });

  /* Rooms: cursor-following photo, only when a photo exists */
  var peek = document.querySelector(".peek"), peekIn = peek && peek.querySelector(".peek-in");
  if (peek && fine) {
    var tx = 0, ty = 0, px = 0, py = 0, running = false;
    var loop = function () {
      px += (tx - px) * 0.14; py += (ty - py) * 0.14;
      var lean = Math.max(-12, Math.min(12, (tx - px) * 0.08));
      peek.style.transform = "translate3d(" + (px - 140) + "px," + (py - 175) + "px,0) rotate(" + lean + "deg)";
      if (running) requestAnimationFrame(loop);
    };
    document.querySelectorAll(".room[data-media]").forEach(function (row) {
      resolve(row.getAttribute("data-media").split("|"), function (img) { row._media = img; });
      row.addEventListener("mouseenter", function (e) {
        if (!row._media) return;
        peekIn.innerHTML = ""; peekIn.appendChild(row._media);
        tx = px = e.clientX; ty = py = e.clientY;
        peek.classList.add("is-on");
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
      row.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
      row.addEventListener("mouseleave", function () {
        peek.classList.remove("is-on");
        setTimeout(function () { if (!peek.classList.contains("is-on")) running = false; }, 500);
      });
    });
  }

  /* Hire tiles: fill spreads from where the cursor enters */
  document.querySelectorAll(".hire").forEach(function (a) {
    a.addEventListener("mouseenter", function (e) {
      var r = a.getBoundingClientRect();
      a.style.setProperty("--x", (e.clientX - r.left) + "px");
      a.style.setProperty("--y", (e.clientY - r.top) + "px");
    });
  });

  /* Gallery. Any photo uploaded to the gallery folder shows up, whatever
     its name (read from GitHub's public folder listing, sorted by name).
     If that can't be reached it falls back to gallery-01.jpg, -02 … and
     finally to the homepage photos. */
  var gal = document.querySelector(".gal[data-folder]");
  var photos = [];
  if (gal) {
    var folder = gal.getAttribute("data-folder");
    var add = function (src) {
      var i = photos.length;
      photos.push(src);
      var b = document.createElement("button");
      b.type = "button"; b.className = "gal-item";
      b.setAttribute("aria-label", "Open photo " + (i + 1));
      var img = document.createElement("img");
      img.src = src; img.alt = ""; img.loading = "lazy";
      b.appendChild(img);
      b.addEventListener("click", function () { openLb(i); });
      gal.appendChild(b);
      watch(b);
    };
    var useFallback = function () {
      (gal.getAttribute("data-fallback") || "").split("|").forEach(function (s) { if (s) add(s); });
    };
    var probe = function (n) {
      var base = folder + "/gallery-", num = (n < 10 ? "0" : "") + n;
      resolve([base + num + ".jpg", base + num + ".jpeg", base + num + ".png", base + num + ".webp"], function (img) {
        if (img) { add(img.src); probe(n + 1); }
        else if (n === 1) useFallback();
      });
    };
    var fromList = function (names) {
      var pics = names.filter(function (n) { return /\.(jpe?g|png|webp|avif|gif)$/i.test(n); })
        .sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }); });
      if (!pics.length) return false;
      pics.forEach(function (n) { add(folder + "/" + encodeURIComponent(n)); });
      return true;
    };
    var key = "aj-gallery:" + folder, cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) {}
    if (cached && fromList(cached)) {
      /* served from this visit's cache */
    } else if (window.fetch && gal.getAttribute("data-repo")) {
      fetch("https://api.github.com/repos/" + gal.getAttribute("data-repo") + "/contents/" + folder)
        .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
        .then(function (items) {
          var names = items.filter(function (it) { return it.type === "file"; }).map(function (it) { return it.name; });
          var ok = fromList(names);
          /* only remember a list that actually has photos, so new uploads show up */
          if (ok) { try { sessionStorage.setItem(key, JSON.stringify(names)); } catch (e) {} }
          else probe(1);
        })
        .catch(function () { probe(1); });
    } else probe(1);
  }

  /* Lightbox */
  var lb = document.querySelector(".lb"), lbImg = lb && lb.querySelector(".lb-img"), lbCount = lb && lb.querySelector(".lb-count");
  var cur = 0, lastFocus = null;
  var show = function (i) {
    cur = (i + photos.length) % photos.length;
    lbImg.src = photos[cur];
    lbCount.textContent = (cur + 1) + " / " + photos.length;
  };
  var openLb = function (i) {
    if (!lb) return;
    lastFocus = document.activeElement;
    show(i); lb.hidden = false; document.body.style.overflow = "hidden";
    lb.querySelector(".lb-x").focus();
  };
  var closeLb = function () {
    lb.hidden = true; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  if (lb) {
    lb.querySelector(".lb-x").addEventListener("click", closeLb);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }
})();
