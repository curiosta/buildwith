// Nomad homepage: "Coming up" re-checked against the visitor's date. The page is built with the build day's view
// (correct without JavaScript); here ended items are dropped, statuses updated and the first N still to come are shown.
(function () {
  "use strict";
  const list = document.getElementById("home-next"); if (!list) return;
  const pad = n => String(n).padStart(2, "0"), N = new Date();
  const TODAY = N.getFullYear() + "-" + pad(N.getMonth() + 1) + "-" + pad(N.getDate());
  const SHOW = +list.dataset.show || 5; let shown = 0;
  Array.from(list.querySelectorAll(".evi")).forEach(li => {
    const dl = li.dataset.kind === "deadline", s = li.querySelector(".status");
    if (li.dataset.end < TODAY) { li.remove(); return; }
    const now = li.dataset.start <= TODAY;
    s.className = "status stw-" + (now ? "now" : dl ? "dl" : "up");
    s.textContent = now ? (dl ? "Deadline open" : "On now") : (dl ? "Deadline" : "Upcoming");
    li.hidden = shown >= SHOW; if (!li.hidden) shown++;
  });
  if (!shown) { const p = document.createElement("li"); p.className = "evnone"; p.textContent = "Nothing listed here yet: the full calendar has every upcoming date."; list.appendChild(p); }
})();
