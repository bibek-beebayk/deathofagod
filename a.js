// Cookie-free, first-party analytics beacon. No cookies, no IP stored. Honours Do Not Track.
(function () {
  try { if (localStorage.getItem("oth_owner")) return; } catch (e) {}
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
  function send(t, v) {
    var d = { t: t, p: location.pathname };
    if (v) d.v = v;
    if (t === "pv") {
      try {
        var q = new URLSearchParams(location.search), u = (q.get("utm_source") || "").toLowerCase().replace(/[^a-z0-9_.\-]/g, "").slice(0, 30);
        var h = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
        d.r = u ? "utm:" + u : (h === location.hostname.replace(/^www\./, "") ? "" : h);
      } catch (e) {}
    }
    var s = JSON.stringify(d);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon("/api/collect", new Blob([s], { type: "text/plain" }))) return;
      fetch("/api/collect", { method: "POST", body: s, keepalive: true, headers: { "content-type": "text/plain" } });
    } catch (e) {}
  }
  send("pv");
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a,button");
    if (!el) return;
    var sh = el.closest(".share");
    if (sh) {
      if (el.hasAttribute("data-copy")) return send("share", "copy");
      if (el.hasAttribute("data-native")) return send("share", "native");
      var m = /Share on (\w+)/.exec(el.getAttribute("aria-label") || "");
      return m && send("share", m[1].toLowerCase());
    }
    if (el.id === "abtn") return send("about");
    var k = el.getAttribute("data-k");
    if (k && el.closest(".ch")) send("char", k);
  }, true);
  if (document.getElementById("fs")) {
    var done = {}, mark = [25, 50, 75, 100];
    addEventListener("scroll", function () {
      var a = document.getElementById("fs"), r = a.getBoundingClientRect(), tot = r.height - innerHeight * 0.5;
      var pct = Math.max(0, Math.min(100, ((innerHeight * 0.5 - r.top) / Math.max(1, tot)) * 100));
      mark.forEach(function (m) { if (pct >= m - 0.5 && !done[m]) { done[m] = 1; send("scroll", String(m)); } });
    }, { passive: true });
  }
})();
