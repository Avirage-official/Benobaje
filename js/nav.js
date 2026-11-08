/* AFROJUNIOR — phone menu (shared by every page). */
(function () {
  "use strict";
  var btn = document.querySelector(".hd-menu"), nav = document.getElementById("mnav");
  if (!btn || !nav) return;
  var x = nav.querySelector(".mnav-x");
  var open = function () {
    nav.hidden = false;
    requestAnimationFrame(function () { nav.classList.add("is-open"); });
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    x.focus();
  };
  var close = function () {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function () { if (!nav.classList.contains("is-open")) nav.hidden = true; }, 600);
    btn.focus();
  };
  btn.addEventListener("click", open);
  x.addEventListener("click", close);
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("is-open"); document.body.style.overflow = ""; }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) close(); });
})();
