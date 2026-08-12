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

  /* Drip player: a scrubbable 6am-to-midnight timeline. Dragging or
     pressing play moves a position (0-1) that drives the drip's tempo —
     slow at dawn, quickening toward a full pour around 6pm, slow again
     by midnight — and, once real audio is uploaded, the track itself. */
  document.querySelectorAll(".drip").forEach(function (drip) {
    var stage = drip.querySelector(".drip-stage");
    var playBtn = drip.querySelector(".drip-play");
    var timeline = drip.querySelector(".drip-timeline");
    var track = drip.querySelector(".drip-track");
    var fill = drip.querySelector(".drip-fill");
    var handle = drip.querySelector(".drip-handle");
    var clock = drip.querySelector(".drip-clock");
    var audio = drip.querySelector(".drip-audio");
    var statusEl = drip.querySelector(".drip-audio-status");
    if (!stage || !playBtn || !timeline || !track) return;

    var pos = 0; // 0 = 6:00am, 1 = 12:00am (18hr span)
    var playing = false;
    var dragging = false;
    var rafId = null;
    var startTime = null;
    var startPos = 0;
    var PLAY_DURATION_MS = 22000; // one full 6am-midnight sweep

    /* Audio: same missing-media contract as .media — a 404 source falls
       back gracefully, and the interactive mechanic works either way. */
    var audioReady = false;
    if (audio) {
      var markMissing = function () {
        audioReady = false;
        if (statusEl) statusEl.textContent = "(sound design in production)";
      };
      var markReady = function () { audioReady = true; };
      audio.addEventListener("error", markMissing);
      audio.querySelectorAll("source").forEach(function (s) {
        s.addEventListener("error", markMissing);
      });
      audio.addEventListener("loadedmetadata", markReady);
      /* Some browsers resolve an all-sources-failed state (networkState
         NETWORK_NO_SOURCE) without ever dispatching "error" on the
         element itself — poll once, shortly after load, as a fallback. */
      setTimeout(function () {
        if (!audioReady && audio.networkState === 3) markMissing();
      }, 1500);
    }

    function formatClock(t) {
      var totalMin = Math.round(t * 18 * 60); // 18hr span from 6am
      var h = 6 + Math.floor(totalMin / 60);
      var m = totalMin % 60;
      if (h >= 24) h -= 24;
      var period = h >= 12 ? "pm" : "am";
      var h12 = h % 12;
      if (h12 === 0) h12 = 12;
      return h12 + ":" + (m < 10 ? "0" : "") + m + period;
    }

    function tempoInterval(t) {
      var peak = 0.75;
      var d = t < peak ? (peak - t) / peak : (t - peak) / (1 - peak);
      d = Math.min(Math.max(d, 0), 1);
      var ms = 650 + (3400 - 650) * d;
      return ms / 1000;
    }

    function render(t) {
      pos = Math.min(Math.max(t, 0), 1);
      var pouring = pos >= 0.68 && pos <= 0.85;
      stage.style.setProperty("--pos", pos.toFixed(3));
      stage.style.setProperty("--drip-interval", tempoInterval(pos).toFixed(2) + "s");
      stage.classList.toggle("is-pouring", pouring);
      var pct = (pos * 100).toFixed(2) + "%";
      fill.style.width = pct;
      handle.style.left = pct;
      var label = formatClock(pos);
      clock.textContent = label;
      timeline.setAttribute("aria-valuenow", Math.round(pos * 100));
      timeline.setAttribute("aria-valuetext", label);
      if (audioReady && audio.duration && !playing) {
        audio.currentTime = pos * audio.duration;
      }
    }

    function stopPlayback() {
      playing = false;
      playBtn.classList.remove("is-playing");
      playBtn.setAttribute("aria-pressed", "false");
      stage.classList.remove("is-paused");
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      if (audioReady) audio.pause();
    }

    function step(now) {
      if (!playing) return;
      if (startTime === null) startTime = now;
      var elapsed = now - startTime;
      var remaining = 1 - startPos;
      var t = startPos + (elapsed / PLAY_DURATION_MS) * remaining;
      if (t >= 1) {
        render(1);
        stopPlayback();
        return;
      }
      render(t);
      rafId = requestAnimationFrame(step);
    }

    playBtn.addEventListener("click", function () {
      if (playing) {
        stopPlayback();
        return;
      }
      if (pos >= 0.995) render(0);
      playing = true;
      startTime = null;
      startPos = pos;
      playBtn.classList.add("is-playing");
      playBtn.setAttribute("aria-pressed", "true");
      if (audioReady) {
        audio.currentTime = pos * (audio.duration || 0);
        audio.play().catch(function () {});
      }
      rafId = requestAnimationFrame(step);
    });

    function posFromClientX(clientX) {
      var rect = track.getBoundingClientRect();
      var t = (clientX - rect.left) / rect.width;
      return Math.min(Math.max(t, 0), 1);
    }

    function beginDrag(clientX) {
      dragging = true;
      if (playing) stopPlayback();
      render(posFromClientX(clientX));
    }

    timeline.addEventListener("pointerdown", function (e) {
      beginDrag(e.clientX);
      timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
    });
    timeline.addEventListener("pointermove", function (e) {
      if (dragging) render(posFromClientX(e.clientX));
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
      timeline.addEventListener(evt, function () { dragging = false; });
    });

    timeline.addEventListener("keydown", function (e) {
      var step5 = 0.05;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { render(pos + step5); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { render(pos - step5); e.preventDefault(); }
      else if (e.key === "Home") { render(0); e.preventDefault(); }
      else if (e.key === "End") { render(1); e.preventDefault(); }
    });

    render(0);
  });
})();
