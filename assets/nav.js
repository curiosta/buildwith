// buildwith: shared page script. Mobile nav block copied from kinetic-tools/build/nav-mobile.js.
document.documentElement.classList.add("js");
  // ---------- MOBILE NAV: edge fades + keep the active link in view ----------
  (function () {
    const snav = document.querySelector(".sectionnav");
    if (!snav) return;
    const fades = () => {
      const max = snav.scrollWidth - snav.clientWidth;
      snav.classList.toggle("fade-l", max > 4 && snav.scrollLeft > 4);
      snav.classList.toggle("fade-r", max > 4 && snav.scrollLeft < max - 4);
    };
    snav.addEventListener("scroll", fades, { passive: true });
    window.addEventListener("resize", fades);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fades);
    fades();
    const keep = () => {
      const a = snav.querySelector("a.active");
      if (!a || snav.scrollWidth <= snav.clientWidth + 4) return;
      const r = a.getBoundingClientRect(), n = snav.getBoundingClientRect();
      if (r.left < n.left + 16 || r.right > n.right - 40) snav.scrollBy({ left: r.left - n.left - 20, behavior: "smooth" });
    };
    if ("MutationObserver" in window) {
      const mo = new MutationObserver(keep);
      snav.querySelectorAll("a").forEach(a => mo.observe(a, { attributes: true, attributeFilter: ["class"] }));
    }
  })();
