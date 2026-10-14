// buildwith calendar (/calendar/), redesigned 14 Oct 2026 after kinetic.curiosta.com/calendar/:
// one "Coming up" list in date order grouped by month, ended editions folded under "Already held", one continent chip row.
// The page is fully server-rendered; this script only re-checks status against today's date, filters, and copies the subscribe link.
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const D = JSON.parse(document.getElementById("bw-events").textContent);
  const NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const pad = n => String(n).padStart(2, "0"), N = new Date();
  const TODAY = N.getFullYear() + "-" + pad(N.getMonth() + 1) + "-" + pad(N.getDate()), YM = TODAY.slice(0, 7);
  const up = $("#evup"), pastList = $("#evpastlist"), held = $("#held");
  const setStatus = (li, cls, word) => { const s = $(".status", li); s.className = "status stw-" + cls; s.textContent = word; };
  // ---------- status by today's date; regroup Coming up by month ----------
  $$(".evi", up).forEach(li => {
    const dl = li.dataset.kind === "deadline";
    if (li.dataset.tbc) {
      if (li.dataset.lastMonth < YM) { setStatus(li, "ended", "Not confirmed"); li.classList.add("isp"); pastList.appendChild(li); }
      return;
    }
    if (li.dataset.end < TODAY) { setStatus(li, "ended", dl ? "Deadline passed" : "Ended"); li.classList.add("isp"); pastList.appendChild(li); }
    else if (li.dataset.start <= TODAY) setStatus(li, "now", dl ? "Deadline open" : "On now");
  });
  const ymOf = li => li.dataset.tbc ? null : (li.dataset.start < TODAY ? YM : li.dataset.start.slice(0, 7));
  const items = $$(".evi", up), monthOf = new Map();
  items.forEach(li => { const g = li.closest(".evmon").dataset.ym; monthOf.set(li, ymOf(li) || (g < YM ? YM : g)); });
  items.sort((a, b) => { const x = monthOf.get(a), y = monthOf.get(b); if (x !== y) return x < y ? -1 : 1;
    const sa = a.dataset.start || "9", sb = b.dataset.start || "9"; return sa < sb ? -1 : sa > sb ? 1 : 0; });
  up.innerHTML = ""; let cur = null, ul = null;
  items.forEach(li => { const ym = monthOf.get(li);
    if (ym !== cur) { cur = ym; const g = document.createElement("li"); g.className = "evmon" + (ym === YM ? " now" : ""); g.dataset.ym = ym;
      g.innerHTML = "<h3 class=\"h4\">" + NAMES[+ym.slice(5) - 1] + " " + ym.slice(0, 4) + "</h3><ul></ul>"; up.appendChild(g); ul = $("ul", g); }
    ul.appendChild(li); });
  $$(".evi", pastList).sort((a, b) => (b.dataset.end || b.dataset.lastMonth + "-99").localeCompare(a.dataset.end || a.dataset.lastMonth + "-99")).forEach(li => pastList.appendChild(li));
  // ---------- continent filter (URL: ?continent=Asia) ----------
  const chips = $$("#cal-controls .chip"), conts = chips.map(c => c.dataset.c);
  let C = new URLSearchParams(location.search).get("continent") || ""; if (!conts.includes(C)) C = "";
  function render() {
    chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.c === C)));
    const ok = li => !C || li.dataset.continents.split(" ").includes(C);
    $$(".evi", up).forEach(li => { li.hidden = !ok(li); });
    $$(".evmon", up).forEach(m => { m.hidden = !$$(".evi", m).some(li => !li.hidden); });
    const nUp = $$(".evi", up).filter(li => !li.hidden).length, past = $$(".evi", pastList);
    past.forEach(li => { li.hidden = !ok(li); }); const nP = past.filter(li => !li.hidden).length;
    $("#pcount").textContent = nP; held.hidden = !nP; $("#evnone").hidden = nUp > 0;
    $("#st-up").textContent = $$(".evi", up).length; $("#st-past").textContent = past.length;
    $("#cal-count").textContent = (C ? C + ": " : "") + nUp + " coming up · " + nP + " already held";
    const p = new URLSearchParams(location.search); ["m", "view", "past", "hide", "country"].forEach(k => p.delete(k));
    C ? p.set("continent", C) : p.delete("continent");
    const q = p.toString(); history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
  }
  chips.forEach(c => c.addEventListener("click", () => { C = c.dataset.c; render(); }));
  if (location.hash === "#held") held.open = true;
  window.addEventListener("hashchange", () => { if (location.hash === "#held") held.open = true; });
  $("#cal-controls").hidden = false; render();
  // ---------- subscribe: inline "Copy link" (kinetic pattern, no pop-up) ----------
  $$(".subs").forEach(box => { const b = $(".subs-copy", box), msg = $(".subs-msg", box); if (!b) return; b.hidden = false;
    b.addEventListener("click", () => { const url = b.dataset.url;
      const done = () => { msg.textContent = "Copied. In Google Calendar: Other calendars → From URL, then paste."; }, fail = () => { msg.textContent = "Couldn't copy. The link is: " + url; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, fail);
      else { const t = document.createElement("textarea"); t.value = url; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
        try { document.execCommand("copy") ? done() : fail(); } catch (e) { fail(); } finally { t.remove(); } } }); });
})();
