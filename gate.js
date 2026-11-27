/* Runs before first paint: decides whether the home-page intro plays (once per visit, never for reduced motion). */
(function () {
  var h = document.documentElement, seen = null;
  try { seen = sessionStorage.getItem("edm-intro"); } catch (e) {}
  if (!h.hasAttribute("data-intro") || seen || matchMedia("(prefers-reduced-motion: reduce)").matches) { h.classList.add("no-intro"); return; }
  h.classList.add("intro-on");
  setTimeout(function () { h.classList.remove("intro-on"); }, 8900);
})();
