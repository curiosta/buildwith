// buildwith: on phones an experience page opens "Your way in" and "Check before you go"; the other sections are one tap away.
// Without JavaScript every <details> stays open, so nothing is ever hidden. Desktop keeps everything open.
(function () {
  var mq = window.matchMedia("(max-width:720px)");
  var secs = [].slice.call(document.querySelectorAll("details.sec"));
  if (!secs.length) return;
  var keep = ["take-part", "check"];
  function fold() { secs.forEach(function (d) { d.open = !mq.matches || keep.indexOf(d.closest("section").id) > -1; }); }
  // the details element that holds (or is) the anchor target; section ids sit on the <section> that wraps the <details>
  function holder(el) { return el && (el.closest("details.sec") || (el.querySelector && el.querySelector("details.sec"))); }
  function openFor(id) { var d = id && holder(document.getElementById(id)); if (d && !d.open) d.open = true; return !!d; }
  fold();
  (mq.addEventListener ? mq.addEventListener("change", fold) : mq.addListener(fold));
  function fromHash() { var h = decodeURIComponent(location.hash.slice(1)); if (openFor(h)) { var el = document.getElementById(h); setTimeout(function () { el.scrollIntoView(); }, 0); } }
  fromHash(); window.addEventListener("hashchange", fromHash);
  document.addEventListener("click", function (ev) { var a = ev.target.closest && ev.target.closest('a[href^="#"]'); if (a && a.getAttribute("href").length > 1) openFor(a.getAttribute("href").slice(1)); });
  // find-in-page and 'beforematch' (hidden=until-found) style reveals: a toggle never needs extra handling because <details> opens itself
})();
