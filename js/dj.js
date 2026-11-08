/* AFROJUNIOR — DJ page extras: waveform + the mix meter that never quite finishes. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Waveform bars with varied speeds, so it reads as audio rather than a pattern */
  var wave = document.querySelector(".wave");
  if (wave) {
    var n = window.innerWidth < 700 ? 40 : 96, html = "";
    for (var i = 0; i < n; i++) {
      var d = (0.6 + Math.random() * 1.2).toFixed(2), dl = (-Math.random() * 2).toFixed(2);
      html += '<i style="--d:' + d + "s;--dl:" + dl + 's"></i>';
    }
    wave.innerHTML = html;
  }

  /* Mix meter: fills to its target, then drifts a point or two. Never hits 100. */
  var meter = document.querySelector(".dj-meter");
  if (meter) {
    var target = +meter.getAttribute("aria-valuenow") || 70;
    var bar = meter.querySelector(".dj-meter-bar i"), num = meter.querySelector("[data-meter]");
    var set = function (v) { bar.style.setProperty("--p", v + "%"); num.textContent = v; meter.setAttribute("aria-valuenow", v); };
    setTimeout(function () {
      if (reduce) { set(target); return; }
      var t0 = performance.now();
      var step = function (t) {
        var p = Math.min(1, (t - t0) / 1600);
        set(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setInterval(function () { set(Math.max(target - 2, Math.min(target + 3, target + Math.round(Math.random() * 5 - 2)))); }, 3200);
    }, 900);
  }
})();
