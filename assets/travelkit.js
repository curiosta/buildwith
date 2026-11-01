// Nomad Travel Kit (release 2026-10-30): checklist ticks are kept in localStorage on this device only (nothing is sent anywhere).
// "Print this checklist" prints one path (body[data-print] hides the other in the print stylesheet); "Clear ticks" resets one path.
(function () {
  const KEY = "nomad-travel-kit-v1";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage blocked: ticks just won't persist */ } };
  const boxes = Array.from(document.querySelectorAll("input[data-tk]"));
  boxes.forEach(b => {
    b.checked = !!saved[b.dataset.tk];
    b.addEventListener("change", () => { if (b.checked) saved[b.dataset.tk] = 1; else delete saved[b.dataset.tk]; store(); });
  });
  document.querySelectorAll(".tk-clear").forEach(btn => btn.addEventListener("click", () => {
    boxes.filter(b => b.dataset.tk.startsWith(btn.dataset.path + "-")).forEach(b => { b.checked = false; delete saved[b.dataset.tk]; });
    store();
  }));
  document.querySelectorAll(".tk-print").forEach(btn => btn.addEventListener("click", () => {
    document.body.dataset.print = btn.dataset.path;
    window.print();
  }));
  window.addEventListener("afterprint", () => { delete document.body.dataset.print; });
})();
