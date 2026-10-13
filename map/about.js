(function () {
  var b = document.getElementById("abtn"),
    a = document.getElementById("about");
  function t(o) {
    a.classList.toggle("open", o);
    b.setAttribute("aria-expanded", o);
  }
  b.onclick = function () {
    t(!a.classList.contains("open"));
  };
  document.getElementById("aclose").onclick = function () {
    t(false);
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") t(false);
  });
})();
