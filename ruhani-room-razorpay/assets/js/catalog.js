/* Ruhani Room — product catalogue (single source of truth for names and prices).
   Used by the browser (window.RUHANI_CATALOG) and by the payment functions
   (require("../assets/js/catalog.js")). Prices are whole rupees per pack.
   Change a price here and every page, the basket and Razorpay all follow. */
(function (root) {
  "use strict";
  var CATALOG = {
    "sticks-rose": { name: "Rose Incense Sticks", price: 200 },
    "sticks-mogra": { name: "Mogra Incense Sticks", price: 200 },
    "sticks-sandalwood": { name: "Sandalwood Incense Sticks", price: 200 },
    "sticks-lavender": { name: "Lavender Incense Sticks", price: 200 },
    "sticks-jasmine": { name: "Jasmine Incense Sticks", price: 200 },
    "cones-rose": { name: "Rose Dhoop Cones", price: 200 },
    "cones-mogra": { name: "Mogra Dhoop Cones", price: 200 },
    "cones-sandalwood": { name: "Sandalwood Dhoop Cones", price: 200 },
    "cones-lavender": { name: "Lavender Dhoop Cones", price: 200 },
    "cones-jasmine": { name: "Jasmine Dhoop Cones", price: 200 },
    "havan-classic": { name: "Havan Cups (pack of six)", price: 200 }
  };
  if (typeof module === "object" && module.exports) {
    module.exports = CATALOG;
  } else {
    root.RUHANI_CATALOG = CATALOG;
  }
})(typeof window !== "undefined" ? window : this);
