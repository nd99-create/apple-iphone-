/* Ruhani Room — site behaviour
   Menu, fragrance tabs, shop filters, product page and enquiry form. */
(function () {
  "use strict";

  /* ---- Settings: edit these ---- */
  var CONTACT_EMAIL = "hello@ruhaniroom.com";
  // WhatsApp number with country code, digits only, e.g. "919876543210".
  // Leave empty to hide the WhatsApp line on the contact page.
  var WHATSAPP_NUMBER = "";

  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var params = new URLSearchParams(window.location.search);

  /* ---- Product data ---- */
  var SCENTS = {
    rose: {
      name: "Rose", color: "#8e2a3b", note: "Soft, warm and gently sweet",
      text: "A classic Indian rose, warm rather than sugary, like fresh petals gathered in a brass bowl. It settles into a room slowly and stays soft, never sharp.",
      mood: "Warm, romantic, comforting", best: "Evenings, prayer corners, gifting"
    },
    mogra: {
      name: "Mogra", color: "#e9e0c9", note: "Creamy, heady white flowers",
      text: "Mogra is the Indian name for Arabian jasmine, the flower woven into gajras for weddings and festivals. Rich and creamy, it brings a celebratory lift to any room.",
      mood: "Festive, uplifting, nostalgic", best: "Festive mornings, welcoming guests"
    },
    sandalwood: {
      name: "Sandalwood", color: "#7b4a2c", note: "Smooth, woody and grounding",
      text: "The scent most tied to temples and quiet reflection. Creamy and woody, it calms a busy room without demanding attention, which makes it a natural companion for meditation.",
      mood: "Grounded, serene, focused", best: "Meditation, reading, working from home"
    },
    lavender: {
      name: "Lavender", color: "#5b3554", note: "Herbal, clean and calming",
      text: "A clean, herbal floral with a soft powdery finish. Light it as the day winds down to signal that it is time to rest.",
      mood: "Restful, airy, soothing", best: "Bedtime, after a long day, bathrooms"
    },
    jasmine: {
      name: "Jasmine", color: "#d6a536", note: "Bright, green and sunny",
      text: "Lighter and greener than mogra, this jasmine is the daytime floral of the collection. It freshens living spaces and pairs well with open windows and morning light.",
      mood: "Fresh, joyful, bright", best: "Daytime, living rooms, freshening a space"
    }
  };
  var TYPES = {
    sticks: {
      label: "Incense sticks", title: "Incense Sticks", main: "sticks.webp",
      mainAlt: "Ruhani Room incense sticks in five fragrances",
      about: "Long, slim sticks that release a steady trail of fragrance. Place one upright in a holder and let it scent the room while you go about your day.",
      use: "Daily fragrance, longer sessions, larger rooms"
    },
    cones: {
      label: "Dhoop cones", title: "Dhoop Cones", main: "cones.webp",
      mainAlt: "Ruhani Room dhoop cones in five fragrances",
      about: "Stickless cones pressed from fragrant dhoop. They burn for a shorter time and give a denser, richer fragrance, so a room feels transformed quickly.",
      use: "Quick refresh, puja, smaller rooms"
    }
  };

  /* ---- Footer year ---- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Mobile menu ---- */
  var header = $(".site-header");
  var toggle = $(".menu-toggle");
  if (header && toggle) {
    var setMenu = function (open) {
      header.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () { setMenu(!header.classList.contains("open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
    $$("#site-nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  /* ---- Fragrance tabs (home) ---- */
  var tablist = $(".scent-tabs");
  if (tablist) {
    var section = tablist.closest(".scents");
    var tabs = $$('[role="tab"]', tablist);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        panel.hidden = !on;
        if (on) {
          panel.classList.remove("is-entering");
          void panel.offsetWidth;
          panel.classList.add("is-entering");
        }
      });
      if (section) section.setAttribute("data-scent", tab.dataset.scent);
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ---- Shop filters ---- */
  var filterGroup = $(".filters");
  if (filterGroup) {
    var buttons = $$("[data-filter]", filterGroup);
    var products = $$(".product[data-type]");
    var apply = function (type, updateUrl) {
      if (!buttons.some(function (b) { return b.dataset.filter === type; })) type = "all";
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === type)); });
      products.forEach(function (p) { p.hidden = !(type === "all" || p.dataset.type === type); });
      if (updateUrl && window.history.replaceState) {
        var url = type === "all" ? "shop.html" : "shop.html?type=" + type;
        window.history.replaceState(null, "", url);
      }
    };
    buttons.forEach(function (b) { b.addEventListener("click", function () { apply(b.dataset.filter, true); }); });
    apply(params.get("type") || "all", false);
  }

  /* ---- Product page ---- */
  if ($("[data-product-page]")) {
    var type = TYPES[params.get("type")] ? params.get("type") : "sticks";
    var key = SCENTS[params.get("f")] ? params.get("f") : "rose";
    var s = SCENTS[key], t = TYPES[type];
    var title = s.name + " " + t.title;
    var set = function (sel, val) { var el = $(sel); if (el) el.textContent = val; };
    var img = function (sel, src, alt) { var el = $(sel); if (el) { el.src = "assets/images/products/" + src; el.alt = alt; } };

    set("[data-pd-title]", title);
    set("[data-pd-crumb]", title);
    set("[data-pd-note]", s.note);
    set("[data-pd-text]", s.text);
    set("[data-pd-about]", t.about);
    set("[data-pd-format]", t.label);
    set("[data-pd-mood]", s.mood);
    set("[data-pd-best]", s.best);
    set("[data-pd-use]", t.use);
    img("[data-pd-main]", t.main, t.mainAlt);
    img("[data-pd-sub1]", "stick-" + key + ".webp", s.name + " incense sticks by Ruhani Room");
    img("[data-pd-sub2]", "cone-" + key + ".webp", s.name + " dhoop cones by Ruhani Room");

    $$("[data-chip-type]").forEach(function (a) {
      var ty = a.dataset.chipType;
      a.href = "product.html?type=" + ty + "&f=" + key;
      if (ty === type) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    $$("[data-chip-scent]").forEach(function (a) {
      var sc = a.dataset.chipScent;
      a.href = "product.html?type=" + type + "&f=" + sc;
      if (sc === key) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    var enquire = $("[data-enquire]");
    if (enquire) enquire.href = "contact.html?product=" + encodeURIComponent(title);

    var desc = title + " by Ruhani Room. " + s.note + ". " + s.text;
    document.title = title + " | Natural Incense | Ruhani Room";
    var meta = $('meta[name="description"]'); if (meta) meta.setAttribute("content", desc);
    var ogt = $('meta[property="og:title"]'); if (ogt) ogt.setAttribute("content", document.title);
    var ogd = $('meta[property="og:description"]'); if (ogd) ogd.setAttribute("content", desc);
  }

  /* ---- Contact page ---- */
  $$("[data-email]").forEach(function (a) { a.href = "mailto:" + CONTACT_EMAIL; a.textContent = CONTACT_EMAIL; });
  var wa = $("[data-whatsapp]");
  if (wa) {
    if (WHATSAPP_NUMBER) {
      var waLink = $("a", wa);
      waLink.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent("Hello Ruhani Room, I'd like to ask about your incense.");
      waLink.target = "_blank"; waLink.rel = "noopener";
    } else {
      wa.hidden = true;
    }
  }

  var form = $("#enquiry-form");
  if (form) {
    var product = params.get("product");
    if (product) {
      var topic = $("#topic", form); if (topic) topic.value = "Order";
      var msg = $("#message", form);
      if (msg && !msg.value) msg.value = "I'd like to order " + product + ".\nQuantity: \nDeliver to (city and pincode): ";
    }
    var status = $(".form-status", form);
    var showError = function (field, text) {
      field.setAttribute("aria-invalid", "true");
      var id = field.id + "-error";
      var err = document.getElementById(id);
      if (!err) {
        err = document.createElement("span");
        err.className = "error"; err.id = id;
        field.parentNode.appendChild(err);
      }
      err.textContent = text;
      field.setAttribute("aria-describedby", id);
    };
    var clearError = function (field) {
      field.removeAttribute("aria-invalid");
      var err = document.getElementById(field.id + "-error");
      if (err) err.remove();
      field.removeAttribute("aria-describedby");
    };
    $$("input, textarea", form).forEach(function (f) { f.addEventListener("input", function () { clearError(f); }); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#name", form), email = $("#email", form), message = $("#message", form);
      var bad = null;
      [name, email, message].forEach(clearError);
      if (!message.value.trim()) { showError(message, "Add a message so we know what you need."); bad = bad || message; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "Enter an email address like name@example.com."); bad = email; }
      if (!name.value.trim()) { showError(name, "Enter your name."); bad = name; }
      if (bad) {
        status.className = "form-status err";
        status.textContent = "Check the highlighted fields, then send again.";
        bad.focus();
        return;
      }
      var phone = $("#phone", form).value.trim();
      var topicVal = $("#topic", form).value;
      var body = message.value.trim() + "\n\n" + name.value.trim() + "\n" + email.value.trim() + (phone ? "\n" + phone : "");
      var href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(topicVal + " enquiry from " + name.value.trim()) +
        "&body=" + encodeURIComponent(body);
      window.location.href = href;
      status.className = "form-status ok";
      status.textContent = "Your email app should open with the message ready. If it doesn't, write to " + CONTACT_EMAIL + ".";
    });
  }
})();
