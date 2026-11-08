/* AFROJUNIOR — Events page: the run sheet lights up row by row as you scroll toward doors. */
(function () {
  "use strict";
  /* Live Singapore clock + time until 8pm doors */
  var t = document.querySelector("[data-sg]"), to = document.querySelector("[data-doors]");
  var tick = function () {
    if (!t) return;
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var h = +parts.find(function (p) { return p.type === "hour"; }).value % 24, m = +parts.find(function (p) { return p.type === "minute"; }).value;
    t.textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
    var now = h * 60 + m, doors = 20 * 60, call = 16 * 60;
    var fmt = function (mins) { var hh = Math.floor(mins / 60), mm = mins % 60; return (hh ? hh + "h " : "") + mm + "m"; };
    if (now < call) to.innerHTML = "Crew call in <b>" + fmt(call - now) + "</b>. Doors at 20:00.";
    else if (now < doors) to.innerHTML = "On site. <b>" + fmt(doors - now) + "</b> to doors.";
    else to.innerHTML = "<b>Doors are open.</b> Go have fun.";
  };
  tick(); setInterval(tick, 20000);

  var rows = document.querySelectorAll(".run-row");
  if (!rows.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    rows.forEach(function (r) { r.classList.add("on"); });
    return;
  }
  var onScroll = function () {
    var line = window.innerHeight * 0.72;
    rows.forEach(function (r) { r.classList.toggle("on", r.getBoundingClientRect().top < line); });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
