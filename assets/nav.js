// buildwith: shared page script. Phone menu (UAT 14 Oct 2026, after founder.curiosta.com): a Menu button with aria-expanded
// opens the four site links; Esc, a second tap, a tap outside or choosing a link closes it. Without JavaScript the button
// is hidden by CSS (it only shows under html.js, set inline before first paint, so it never shifts the layout) and the four links wrap under the wordmark, so nothing is ever unreachable.
document.documentElement.classList.add("js");
(function () {
  const bar = document.querySelector(".topbar"), btn = bar && bar.querySelector(".nav-toggle"), nav = document.getElementById("site-nav");
  if (!btn || !nav) return;
  const set = open => { bar.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && bar.classList.contains("open")) { set(false); btn.focus(); } });
  document.addEventListener("click", ev => { if (bar.classList.contains("open") && !bar.contains(ev.target)) set(false); });
  nav.addEventListener("click", ev => { if (ev.target.closest("a")) set(false); });
  const mq = window.matchMedia("(min-width:641px)");
  const onMq = () => { if (mq.matches) set(false); };
  mq.addEventListener ? mq.addEventListener("change", onMq) : mq.addListener(onMq);
})();
