// buildwith: /calendar/ month grid + list toggle, with continent / country / participation-level filters + past toggle.
// Data: <script type="application/json" id="bw-events">. Without JS the server-rendered list shows everything (including past).
(function () {
  const root = document.getElementById("cal"); if (!root) return;
  const DATA = JSON.parse(document.getElementById("bw-events").textContent);
  const EV = DATA.events, MONTHS = DATA.months, LVL = DATA.levels, EXP = DATA.exps, CONT = DATA.continents;
  const NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const pad = n => String(n).padStart(2, "0");
  const t = new Date(), today = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  const q = new URLSearchParams(location.search);
  let view = q.get("view") === "list" ? "list" : "month";
  let cur = MONTHS.includes(q.get("m")) ? q.get("m") : (MONTHS.includes(today.slice(0, 7)) ? today.slice(0, 7) : MONTHS[0]);
  const countries = [...new Set(Object.values(EXP).map(x => x.country))];
  const F = { continent: CONT.includes(q.get("continent")) ? q.get("continent") : "", country: countries.includes(q.get("country")) ? q.get("country") : "",
              hide: new Set((q.get("hide") || "").split(",").filter(k => k in LVL)),
              showPast: q.get("past") !== "0" };
  if (F.continent && F.country && !Object.values(EXP).some(x => x.country === F.country && x.continents.includes(F.continent))) F.country = "";
  const els = { month: document.getElementById("cal-month"), list: document.getElementById("cal-list"), sel: document.getElementById("cal-sel"),
    prev: document.getElementById("cal-prev"), next: document.getElementById("cal-next"), mnav: document.getElementById("cal-mnav"),
    country: document.getElementById("cal-country"), count: document.getElementById("cal-count"), past: document.getElementById("cal-past") };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const href = e => "../experiences/" + EXP[e.exp].slug + "/";
  const isPast = e => !e.tbc && e.end < today;
  const geoOK = (x, cont = F.continent, ctry = F.country) => (!cont || x.continents.includes(cont)) && (!ctry || x.country === ctry);
  const match = e => !F.hide.has(e.level) && geoOK(EXP[e.exp]) && (F.showPast || !isPast(e));
  const filtering = () => !!(F.continent || F.country || F.hide.size || !F.showPast);
  function item(e) {
    const past = isPast(e);
    const tags = (past ? '<span class="past-tag">Past</span>' : "") + (e.kind === "deadline" ? '<span class="dl-tag">Deadline / key date</span>' : "") + (e.tbc ? '<span class="tbc-tag">Date TBC</span>' : "") +
      `<span class="lv ${e.level}">${LVL[e.level]}</span>`;
    return `<li class="${e.level} lvx-${e.level}${e.tbc ? " tbc" : ""}${past ? " past" : ""}" data-start="${e.start}" data-end="${e.end}"><span class="d">${esc(e.label)}</span>` +
      `<span class="t"><a href="${href(e)}">${esc(e.title)}</a></span><span class="s">${esc(EXP[e.exp].place)}${e.note ? " · " + esc(e.note) : ""}` +
      ` · <a href="${esc(e.url)}" target="_blank" rel="noopener">source</a><span class="tags">${tags}</span></span></li>`;
  }
  function renderMonth() {
    const [y, m] = cur.split("-").map(Number), first = new Date(y, m - 1, 1), nd = new Date(y, m, 0).getDate();
    const lead = (first.getDay() + 6) % 7, a = `${cur}-01`, b = `${cur}-${pad(nd)}`;
    const ev = EV.filter(match);
    const dated = ev.filter(e => !e.tbc && e.start <= b && e.end >= a), tbc = ev.filter(e => e.tbc && e.month === cur);
    let h = `<div class="cal-month"><h2>${NAMES[m - 1]} ${y}<small>${dated.length} dated · ${tbc.length} date TBC</small></h2><div class="cal-grid" role="grid" aria-label="${NAMES[m - 1]} ${y}">`;
    for (const d of ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]) h += `<div class="cal-dow" role="columnheader">${d}</div>`;
    for (let i = 0; i < lead; i++) h += '<div class="cal-day pad" aria-hidden="true"></div>';
    for (let d = 1; d <= nd; d++) {
      const iso = `${cur}-${pad(d)}`;
      const on = dated.filter(e => e.start <= iso && e.end >= iso).filter(e => {
        const span = (new Date(e.end) - new Date(e.start)) / 864e5; return span <= 10 || iso === e.start || iso === e.end || d === 1; });
      const chips = on.map(e => `<span class="chip-ev ${e.level} lvx-${e.level}${e.kind === "deadline" ? " dl" : ""}${isPast(e) ? " past" : ""}" title="${esc(e.title)} (${esc(e.label)})${isPast(e) ? " · Past" : ""}">${e.kind === "deadline" ? "⏰ " : ""}${iso !== e.start ? "↳ " : ""}${esc(EXP[e.exp].short)}</span>`).join("");
      const dots = on.map(e => `<span class="dot ${e.level} lvx-${e.level}${isPast(e) ? " past" : ""}"></span>`).join("");
      const lab = `${d} ${NAMES[m - 1]}${on.length ? ": " + on.map(e => EXP[e.exp].short + (isPast(e) ? " (past)" : "")).join(", ") : ""}`;
      h += on.length ? `<button type="button" class="cal-day${iso === today ? " today" : ""}" data-d="${iso}" aria-label="${esc(lab)}"><span class="n">${d}</span>${chips}<span class="cal-dots">${dots}</span></button>`
                     : `<div class="cal-day${iso === today ? " today" : ""}"><span class="n">${d}</span></div>`;
    }
    const tail = (7 - (lead + nd) % 7) % 7; for (let i = 0; i < tail; i++) h += '<div class="cal-day pad" aria-hidden="true"></div>';
    h += "</div>";
    if (tbc.length) h += '<div class="cal-tbc"><h3>This month, date TBC</h3><div class="pills">' + tbc.map(e =>
      `<a class="pill lvx-${e.level}" href="${href(e)}" title="${esc(e.title)}"><span class="dot ${e.level}"></span>${e.kind === "deadline" ? "⏰ " : ""}<span class="tx">${esc(e.title)}</span></a>`).join("") + "</div></div>";
    h += "</div>";
    const all = ev.filter(e => (e.tbc && e.month === cur) || (!e.tbc && e.start <= b && e.end >= a));
    h += `<div class="cal-agenda"><h3>Everything in ${NAMES[m - 1]} ${y}</h3>` + (all.length ? `<ul class="dated">${all.map(item).join("")}</ul>`
      : `<p class="muted">${filtering() ? "Nothing this month matches the filters." : "Nothing scheduled."}</p>`) + "</div>";
    els.month.innerHTML = h;
    els.sel.value = cur; els.prev.disabled = MONTHS.indexOf(cur) === 0; els.next.disabled = MONTHS.indexOf(cur) === MONTHS.length - 1;
    els.month.querySelectorAll("button.cal-day").forEach(btn => btn.addEventListener("click", () => {
      const lis = [...els.month.querySelectorAll(".cal-agenda li")].filter(li => li.dataset.start <= btn.dataset.d && li.dataset.end >= btn.dataset.d && !li.classList.contains("tbc"));
      els.month.querySelectorAll(".cal-agenda li.hl").forEach(li => li.classList.remove("hl"));
      lis.forEach(li => li.classList.add("hl")); if (lis[0]) lis[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }));
  }
  // server-rendered lists (list view + deadlines): hide non-matching items, refresh per-month counts
  function filterLists() {
    const liOK = li => { const lv = Object.keys(LVL).find(k => li.classList.contains(k));
      const past = li.classList.contains("past");
      return !F.hide.has(lv) && (F.showPast || !past) && (!F.continent || li.dataset.continents.split(" ").includes(F.continent)) && (!F.country || li.dataset.country === F.country); };
    document.querySelectorAll("#cal-list .month-group").forEach(g => {
      const lis = [...g.querySelectorAll("li[data-country]")]; let d = 0, tb = 0;
      lis.forEach(li => { const ok = liOK(li); li.hidden = !ok; if (ok) li.classList.contains("tbc") ? tb++ : d++; });
      g.querySelector("[data-count]").textContent = `${d} dated · ${tb} date TBC`;
      g.querySelector(".nomatch").hidden = !(lis.length && d + tb === 0);
    });
    const dls = [...document.querySelectorAll("#dl-list li[data-country]")]; let n = 0;
    dls.forEach(li => { const ok = liOK(li); li.hidden = !ok; if (ok) n++; });
    document.getElementById("dl-nomatch").hidden = n > 0;
    const df = document.getElementById("dl-filtered"); df.hidden = !filtering();
    df.textContent = filtering() ? `Filtered by the calendar filters above: ${n} of ${dls.length} deadlines shown.` : "";
  }
  function renderFilters() {
    const lvOK = e => !F.hide.has(e.level) && (F.showPast || !isPast(e));
    document.querySelectorAll(".chip[data-gf=continent]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.v === F.continent));
      b.querySelector(".cnt").textContent = EV.filter(e => lvOK(e) && geoOK(EXP[e.exp], b.dataset.v, "")).length;
    });
    const opt = c => `<option value="${esc(c)}">${esc(c)} (${EV.filter(e => lvOK(e) && geoOK(EXP[e.exp], F.continent, c)).length})</option>`;
    const sorted = list => [...list].sort((a, b) => (a === "Multi-city") - (b === "Multi-city") || a.localeCompare(b));
    const inCont = c => sorted(new Set(Object.values(EXP).filter(x => x.continents.includes(c)).map(x => x.country)));
    els.country.innerHTML = `<option value="">${F.continent ? "Any country in " + esc(F.continent) : "Any country"}</option>` +
      (F.continent ? inCont(F.continent).map(opt).join("") : CONT.map(c => `<optgroup label="${c}">${inCont(c).map(opt).join("")}</optgroup>`).join(""));
    els.country.value = F.country;
    document.querySelectorAll(".legend input[data-lv]").forEach(c => { c.checked = !F.hide.has(c.dataset.lv); root.classList.toggle("hide-" + c.dataset.lv, !c.checked); });
    if (els.past) els.past.checked = F.showPast;
    root.classList.toggle("hide-past", !F.showPast);
    const shown = EV.filter(match), d = shown.filter(e => !e.tbc).length;
    els.count.textContent = `Showing ${shown.length} of ${EV.length} items (${d} dated, ${shown.length - d} date TBC)`;
    document.getElementById("cal-reset").hidden = !filtering();
  }
  function sync() {
    const p = new URLSearchParams(); if (view === "list") p.set("view", "list"); else p.set("m", cur);
    if (F.continent) p.set("continent", F.continent); if (F.country) p.set("country", F.country); if (F.hide.size) p.set("hide", [...F.hide].join(","));
    if (!F.showPast) p.set("past", "0");
    history.replaceState(null, "", location.pathname + "?" + p + location.hash);
  }
  function render() {
    renderFilters(); filterLists();
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    els.month.hidden = view !== "month"; els.mnav.hidden = view !== "month"; els.list.hidden = view !== "list";
    if (view === "month") renderMonth(); sync();
  }
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; render(); }));
  els.sel.addEventListener("change", () => { cur = els.sel.value; render(); });
  els.prev.addEventListener("click", () => { cur = MONTHS[Math.max(0, MONTHS.indexOf(cur) - 1)]; render(); });
  els.next.addEventListener("click", () => { cur = MONTHS[Math.min(MONTHS.length - 1, MONTHS.indexOf(cur) + 1)]; render(); });
  document.querySelectorAll(".chip[data-gf=continent]").forEach(b => b.addEventListener("click", () => {
    F.continent = b.dataset.v;
    if (F.country && !Object.values(EXP).some(x => x.country === F.country && geoOK(x, F.continent, F.country))) F.country = "";
    render(); }));
  els.country.addEventListener("change", () => { F.country = els.country.value; render(); });
  document.querySelectorAll(".legend input[data-lv]").forEach(c => c.addEventListener("change", () => { c.checked ? F.hide.delete(c.dataset.lv) : F.hide.add(c.dataset.lv); render(); }));
  if (els.past) els.past.addEventListener("change", () => { F.showPast = els.past.checked; render(); });
  document.getElementById("cal-reset").addEventListener("click", () => { F.continent = ""; F.country = ""; F.hide.clear(); F.showPast = true; render(); });
  document.getElementById("cal-controls").hidden = false;
  render();
})();
