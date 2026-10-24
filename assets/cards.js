// buildwith: experience cards re-check "next date" and "next deadline" against the visitor's day. The page is built with the
// build day's view (correct without JavaScript); if the visitor's day is later, the next dates are picked again from the
// candidates in each card's data-when. Same rule as build.py: earliest month, dated before month-only, then earliest start.
(function () {
  "use strict";
  const pad = n => String(n).padStart(2, "0"), N = new Date();
  const TODAY = N.getFullYear() + "-" + pad(N.getMonth() + 1) + "-" + pad(N.getDate());
  const pick = (cs, k) => cs.filter(c => c.k === k && c.e >= TODAY)
    .sort((a, b) => (a.s.slice(0, 7) < b.s.slice(0, 7) ? -1 : a.s.slice(0, 7) > b.s.slice(0, 7) ? 1 : (a.t - b.t) || (a.s < b.s ? -1 : a.s > b.s ? 1 : 0)))[0];
  function span(c) {
    const s = document.createElement("span");
    s.appendChild(document.createTextNode(c.k === "d" ? "⏰ " : "📅 "));
    if (c.t) {
      const m = document.createElement("mark"); m.className = "flag"; m.textContent = "TBC"; s.appendChild(m);
      s.appendChild(document.createTextNode((c.k === "d" ? " date" : " dates") + " not announced yet, usually " + c.l));
    } else s.appendChild(document.createTextNode(c.l));
    if (c.k === "d") s.appendChild(document.createTextNode(": " + c.n));
    return s;
  }
  document.querySelectorAll(".when[data-when]").forEach(w => {
    let cs; try { cs = JSON.parse(w.dataset.when); } catch (_) { return; }
    const first = cs.find(c => c.e < TODAY); if (!first && cs.length) return;    // nothing in the candidates has ended: the build-day pick still holds
    const picks = [pick(cs, "e"), pick(cs, "d")].filter(Boolean);
    w.textContent = "";
    if (!picks.length) { const s = document.createElement("span"); s.textContent = "No upcoming date in our sources"; w.appendChild(s); return; }
    picks.forEach(c => w.appendChild(span(c)));
  });
})();
