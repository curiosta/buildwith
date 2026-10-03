// buildwith: filter the experience cards by continent, month and participation level (state kept in the URL query).
(function () {
  const grid = document.getElementById("exp-grid"); if (!grid) return;
  const cards = [...grid.querySelectorAll(".exp-card")];
  const state = { continent: "", level: "", month: "" };
  const q = new URLSearchParams(location.search);
  for (const k in state) if (q.get(k)) state[k] = q.get(k);
  const count = document.getElementById("f-count"), empty = document.getElementById("f-empty"), msel = document.getElementById("f-month");
  function apply() {
    let n = 0;
    cards.forEach(c => {
      const ok = (!state.continent || c.dataset.continents.split(" ").includes(state.continent)) &&
                 (!state.level || c.dataset.levels.split(" ").includes(state.level)) &&
                 (!state.month || c.dataset.months.split(" ").includes(state.month));
      c.hidden = !ok; if (ok) n++;
    });
    count.textContent = `Showing ${n} of ${cards.length} experiences`;
    empty.classList.toggle("show", n === 0);
    document.querySelectorAll(".chip[data-f]").forEach(b => b.setAttribute("aria-pressed", String(state[b.dataset.f] === b.dataset.v)));
    msel.value = state.month;
    const p = new URLSearchParams(); for (const k in state) if (state[k]) p.set(k, state[k]);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
  }
  document.querySelectorAll(".chip[data-f]").forEach(b => b.addEventListener("click", () => { state[b.dataset.f] = b.dataset.v; apply(); }));
  msel.addEventListener("change", () => { state.month = msel.value; apply(); });
  document.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => { for (const k in state) state[k] = ""; apply(); }));
  document.getElementById("filters").hidden = false;
  apply();
})();
