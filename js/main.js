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

  /* Shared av-player: a scrubbable 0-1 position, driven by dragging the
     timeline or pressing play (which sweeps it over playDurationMs). Each
     concept supplies its own renderStage()/formatLabel() for what that
     position actually means and looks like; audio is optional and, once
     a real file is uploaded, syncs to the same position automatically. */
  function initAvPlayer(root, opts) {
    var playBtn = root.querySelector(".player-play");
    var timeline = root.querySelector(".player-timeline");
    var track = root.querySelector(".player-track");
    var fill = root.querySelector(".player-fill");
    var handle = root.querySelector(".player-handle");
    var label = root.querySelector(".player-label");
    var audio = root.querySelector(".player-audio");
    var statusEl = root.querySelector(".player-audio-status");
    if (!playBtn || !timeline || !track) return;

    var pos = 0;
    var playing = false;
    var dragging = false;
    var rafId = null;
    var startTime = null;
    var startPos = 0;
    var playDurationMs = opts.playDurationMs || 20000;

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

    function render(t) {
      pos = Math.min(Math.max(t, 0), 1);
      var pct = (pos * 100).toFixed(2) + "%";
      fill.style.width = pct;
      handle.style.left = pct;
      var text = opts.formatLabel(pos);
      if (label) label.textContent = text;
      timeline.setAttribute("aria-valuenow", Math.round(pos * 100));
      timeline.setAttribute("aria-valuetext", text);
      if (opts.renderStage) opts.renderStage(pos);
      if (audioReady && audio.duration && !playing) {
        audio.currentTime = pos * audio.duration;
      }
    }

    function stopPlayback() {
      playing = false;
      playBtn.classList.remove("is-playing");
      playBtn.setAttribute("aria-pressed", "false");
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      if (audioReady) audio.pause();
    }

    function step(now) {
      if (!playing) return;
      if (startTime === null) startTime = now;
      var elapsed = now - startTime;
      var remaining = 1 - startPos;
      var t = startPos + (elapsed / playDurationMs) * remaining;
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
  }

  /* Concept 001 — the drip: slow at dawn, quickening to a full pour
     around 6pm, slow again by midnight. */
  function dripFormatClock(t) {
    var totalMin = Math.round(t * 18 * 60); // 18hr span from 6am
    var h = 6 + Math.floor(totalMin / 60);
    var m = totalMin % 60;
    if (h >= 24) h -= 24;
    var period = h >= 12 ? "pm" : "am";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + period;
  }

  function dripTempoInterval(t) {
    var peak = 0.75;
    var d = t < peak ? (peak - t) / peak : (t - peak) / (1 - peak);
    d = Math.min(Math.max(d, 0), 1);
    return (650 + (3400 - 650) * d) / 1000;
  }

  document.querySelectorAll(".drip").forEach(function (drip) {
    var stage = drip.querySelector(".drip-stage");
    if (!stage) return;
    initAvPlayer(drip, {
      playDurationMs: 22000,
      formatLabel: dripFormatClock,
      renderStage: function (pos) {
        var pouring = pos >= 0.68 && pos <= 0.85;
        stage.style.setProperty("--pos", pos.toFixed(3));
        stage.style.setProperty("--drip-interval", dripTempoInterval(pos).toFixed(2) + "s");
        stage.classList.toggle("is-pouring", pouring);
      }
    });
  });

  /* Concept 002 — the tuner: dragging toward "Signal" thins out a field
     of trend-noise pills, one by one, until a single quiet line is all
     that's left. */
  document.querySelectorAll(".tuner").forEach(function (tuner) {
    var stage = tuner.querySelector(".tuner-stage");
    if (!stage) return;
    var pills = Array.prototype.slice.call(stage.querySelectorAll(".tuner-pill"));
    var n = pills.length;
    var fadeWidth = 0.16;

    initAvPlayer(tuner, {
      playDurationMs: 9000,
      formatLabel: function (pos) {
        var count = Math.round(27 - 26 * pos);
        return count <= 1 ? "1 signal" : count + " signals";
      },
      renderStage: function (pos) {
        pills.forEach(function (pill, i) {
          var threshold = 0.08 + i * (0.7 / Math.max(n - 1, 1));
          var opacity = pos <= threshold ? 0.85 : Math.max(0, 0.85 * (1 - (pos - threshold) / fadeWidth));
          pill.style.opacity = opacity.toFixed(2);
        });
        stage.classList.toggle("is-tuned-in", pos >= 0.55);
      }
    });
  });

  /* Concept 002 deck — a decaying stat counts down once, on first view,
     while its "holds" counterpart next to it deliberately never moves. */
  document.querySelectorAll(".vdeck-stat-num[data-count-to]").forEach(function (el) {
    var from = parseInt(el.getAttribute("data-count-from"), 10);
    var to = parseInt(el.getAttribute("data-count-to"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (!("IntersectionObserver" in window)) {
      el.textContent = to + suffix;
      return;
    }
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || done) return;
        done = true;
        io.disconnect();
        var start = null;
        var durationMs = 1200;
        function step(ts) {
          if (start === null) start = ts;
          var t = Math.min((ts - start) / durationMs, 1);
          el.textContent = Math.round(from + (to - from) * t) + suffix;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });
})();
