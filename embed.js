/*!
 * The Little Missouri embed — Theodore Roosevelt Presidential Library
 * https://littlemo.labs.trlibrary.com
 *
 * Usage (one script tag per page, any number of widgets):
 *
 *   <div data-little-mo="today"></div>
 *   <script src="https://littlemo.labs.trlibrary.com/embed.js" async></script>
 *
 * Views: today | then | maps | record | paddle | compact | all
 *   compact  a small live card (flow, normal or not, paddling) for a sidebar or the homepage
 * Optional attributes:
 *   data-site="elkhorn"       maps view: open at the Elkhorn instead of Medora
 *   data-era="glo"            maps view: glo | 1939 | 1957 | 1970
 *   data-heading="off"        hide the section heading (when the host page has its own)
 *   data-more="https://..."   compact view: where "Today's river" links (default: the full tool)
 *   data-min-height="700"     starting height in px before the widget reports its size
 */
(function () {
  "use strict";
  var ORIGIN = "https://littlemo.labs.trlibrary.com";
  try {
    var me = document.currentScript && document.currentScript.src;
    if (me) ORIGIN = new URL(me).origin;
  } catch (e) {}

  var frames = {};
  var n = 0;
  var DEFAULT_H = { compact: 230, today: 1500, then: 2400, maps: 900, record: 2000, paddle: 1100, all: 1600 };

  function mount(el) {
    if (el.getAttribute("data-lm-mounted")) return;
    el.setAttribute("data-lm-mounted", "1");
    var view = el.getAttribute("data-little-mo") || "today";
    var id = "lm" + ++n;
    var q = "?embed=1&id=" + id + (view !== "all" ? "&view=" + encodeURIComponent(view) : "");
    ["site", "era", "heading", "more"].forEach(function (k) {
      var v = el.getAttribute("data-" + k);
      if (v) q += "&" + k + "=" + encodeURIComponent(v);
    });
    var f = document.createElement("iframe");
    f.src = ORIGIN + "/" + q;
    f.title = "The Little Missouri River — today's conditions and history";
    f.loading = view === "compact" ? "eager" : "lazy";
    f.setAttribute("allow", "fullscreen; clipboard-write; web-share");
    f.style.cssText = "width:100%;border:0;display:block;overflow:hidden;height:" + (parseInt(el.getAttribute("data-min-height"), 10) || DEFAULT_H[view] || 900) + "px";
    el.appendChild(f);
    frames[id] = f;
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== ORIGIN || !e.data || !e.data.type) return;
    var f = frames[e.data.id];
    if (!f) return;
    if (e.data.type === "little-mo:height" && e.data.height) f.style.height = Math.ceil(e.data.height) + "px";
    if (e.data.type === "little-mo:scrolltop") f.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function scan() {
    var els = document.querySelectorAll("[data-little-mo]");
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();
})();
