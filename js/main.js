/* ModuNest site scripts */
// Form endpoint. Leave empty until the client creates a Formspree/Basin endpoint (e.g. "https://formspree.io/f/xxxx").
var FORM_ENDPOINT = "";
var CONTACT_EMAIL = "";

(function () {
  // Active nav + mobile menu
  var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a[href]").forEach(function (a) {
    var h = a.getAttribute("href").toLowerCase();
    if (h === path || (path.indexOf("model-") === 0 && h === "models.html")) a.classList.add("active");
  });
  var header = document.querySelector(".header"), toggle = document.querySelector(".nav-toggle");
  if (toggle) toggle.addEventListener("click", function () { header.classList.toggle("nav-open"); document.body.style.overflow = header.classList.contains("nav-open") ? "hidden" : ""; });
  document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { header.classList.remove("nav-open"); document.body.style.overflow = ""; }); });

  // Lightbox
  var lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
  lb.addEventListener("click", function () { lb.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });
  function openLb(src) { lb.querySelector("img").src = src; lb.classList.add("open"); }
  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openLb(el.getAttribute("data-lightbox") || el.getAttribute("href")); });
  });

  // Model gallery
  var gal = document.querySelector(".model-gallery");
  if (gal) {
    var main = gal.querySelector(".main img"), thumbs = gal.querySelectorAll(".thumbs button");
    thumbs.forEach(function (b) {
      b.addEventListener("click", function () {
        main.src = b.getAttribute("data-src"); main.alt = b.querySelector("img").alt;
        thumbs.forEach(function (x) { x.classList.remove("active"); }); b.classList.add("active");
      });
    });
    gal.querySelector(".main").addEventListener("click", function () { openLb(main.src); });
  }

  // Zip check -> quote page with zip prefilled
  var zip = document.getElementById("zip-form");
  if (zip) zip.addEventListener("submit", function (e) {
    e.preventDefault(); var z = zip.querySelector("input").value.trim();
    location.href = "quote.html" + (z ? "?zip=" + encodeURIComponent(z) : "");
  });

  // Quote form
  var form = document.getElementById("quote-form");
  if (form) {
    var params = new URLSearchParams(location.search);
    if (params.get("zip")) form.querySelector("[name=zip]").value = params.get("zip");
    if (params.get("model")) { var sel = form.querySelector("[name=model]"); if (sel) sel.value = params.get("model"); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]"), tip = document.getElementById("form-tip");
      var data = new FormData(form);
      if (FORM_ENDPOINT) {
        btn.disabled = true; btn.textContent = "Sending…";
        fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(); form.innerHTML = '<h3>Thanks, we got it.</h3><p class="muted mt-16">We will reply within one business day with pricing and delivery options for your area.</p>'; })
          .catch(function () { btn.disabled = false; btn.textContent = "Get my quote"; tip.textContent = "Something went wrong. Please email us instead."; });
      } else if (CONTACT_EMAIL) {
        var body = ""; data.forEach(function (v, k) { body += k + ": " + v + "\n"; });
        location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Quote request - " + data.get("model")) + "&body=" + encodeURIComponent(body);
        tip.textContent = "Your email app should open with the request prefilled.";
      } else {
        tip.textContent = "Form delivery is not connected yet. Please call or email us.";
      }
    });
  }
})();
