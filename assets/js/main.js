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
  var STORE_KEY = "ruhani-room-basket-v1";
  var PRODUCTS = {
    "sticks-rose": { name: "Rose Incense Sticks", price: 200, image: "stick-rose.webp", href: "product.html?type=sticks&f=rose", type: "Incense sticks" },
    "sticks-mogra": { name: "Mogra Incense Sticks", price: 200, image: "stick-mogra.webp", href: "product.html?type=sticks&f=mogra", type: "Incense sticks" },
    "sticks-sandalwood": { name: "Sandalwood Incense Sticks", price: 200, image: "stick-sandalwood.webp", href: "product.html?type=sticks&f=sandalwood", type: "Incense sticks" },
    "sticks-lavender": { name: "Lavender Incense Sticks", price: 200, image: "stick-lavender.webp", href: "product.html?type=sticks&f=lavender", type: "Incense sticks" },
    "sticks-jasmine": { name: "Jasmine Incense Sticks", price: 200, image: "stick-jasmine.webp", href: "product.html?type=sticks&f=jasmine", type: "Incense sticks" },
    "cones-rose": { name: "Rose Dhoop Cones", price: 200, image: "cone-rose.webp", href: "product.html?type=cones&f=rose", type: "Dhoop cones" },
    "cones-mogra": { name: "Mogra Dhoop Cones", price: 200, image: "cone-mogra.webp", href: "product.html?type=cones&f=mogra", type: "Dhoop cones" },
    "cones-sandalwood": { name: "Sandalwood Dhoop Cones", price: 200, image: "cone-sandalwood.webp", href: "product.html?type=cones&f=sandalwood", type: "Dhoop cones" },
    "cones-lavender": { name: "Lavender Dhoop Cones", price: 200, image: "cone-lavender.webp", href: "product.html?type=cones&f=lavender", type: "Dhoop cones" },
    "cones-jasmine": { name: "Jasmine Dhoop Cones", price: 200, image: "cone-jasmine.webp", href: "product.html?type=cones&f=jasmine", type: "Dhoop cones" },
    "havan-classic": { name: "Havan Cups", price: 200, image: "havan.webp", href: "product-havan.html", type: "Pack of six cups" }
  };
  var basket = {};
  var basketNotice = null;
  var money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  function announceBasket(message) {
    if (!basketNotice) {
      basketNotice = document.createElement("div");
      basketNotice.className = "basket-notice";
      basketNotice.setAttribute("role", "status");
      basketNotice.setAttribute("aria-live", "polite");
      document.body.appendChild(basketNotice);
    }
    basketNotice.textContent = message;
    basketNotice.classList.add("is-visible");
    window.clearTimeout(announceBasket.timer);
    announceBasket.timer = window.setTimeout(function () {
      basketNotice.classList.remove("is-visible");
    }, 3200);
  }

  function readBasket() {
    try {
      var saved = window.localStorage.getItem(STORE_KEY);
      if (!saved) return {};
      var parsed = JSON.parse(saved);
      var result = {};
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Saved basket has an unexpected format.");
      }
      Object.keys(parsed).forEach(function (id) {
        var quantity = parsed[id];
        if (PRODUCTS[id] && Number.isInteger(quantity) && quantity >= 1 && quantity <= 20) {
          result[id] = quantity;
        }
      });
      return result;
    } catch (error) {
      console.error("Could not read the saved basket:", error.message);
      try {
        window.localStorage.removeItem(STORE_KEY);
      } catch (storageError) {
        console.error("Could not clear the invalid saved basket:", storageError.message);
      }
      announceBasket("Your saved basket could not be read, so it has been cleared.");
      return {};
    }
  }

  function saveBasket() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(basket));
      return true;
    } catch (error) {
      console.error("Could not save the basket:", error.message);
      announceBasket("Your basket changed, but this browser could not save it. Keep this page open while you check out.");
      return false;
    }
  }

  function basketCount() {
    return Object.keys(basket).reduce(function (total, id) { return total + basket[id]; }, 0);
  }

  function basketTotal() {
    return Object.keys(basket).reduce(function (total, id) {
      return total + PRODUCTS[id].price * basket[id];
    }, 0);
  }

  function updateBasketCount() {
    var count = basketCount();
    $$("[data-basket-count]").forEach(function (element) {
      element.textContent = String(count);
      element.hidden = count === 0;
    });
    $$(".basket-nav").forEach(function (link) {
      link.setAttribute("aria-label", "Basket, " + count + (count === 1 ? " item" : " items"));
    });
  }

  function makeBasketNav() {
    var nav = $("#site-nav");
    var headerWrap = $(".site-header .wrap");
    if (!nav || !headerWrap || $(".basket-nav", headerWrap)) return;
    var link = document.createElement("a");
    link.className = "basket-nav";
    link.href = "cart.html";
    link.setAttribute("aria-label", "Basket, 0 items");
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg><span class="basket-count" data-basket-count hidden>0</span>';
    headerWrap.appendChild(link);
  }

  function createText(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderCartPage() {
    var container = $("[data-cart-items]");
    if (!container) return;
    container.replaceChildren();
    var ids = Object.keys(basket);
    var checkoutLink = $("[data-cart-checkout]");
    if (!ids.length) {
      var empty = createText("div", "cart-empty");
      empty.appendChild(createText("p", "eyebrow", "YOUR BASKET IS WAITING"));
      empty.appendChild(createText("h2", "", "Nothing here just yet."));
      empty.appendChild(createText("p", "", "Choose a fragrance and format to start building a little ritual of your own."));
      var shop = createText("a", "btn btn-solid", "Explore the collection");
      shop.href = "shop.html";
      empty.appendChild(shop);
      container.appendChild(empty);
      if (checkoutLink) {
        checkoutLink.setAttribute("aria-disabled", "true");
        checkoutLink.classList.add("is-disabled");
        checkoutLink.href = "shop.html";
        checkoutLink.textContent = "Choose something to begin";
      }
    } else {
      ids.forEach(function (id) {
        var product = PRODUCTS[id];
        var quantity = basket[id];
        var row = createText("article", "cart-item");
        var imageLink = createText("a", "cart-item-image");
        imageLink.href = product.href;
        var image = document.createElement("img");
        image.src = "assets/images/products/" + product.image;
        image.alt = product.name;
        image.loading = "lazy";
        imageLink.appendChild(image);
        row.appendChild(imageLink);

        var details = createText("div", "cart-item-details");
        var category = createText("p", "meta", product.type);
        details.appendChild(category);
        var title = createText("h3");
        var titleLink = createText("a", "", product.name);
        titleLink.href = product.href;
        title.appendChild(titleLink);
        details.appendChild(title);
        details.appendChild(createText("p", "cart-item-price", money.format(product.price) + " / pack"));

        var controls = createText("div", "cart-item-controls");
        var label = createText("label", "quantity-field cart-quantity", "Qty");
        var input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "20";
        input.step = "1";
        input.value = String(quantity);
        input.inputMode = "numeric";
        input.setAttribute("aria-label", "Quantity of " + product.name);
        input.dataset.basketQuantity = id;
        label.appendChild(input);
        controls.appendChild(label);
        var remove = createText("button", "remove-item", "Remove");
        remove.type = "button";
        remove.dataset.removeFromBasket = id;
        controls.appendChild(remove);
        details.appendChild(controls);
        row.appendChild(details);
        row.appendChild(createText("strong", "cart-item-total", money.format(product.price * quantity)));
        container.appendChild(row);
      });
      if (checkoutLink) {
        checkoutLink.removeAttribute("aria-disabled");
        checkoutLink.classList.remove("is-disabled");
        checkoutLink.href = "checkout.html";
        checkoutLink.textContent = "Continue to checkout";
      }
    }
    var subtotal = money.format(basketTotal());
    $$("[data-cart-subtotal], [data-cart-total]").forEach(function (element) { element.textContent = subtotal; });
  }

  function renderCheckoutSummary() {
    var container = $("[data-checkout-items]");
    if (!container) return;
    container.replaceChildren();
    Object.keys(basket).forEach(function (id) {
      var product = PRODUCTS[id];
      var line = createText("div", "checkout-item");
      line.appendChild(createText("span", "", product.name + " × " + basket[id]));
      line.appendChild(createText("strong", "", money.format(product.price * basket[id])));
      container.appendChild(line);
    });
    var total = money.format(basketTotal());
    $$("[data-checkout-subtotal], [data-checkout-total]").forEach(function (element) { element.textContent = total; });
  }

  function addToBasket(id, quantity) {
    if (!PRODUCTS[id]) {
      announceBasket("That product could not be added. Please refresh and try again.");
      return;
    }
    var count = basket[id] || 0;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20 || count + quantity > 20) {
      announceBasket("You can add up to 20 packs of one product.");
      return;
    }
    if (basketCount() + quantity > 50) {
      announceBasket("Your basket can hold up to 50 packs in total.");
      return;
    }
    basket[id] = count + quantity;
    var saved = saveBasket();
    updateBasketCount();
    renderCartPage();
    renderCheckoutSummary();
    if (saved) announceBasket(PRODUCTS[id].name + " added to your basket.");
  }

  function setBasketQuantity(id, quantity) {
    if (!PRODUCTS[id]) return;
    if (!Number.isInteger(quantity) || quantity < 1) {
      delete basket[id];
    } else {
      var otherItems = basketCount() - (basket[id] || 0);
      basket[id] = Math.min(quantity, 20, Math.max(0, 50 - otherItems));
      if (basket[id] === 0) delete basket[id];
      if (basket[id] !== quantity) announceBasket("You can add up to 20 packs of one product and 50 packs in total.");
    }
    saveBasket();
    updateBasketCount();
    renderCartPage();
    renderCheckoutSummary();
  }

  basket = readBasket();
  makeBasketNav();
  updateBasketCount();
  renderCartPage();
  renderCheckoutSummary();
  document.addEventListener("click", function (event) {
    var addButton = event.target.closest("[data-add-to-cart], [data-product-add]");
    if (addButton) {
      var productId = addButton.dataset.addToCart || addButton.dataset.productAdd;
      var quantityInput = $("[data-product-quantity]");
      var quantity = quantityInput ? Number(quantityInput.value) : 1;
      addToBasket(productId, quantity);
      return;
    }
    var removeButton = event.target.closest("[data-remove-from-basket]");
    if (removeButton) setBasketQuantity(removeButton.dataset.removeFromBasket, 0);
  });
  document.addEventListener("change", function (event) {
    var quantityInput = event.target.closest("[data-basket-quantity]");
    if (quantityInput) setBasketQuantity(quantityInput.dataset.basketQuantity, Number(quantityInput.value));
  });

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
    var addButton = $("[data-product-add]");
    if (addButton) {
      addButton.dataset.productAdd = type + "-" + key;
      addButton.textContent = "Add to basket · " + money.format(200);
    }

    var desc = title + " by Ruhani Room. " + s.note + ". " + s.text;
    document.title = title + " | Natural Incense | Ruhani Room";
    var meta = $('meta[name="description"]'); if (meta) meta.setAttribute("content", desc);
    var ogt = $('meta[property="og:title"]'); if (ogt) ogt.setAttribute("content", document.title);
    var ogd = $('meta[property="og:description"]'); if (ogd) ogd.setAttribute("content", desc);
  }

  /* ---- Delivery and Razorpay checkout ---- */
  var checkoutForm = $("[data-delivery-form]");
  if (checkoutForm) {
    var paymentButton = $("[data-pay-button]", checkoutForm);
    var paymentSetup = $("[data-payment-setup]");
    var checkoutMessage = $("[data-checkout-message]");
    var checkoutSection = $(".checkout-layout");
    var paymentSuccess = $("[data-payment-success]");
    var retryVerificationButton = $("[data-retry-verification]");
    var checkoutEnabled = false;
    var checkoutBusy = false;
    var pendingPayment = null;
    var paymentKeyId = null;

    if (!basketCount()) {
      checkoutForm.hidden = true;
      if (checkoutSection) {
        var empty = createText("div", "checkout-empty");
        empty.appendChild(createText("h2", "", "Your basket is empty."));
        empty.appendChild(createText("p", "", "Add a fragrance before entering delivery details."));
        var shopLink = createText("a", "btn btn-solid", "Browse the collection");
        shopLink.href = "shop.html";
        empty.appendChild(shopLink);
        checkoutSection.insertBefore(empty, checkoutForm);
      }
    }

    function setCheckoutMessage(message, isError) {
      if (!checkoutMessage) return;
      checkoutMessage.textContent = message;
      checkoutMessage.classList.toggle("is-error", Boolean(isError));
      checkoutMessage.classList.toggle("is-success", Boolean(message) && !isError);
    }

    function updatePaymentButton() {
      if (!paymentButton) return;
      paymentButton.disabled = checkoutBusy || !checkoutEnabled || !basketCount() || Boolean(pendingPayment);
      paymentButton.textContent = checkoutBusy ? (pendingPayment ? "Confirming payment…" : "Preparing secure payment…") :
        pendingPayment ? "Payment confirmation needed" :
          checkoutEnabled ? "Pay " + money.format(basketTotal()) + " securely" : "Secure payment unavailable";
    }

    fetch("/api/payment-config", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Payment configuration could not be loaded.");
        return response.json();
      })
      .then(function (config) {
        checkoutEnabled = Boolean(config.enabled && config.keyId);
        paymentKeyId = checkoutEnabled ? config.keyId : null;
        if (checkoutEnabled && paymentSetup) {
          paymentSetup.hidden = true;
        } else if (paymentSetup) {
          paymentSetup.hidden = false;
        }
        updatePaymentButton();
      })
      .catch(function (error) {
        console.error("Could not check Razorpay configuration:", error.message);
        if (paymentSetup) {
          paymentSetup.hidden = false;
          paymentSetup.querySelector("strong").textContent = "We could not connect to secure checkout.";
          paymentSetup.querySelector("span").textContent = "Please refresh this page. Your basket is still saved.";
        }
        updatePaymentButton();
      });

    function loadRazorpay() {
      if (window.Razorpay) return Promise.resolve();
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = function () {
          if (window.Razorpay) resolve();
          else reject(new Error("Razorpay checkout did not load."));
        };
        script.onerror = function () { reject(new Error("Secure payment could not be loaded. Check your connection and try again.")); };
        document.head.appendChild(script);
      });
    }

    async function verifyPayment(payment) {
      pendingPayment = payment;
      checkoutBusy = true;
      if (retryVerificationButton) retryVerificationButton.hidden = true;
      setCheckoutMessage("Payment received. We’re securely confirming it now…", false);
      updatePaymentButton();
      try {
        var verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payment)
        });
        var verification = await verifyResponse.json();
        if (!verifyResponse.ok || !verification.verified) {
          throw new Error(verification.error || "Payment confirmation is still pending.");
        }
        pendingPayment = null;
        basket = {};
        saveBasket();
        updateBasketCount();
        renderCartPage();
        renderCheckoutSummary();
        if (checkoutSection) checkoutSection.hidden = true;
        if (paymentSuccess) {
          $("[data-payment-reference]", paymentSuccess).textContent = verification.paymentId;
          paymentSuccess.hidden = false;
          paymentSuccess.focus();
        }
        setCheckoutMessage("", false);
      } catch (error) {
        console.error("Payment confirmation needs attention:", error.message);
        setCheckoutMessage(error.message + " Do not pay again yet. Retry confirmation, or contact hello@ruhaniroom.com with payment reference " +
          (payment.razorpay_payment_id || "shown by Razorpay") + ".", true);
        if (retryVerificationButton) retryVerificationButton.hidden = false;
      } finally {
        checkoutBusy = false;
        updatePaymentButton();
      }
    }

    if (retryVerificationButton) {
      retryVerificationButton.addEventListener("click", function () {
        if (pendingPayment && !checkoutBusy) verifyPayment(pendingPayment);
      });
    }

    checkoutForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (checkoutBusy || !checkoutEnabled || !basketCount()) return;
      if (!checkoutForm.reportValidity()) {
        var invalid = checkoutForm.querySelector(":invalid");
        if (invalid) invalid.focus();
        return;
      }

      var values = new FormData(checkoutForm);
      var phoneDigits = String(values.get("phone")).replace(/[^\d]/g, "");
      var customer = {
        name: String(values.get("name")).trim(),
        email: String(values.get("email")).trim(),
        phone: String(values.get("phone")).trim(),
        address: String(values.get("address")).trim(),
        city: String(values.get("city")).trim(),
        state: String(values.get("state")).trim(),
        postalCode: String(values.get("postalCode")).trim()
      };
      checkoutBusy = true;
      setCheckoutMessage("", false);
      updatePaymentButton();

      try {
        await loadRazorpay();
        var orderResponse = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            items: Object.keys(basket).map(function (id) { return { id: id, quantity: basket[id] }; }),
            customer: customer
          })
        });
        var order = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(order.error || "We could not start secure checkout.");

        var razorpay = new window.Razorpay({
          key: paymentKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "Ruhani Room",
          description: "Incense for a calmer home",
          image: "assets/images/brand/favicon.png",
          order_id: order.order_id,
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: "+" + (phoneDigits.length === 10 ? "91" + phoneDigits : phoneDigits)
          },
          notes: { delivery_postal_code: customer.postalCode },
          theme: { color: "#2b201a" },
          modal: {
            ondismiss: function () {
              checkoutBusy = false;
              setCheckoutMessage("Payment window closed. Your basket is saved; you can try again whenever you’re ready.", false);
              updatePaymentButton();
            }
          },
          handler: async function (payment) {
            await verifyPayment(payment);
          }
        });
        razorpay.on("payment.failed", function (failure) {
          var description = failure && failure.error && failure.error.description;
          setCheckoutMessage(description || "Payment did not go through. Your basket is saved, so you can try again.", true);
          checkoutBusy = false;
          updatePaymentButton();
        });
        razorpay.open();
      } catch (error) {
        console.error("Could not start secure checkout:", error.message);
        setCheckoutMessage(error.message || "We could not start secure checkout. Please try again.", true);
        checkoutBusy = false;
        updatePaymentButton();
      }
    });
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
