// buildwith: month grid + list toggle for /calendar/. Data: <script type="application/json" id="bw-events">.
(function () {
  const root = document.getElementById("cal"); if (!root) return;
  const DATA = JSON.parse(document.getElementById("bw-events").textContent);
  const EV = DATA.events, MONTHS = DATA.months, LVL = DATA.levels, EXP = DATA.exps;
  const NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const pad = n => String(n).padStart(2, "0");
  const t = new Date(), today = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  const q = new URLSearchParams(location.search);
  let view = q.get("view") === "list" ? "list" : "month";
  let cur = MONTHS.includes(q.get("m")) ? q.get("m") : (MONTHS.includes(today.slice(0, 7)) ? today.slice(0, 7) : MONTHS[0]);
  const els = { month: document.getElementById("cal-month"), list: document.getElementById("cal-list"), sel: document.getElementById("cal-sel"),
    prev: document.getElementById("cal-prev"), next: document.getElementById("cal-next"), mnav: document.getElementById("cal-mnav") };
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const href = e => "../experiences/" + EXP[e.exp].slug + "/";
  function item(e) {
    const tags = (e.kind === "deadline" ? '<span class="dl-tag">Deadline / key date</span>' : "") + (e.tbc ? '<span class="tbc-tag">Date TBC</span>' : "") +
      `<span class="lv ${e.level}">${LVL[e.level]}</span>`;
    return `<li class="${e.level} lvx-${e.level}${e.tbc ? " tbc" : ""}" data-start="${e.start}" data-end="${e.end}"><span class="d">${esc(e.label)}</span>` +
      `<span class="t"><a href="${href(e)}">${esc(e.title)}</a></span><span class="s">${esc(EXP[e.exp].place)}${e.note ? " · " + esc(e.note) : ""}` +
      ` · <a href="${esc(e.url)}" target="_blank" rel="noopener">source</a><span class="tags">${tags}</span></span></li>`;
  }
  function renderMonth() {
    const [y, m] = cur.split("-").map(Number), first = new Date(y, m - 1, 1), nd = new Date(y, m, 0).getDate();
    const lead = (first.getDay() + 6) % 7, a = `${cur}-01`, b = `${cur}-${pad(nd)}`;
    const dated = EV.filter(e => !e.tbc && e.start <= b && e.end >= a), tbc = EV.filter(e => e.tbc && e.month === cur);
    let h = `<div class="cal-month"><h2>${NAMES[m - 1]} ${y}<small>${dated.length} dated · ${tbc.length} date TBC</small></h2><div class="cal-grid" role="grid" aria-label="${NAMES[m - 1]} ${y}">`;
    for (const d of ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]) h += `<div class="cal-dow" role="columnheader">${d}</div>`;
    for (let i = 0; i < lead; i++) h += '<div class="cal-day pad" aria-hidden="true"></div>';
    for (let d = 1; d <= nd; d++) {
      const iso = `${cur}-${pad(d)}`;
      const on = dated.filter(e => e.start <= iso && e.end >= iso).filter(e => {
        const span = (new Date(e.end) - new Date(e.start)) / 864e5; return span <= 10 || iso === e.start || iso === e.end || d === 1; });
      const chips = on.map(e => `<span class="chip-ev ${e.level} lvx-${e.level}${e.kind === "deadline" ? " dl" : ""}" title="${esc(e.title)} (${esc(e.label)})">${e.kind === "deadline" ? "⏰ " : ""}${iso !== e.start ? "↳ " : ""}${esc(EXP[e.exp].short)}</span>`).join("");
      const dots = on.map(e => `<span class="dot ${e.level} lvx-${e.level}"></span>`).join("");
      const lab = `${d} ${NAMES[m - 1]}${on.length ? ": " + on.map(e => EXP[e.exp].short).join(", ") : ""}`;
      h += on.length ? `<button type="button" class="cal-day${iso === today ? " today" : ""}" data-d="${iso}" aria-label="${esc(lab)}"><span class="n">${d}</span>${chips}<span class="cal-dots">${dots}</span></button>`
                     : `<div class="cal-day${iso === today ? " today" : ""}"><span class="n">${d}</span></div>`;
    }
    const tail = (7 - (lead + nd) % 7) % 7; for (let i = 0; i < tail; i++) h += '<div class="cal-day pad" aria-hidden="true"></div>';
    h += "</div>";
    if (tbc.length) h += '<div class="cal-tbc"><h3>This month, date TBC</h3><div class="pills">' + tbc.map(e =>
      `<a class="pill lvx-${e.level}" href="${href(e)}" title="${esc(e.title)}"><span class="dot ${e.level}"></span>${e.kind === "deadline" ? "⏰ " : ""}<span class="tx">${esc(e.title)}</span></a>`).join("") + "</div></div>";
    h += "</div>";
    const all = EV.filter(e => (e.tbc && e.month === cur) || (!e.tbc && e.start <= b && e.end >= a));
    h += `<div class="cal-agenda"><h3>Everything in ${NAMES[m - 1]} ${y}</h3>` + (all.length ? `<ul class="dated">${all.map(item).join("")}</ul>` : '<p class="muted">Nothing scheduled.</p>') + "</div>";
    els.month.innerHTML = h;
    els.sel.value = cur; els.prev.disabled = MONTHS.indexOf(cur) === 0; els.next.disabled = MONTHS.indexOf(cur) === MONTHS.length - 1;
    els.month.querySelectorAll("button.cal-day").forEach(btn => btn.addEventListener("click", () => {
      const lis = [...els.month.querySelectorAll(".cal-agenda li")].filter(li => li.dataset.start <= btn.dataset.d && li.dataset.end >= btn.dataset.d && !li.classList.contains("tbc"));
      els.month.querySelectorAll(".cal-agenda li.hl").forEach(li => li.classList.remove("hl"));
      lis.forEach(li => li.classList.add("hl")); if (lis[0]) lis[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }));
  }
  function sync() {
    const p = new URLSearchParams(); if (view === "list") p.set("view", "list"); else p.set("m", cur);
    history.replaceState(null, "", location.pathname + "?" + p + location.hash);
  }
  function render() {
    document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    els.month.hidden = view !== "month"; els.mnav.hidden = view !== "month"; els.list.hidden = view !== "list";
    if (view === "month") renderMonth(); sync();
  }
  document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; render(); }));
  els.sel.addEventListener("change", () => { cur = els.sel.value; render(); });
  els.prev.addEventListener("click", () => { cur = MONTHS[Math.max(0, MONTHS.indexOf(cur) - 1)]; render(); });
  els.next.addEventListener("click", () => { cur = MONTHS[Math.min(MONTHS.length - 1, MONTHS.indexOf(cur) + 1)]; render(); });
  document.querySelectorAll(".legend input[data-lv]").forEach(c => c.addEventListener("change", () => root.classList.toggle("hide-" + c.dataset.lv, !c.checked)));
  document.getElementById("cal-controls").hidden = false;
  render();
})();
