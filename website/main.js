(function () {
  document.documentElement.classList.add("js");
  var ua = navigator.userAgent;
  var os = /Windows/.test(ua) ? "win" : /Mac/.test(ua) ? "mac" : /Linux|X11/.test(ua) ? "linux" : "";
  var names = { win: "Windows", mac: "macOS", linux: "Linux" };
  document.querySelectorAll("[data-os-label]").forEach(function (e) {
    e.textContent = os ? "Download for " + names[os] : "Download";
  });
  document.querySelectorAll('[data-os-row="' + os + '"]').forEach(function (e) {
    e.setAttribute("data-match", "");
    e.insertAdjacentHTML("beforeend", '<span class="tag">Your system</span>');
  });
  var els = document.querySelectorAll(".fade");
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();
