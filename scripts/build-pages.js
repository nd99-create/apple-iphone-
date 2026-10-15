"use strict";

var fs = require("node:fs");
var path = require("node:path");
var products = require("../assets/js/catalog.js");
var copy = require("../assets/js/product-copy.js");
var faq = require("./faq.js");
var siteConfig = require("./site-config.js");
var root = path.resolve(__dirname, "..");
var siteUrl = siteConfig.SITE_URL;
var checkOnly = process.argv.includes("--check");

var scentNames = {
  rose: "Rose",
  mogra: "Mogra",
  sandalwood: "Sandalwood",
  lavender: "Lavender",
  jasmine: "Jasmine"
};
var categories = {
  sticks: {
    path: "/incense-sticks/",
    title: "Incense Sticks (Agarbatti) Online in India | Ruhani Room",
    description: "Five classic Indian fragrances in packs of 28 incense sticks — rose, mogra, sandalwood, lavender and jasmine. ₹200 a pack, free delivery across India.",
    intro: "Incense sticks are a familiar way to bring fragrance into a home, from daily puja to a quiet evening. Explore five classic Indian fragrances: rose, mogra, sandalwood, lavender and jasmine. Each pack contains 28 sticks and is ₹200, with free delivery across India. Choose rose agarbatti for a soft floral note, mogra for a richer floral fragrance, sandalwood for warm woods, lavender for a herbal note, or jasmine for a bright floral character. These fragrance sticks for home are designed for use with a suitable incense stick holder. Whether you are choosing puja agarbatti or a gentle scent for everyday moments, each fragrance has its own character. Browse the collection below and select the aroma that feels right for your space.",
    choose: "How to choose: start with the fragrance you enjoy, then choose a suitable holder and a well-ventilated place to burn your incense."
  },
  cones: {
    path: "/dhoop-cones/",
    title: "Dhoop Cones (Dhoop Batti) Online in India | Ruhani Room",
    description: "Explore dhoop cones in five Indian fragrances, with 28 cones in each ₹200 pack. Choose rose, mogra, sandalwood, lavender or jasmine. Free delivery across India.",
    intro: "Dhoop cones bring a concentrated fragrance to everyday puja and home rituals. Explore five classic Indian fragrances: rose, mogra, sandalwood, lavender and jasmine. Each pack contains 28 dhoop cones and costs ₹200, with free delivery across India. Choose rose dhoop for a soft floral note, mogra for a rich blossom fragrance, sandalwood for warm woods, lavender for a herbal character, or jasmine for a bright floral feel. These incense cones are designed for use with a suitable, heat-resistant cone holder. Whether you call them dhoop batti or puja dhoop, choose a fragrance that belongs in your daily moments. Browse each scent below and use the cones according to the product instructions. Keep the holder on a stable, heat-resistant surface while a cone is burning.",
    choose: "How to choose: select a fragrance for the moment, and always burn each cone upright on a suitable, heat-resistant holder."
  },
  havan: {
    path: "/havan-cups/",
    title: "Havan Cups for Puja at Home Online in India | Ruhani Room",
    description: "Find havan cups for puja and meaningful home rituals. Mangala is suited to devotional practices, housewarmings and traditional ceremonies. ₹200, free delivery.",
    intro: "Havan cups offer a considered way to mark devotional practices and auspicious occasions at home. Mangala is inspired by the significance of sacred fire in Indian traditions, and is intended for meaningful moments, festive preparations and traditional ceremonies. If you are looking for a hawan cup for home or a havan cup for puja, follow the product instructions and take care to place it on a stable, non-flammable, heat-resistant surface in a well-ventilated area. Havan cups may accompany housewarmings and griha pravesh puja when used appropriately. Across the wider Ruhani Room collection, rose, mogra, sandalwood, lavender and jasmine fragrances are available as incense sticks and dhoop cones. Mangala is ₹200, with free delivery across India. Never leave a burning cup unattended.",
    choose: "How to choose: Mangala is made for appropriate devotional practices and auspicious occasions. Follow the instructions supplied with the product."
  },
  bundles: {
    path: "/diwali-bundles/",
    title: "Diwali Incense Bundles & Gift Sets Online | Ruhani Room",
    description: "Explore three Diwali bundles with incense sticks, dhoop cones and havan cups. Thoughtful festive gifts from ₹549, with free delivery across India.",
    intro: "Bring a little more warmth to Diwali with thoughtfully paired incense, dhoop and havan rituals. Each bundle gathers familiar fragrances into a ready-to-gift set, with clear savings against individual pack prices and free delivery across India.",
    choose: "Each bundle is a fixed set at a festive price. Check the included products on its page, and follow the individual product instructions when lighting incense or havan cups."
  }
};

var productMeta = {
  "sticks-rose": ["Prema Rose Incense Sticks — Pack of 28 | Ruhani Room", "Prema rose incense sticks (gulab agarbatti) with a soft, warm, gently sweet fragrance for puja, meditation and quiet evenings. ₹200, free delivery."],
  "sticks-mogra": ["Mallika Mogra Agarbatti — Pack of 28 | Ruhani Room", "Shop mogra agarbatti with a rich, creamy floral fragrance for morning puja, festive preparations and quiet moments at home. ₹200, free delivery."],
  "sticks-sandalwood": ["Chandana Sandalwood Incense Sticks | Ruhani Room India", "Chandana sandalwood incense sticks (chandan agarbatti) bring a warm, woody fragrance to meditation, prayer and quiet evening rituals. ₹200, free delivery."],
  "sticks-lavender": ["Shanti Lavender Incense Sticks — Pack of 28 | Ruhani Room", "Shanti lavender incense sticks offer a clean, herbal fragrance for quiet evenings, reading and mindful home rituals. ₹200, free delivery across India."],
  "sticks-jasmine": ["Saurabha Jasmine Incense Sticks — Pack of 28 | Ruhani Room", "Saurabha jasmine incense sticks bring a bright floral fragrance to morning rituals, welcoming guests and everyday moments at home. ₹200, free delivery."],
  "cones-rose": ["Smriti Rose Dhoop Cones — Pack of 28 | Ruhani Room", "Smriti rose dhoop cones (gulab dhoop) bring a gentle floral warmth to daily puja, evening rituals and welcoming moments at home. ₹200, free delivery."],
  "cones-mogra": ["Kusuma Mogra Dhoop Cones — Pack of 28 | Ruhani Room", "Kusuma mogra dhoop cones bring a creamy floral fragrance to morning puja, festive rituals and devotional practices at home. ₹200, free delivery across India."],
  "cones-sandalwood": ["Dhara Sandalwood Dhoop Cones — Pack of 28 | Ruhani Room", "Dhara sandalwood dhoop cones (chandan dhoop) bring warm, woody fragrance to prayer, meditation and traditional home rituals. ₹200, free delivery."],
  "cones-lavender": ["Nivriti Lavender Dhoop Cones — Pack of 28 | Ruhani Room", "Nivriti lavender dhoop cones bring a clean, herbal fragrance to quiet evenings, reflective moments and relaxed home rituals. ₹200, free delivery across India."],
  "cones-jasmine": ["Prakriti Jasmine Dhoop Cones — Pack of 28 | Ruhani Room", "Prakriti jasmine dhoop cones bring bright floral fragrance to morning puja, festive preparations and everyday rituals at home. ₹200, free delivery across India."],
  "havan-classic": ["Mangala Havan Cups for Puja | Ruhani Room", "Mangala havan cups for puja and auspicious home rituals. Suitable for devotional practices, housewarmings and ceremonies. ₹200, free delivery across India."],
  "diwali-deepa": ["Deepa Diwali Incense Ritual Gift Bundle | Ruhani Room", "Celebrate Diwali with Deepa: rose incense sticks, sandalwood dhoop cones and a havan cup together for ₹549, with free delivery across India."],
  "diwali-shubha": ["Shubha Diwali Incense & Havan Gift Bundle | Ruhani Room", "Share Shubha this Diwali with mogra incense sticks, jasmine dhoop cones and a havan cup for ₹549, with free delivery across India. A festive gift for home."],
  "diwali-samriddhi": ["Samriddhi Diwali Five-Fragrance Gift Bundle | Ruhani Room", "Welcome Diwali with all five incense fragrances in one Samriddhi gift bundle for ₹899, with free delivery across India. A thoughtful gift for Diwali at home."]
};
var uspIcons = {
  "Save ₹51": "spark",
  "Save ₹101": "spark",
  "Free delivery": "gift",
  "3-piece festive set": "diya",
  "5 fragrances": "gift"
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}

function absolute(urlPath) {
  return siteUrl + (urlPath.charAt(0) === "/" ? urlPath : "/" + urlPath);
}

function categoryFor(product) {
  if (product.format === "bundle") return categories.bundles;
  return product.format === "sticks" ? categories.sticks : product.format === "cones" ? categories.cones : categories.havan;
}

function crumbData(items) {
  return items.map(function (item, index) {
    return { "@type": "ListItem", position: index + 1, name: item.name, item: absolute(item.path) };
  });
}

function rootSchemas(extra) {
  return [
    {
      "@type": "Organization",
      name: "Ruhani Room",
      url: siteUrl + "/",
      logo: absolute("/assets/images/brand/logo-horizontal-maroon.png"),
      slogan: "Rituals for a calmer you"
    },
    { "@type": "WebSite", name: "Ruhani Room", url: siteUrl + "/", inLanguage: "en-IN" }
  ].concat(extra || []);
}

function headMarkup(meta, canonical, type, image, imageAlt, schemas, robots) {
  var canonicalTag = canonical ? '<link rel="canonical" href="' + escapeHtml(absolute(canonical)) + '">' : "";
  var robotsTag = robots ? '<meta name="robots" content="' + escapeHtml(robots) + '">' : "";
  var graph = schemas && schemas.length
    ? '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", "@graph": schemas }) + "</script>"
    : "";
  return [
    "<title>" + escapeHtml(meta.title) + "</title>",
    '<meta name="description" content="' + escapeHtml(meta.description) + '">',
    '<meta name="theme-color" content="#8e2a3b">',
    robotsTag,
    canonicalTag,
    '<meta property="og:type" content="' + escapeHtml(type || "website") + '">',
    '<meta property="og:site_name" content="Ruhani Room">',
    '<meta property="og:title" content="' + escapeHtml(meta.title) + '">',
    '<meta property="og:description" content="' + escapeHtml(meta.description) + '">',
    '<meta property="og:url" content="' + escapeHtml(absolute(canonical || "/")) + '">',
    '<meta property="og:image" content="' + escapeHtml(absolute(image)) + '">',
    '<meta property="og:image:alt" content="' + escapeHtml(imageAlt) + '">',
    '<meta property="og:locale" content="en_IN">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + escapeHtml(meta.title) + '">',
    '<meta name="twitter:description" content="' + escapeHtml(meta.description) + '">',
    '<meta name="twitter:image" content="' + escapeHtml(absolute(image)) + '">',
    graph
  ].filter(Boolean).join("\n  ");
}

function rewriteHead(html, meta, canonical, type, image, imageAlt, schemas, robots) {
  var head = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!head) throw new Error("Page template has no head element.");
  var contents = head[1]
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, "\n")
    .replace(/<meta name="(?:description|theme-color|robots)"[^>]*>\s*/gi, "\n")
    .replace(/<link rel="canonical"[^>]*>\s*/gi, "\n")
    .replace(/<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>\s*/gi, "\n")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "\n");
  contents = contents.replace(/(<link rel="stylesheet" href="\/?assets\/css\/ruhani\.css">)/i,
    headMarkup(meta, canonical, type, image, imageAlt, schemas, robots) + "\n  $1");
  if (!contents.includes("<title>")) {
    contents = headMarkup(meta, canonical, type, image, imageAlt, schemas, robots) + "\n  " + contents;
  }
  contents = contents.replace(/\n[ \t]*\n+/g, "\n").replace(/^[ \t]+$/gm, "").trimEnd();
  return html.replace(head[0], "<head>" + contents + "</head>");
}

function rewriteSharedLinks(html) {
  var links = {
    'href="index.html"': 'href="/"',
    'href="index.html#fragrances"': 'href="/#fragrances"',
    'href="index.html#ritual"': 'href="/#ritual"',
    'href="index.html#faq"': 'href="/#faq"',
    'href="shop.html?type=sticks"': 'href="/incense-sticks/"',
    'href="shop.html?type=cones"': 'href="/dhoop-cones/"',
    'href="shop.html?type=havan"': 'href="/havan-cups/"',
    'href="shop.html"': 'href="/shop.html"',
    'href="contact.html"': 'href="/contact.html"',
    'href="cart.html"': 'href="/cart.html"',
    'href="checkout.html"': 'href="/checkout.html"',
    'src="assets/': 'src="/assets/',
    'href="assets/': 'href="/assets/',
    'src="assets/js/catalog.js"': 'src="/assets/js/catalog.js"',
    'src="assets/js/main.js"': 'src="/assets/js/main.js"'
  };
  Object.keys(links).forEach(function (source) { html = html.split(source).join(links[source]); });
  html = html.replace(/href="product\.html\?type=(sticks|cones)&amp;f=(rose|mogra|sandalwood|lavender|jasmine)"/g, function (_match, format, scent) {
    var id = format + "-" + scent;
    return 'href="' + products[id].href + '"';
  });
  html = html.replace(/href="product-havan\.html"/g, 'href="' + products["havan-classic"].href + '"');
  var images = {
    "stick-rose.webp": "prema-rose-incense-sticks.webp",
    "stick-mogra.webp": "mallika-mogra-incense-sticks.webp",
    "stick-sandalwood.webp": "chandana-sandalwood-incense-sticks.webp",
    "stick-lavender.webp": "shanti-lavender-incense-sticks.webp",
    "stick-jasmine.webp": "saurabha-jasmine-incense-sticks.webp",
    "cone-rose.webp": "smriti-rose-dhoop-cones.webp",
    "cone-mogra.webp": "kusuma-mogra-dhoop-cones.webp",
    "cone-sandalwood.webp": "dhara-sandalwood-dhoop-cones.webp",
    "cone-lavender.webp": "nivriti-lavender-dhoop-cones.webp",
    "cone-jasmine.webp": "prakriti-jasmine-dhoop-cones.webp",
    "havan.webp": "mangala-havan-cups.webp",
    "products/sticks.webp": "products/ruhani-room-incense-puja-hero.webp"
  };
  Object.keys(images).forEach(function (original) {
    html = html.split(original).join(images[original]);
  });
  html = html.replace(
    /(prema-rose|mallika-mogra|chandana-sandalwood|shanti-lavender|saurabha-jasmine)-incense-ruhani-room-incense-puja-hero\.webp/g,
    "$1-incense-sticks.webp"
  );
  return html;
}

function readSharedChunks(template) {
  var header = fs.readFileSync(path.join(root, "scripts/partials/site-header.html"), "utf8").trim();
  var footer = fs.readFileSync(path.join(root, "scripts/partials/site-footer.html"), "utf8").trim();
  if (!header.includes("shared-header:start") || !footer.includes("shared-footer:start")) {
    throw new Error("Shared header and footer partials must include their replacement markers.");
  }
  return {
    header: rewriteSharedLinks(header),
    footer: rewriteSharedLinks(footer)
  };
}

function applySharedShell(html, chunks) {
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/g,
    '<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700&family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet">');
  var headerMarker = /<!-- shared-header:start -->[\s\S]*?<!-- shared-header:end -->/;
  var footerMarker = /<!-- shared-footer:start -->[\s\S]*?<!-- shared-footer:end -->/;
  if (headerMarker.test(html)) {
    html = html.replace(headerMarker, chunks.header);
  } else {
    html = html.replace(/<div class="announce"[^>]*>[\s\S]*?<\/div>\s*<header class="site-header">[\s\S]*?<\/header>/,
      chunks.header);
  }
  if (footerMarker.test(html)) {
    html = html.replace(footerMarker, chunks.footer);
  } else {
    html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, chunks.footer);
  }
  if (!html.includes("shared-header:start") || !html.includes("shared-footer:start")) {
    throw new Error("Page is missing the shared header or footer insertion point.");
  }
  return html;
}

function renderCrumbs(items) {
  return '<p class="crumbs">' + items.map(function (item, index) {
    if (index === items.length - 1) return escapeHtml(item.name);
    return '<a href="' + escapeHtml(item.path) + '">' + escapeHtml(item.name) + "</a>";
  }).join(" / ") + "</p>";
}

function renderProductCard(id) {
  var product = products[id];
  var iconId = product.scent === "classic" ? "havan" : product.scent;
  var icon = '<svg class="scent-icon" aria-hidden="true"><use href="/assets/images/brand/fragrance-sprite.svg#' + escapeHtml(iconId) + '"></use></svg>';
  return '<article class="product" data-type="' + product.format + '" data-scent="' + escapeHtml(product.scent) + '">' +
    '<a class="img" href="' + product.href + '"><img src="/assets/images/products/' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.alt) + '" width="' + productWidth(product) + '" height="' + productHeight(product) + '" loading="lazy"></a>' +
    '<p class="product-sanskrit"><span>' + escapeHtml(product.sanskrit) + '</span><span class="product-sku">SKU ' + escapeHtml(product.sku) + "</span></p>" +
    '<div class="meta">' + icon + escapeHtml(product.type) + "</div>" +
    '<h2><a href="' + product.href + '">' + escapeHtml(product.name) + "</a></h2>" +
    '<p>' + escapeHtml(copy[id].description) + "</p>" +
    '<div class="row shop-buy"><span class="product-price">₹' + products[id].price + "</span>" +
    '<button class="btn btn-line" type="button" data-add-to-cart="' + id + '">Add to basket</button>' +
    '<a class="text-link" href="' + product.href + '">Details</a></div></article>';
}

function productWidth(product) { return product.format === "sticks" ? 176 : product.format === "cones" ? 300 : 1063; }
function productHeight(product) { return product.format === "sticks" ? 690 : product.format === "cones" ? 380 : 1480; }

function categorySchema(category, ids) {
  return {
    "@type": "CollectionPage",
    name: category.title,
    url: absolute(category.path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ids.map(function (id, index) {
        return { "@type": "ListItem", position: index + 1, url: absolute(products[id].href), name: products[id].name };
      })
    }
  };
}

function pageShell(chunks, meta, canonical, main, type, image, imageAlt, schemas, robots) {
  var template = fs.readFileSync(path.join(root, "product.html"), "utf8");
  var shellStart = template.indexOf("<!-- shared-header:start -->");
  if (shellStart < 0) throw new Error("Product template is missing the shared header marker.");
  var html = template.slice(0, shellStart) +
    chunks.header + "\n" + main + "\n" + chunks.footer +
    '\n<script src="/assets/js/catalog.js" defer></script>\n<script src="/assets/js/main.js" defer></script>\n</body>\n</html>\n';
  html = rewriteHead(rewriteSharedLinks(html), meta, canonical, type, image, imageAlt, rootSchemas(schemas), robots);
  if (type === "product") {
    html = html.replace("</head>", "<!-- TODO: add hasMerchantReturnPolicy only after a verified returns policy exists. -->\n</head>");
  }
  return html;
}

function renderCategory(chunks, key) {
  var category = categories[key];
  var ids = Object.keys(products).filter(function (id) {
    return products[id].format === (key === "bundles" ? "bundle" : key);
  });
  var name = key === "sticks" ? "Incense Sticks" : key === "cones" ? "Dhoop Cones" : key === "havan" ? "Havan Cups" : "Diwali Bundles";
  var breadcrumb = renderCrumbs([{ name: "Home", path: "/" }, { name: name }]);
  var main = '<main id="main"><section class="page-head"><div class="wrap">' + breadcrumb +
    '<h1>' + name + "</h1><p class=\"lead\">" + escapeHtml(category.intro) + '</p></div></section>' +
    '<section class="section"><div class="wrap"><div class="products">' + ids.map(renderProductCard).join("\n") +
    '</div><div class="category-copy"><h2>How to choose</h2><p>' + escapeHtml(category.choose) +
    '</p><p>Explore <a href="/incense-sticks/">incense sticks</a>, <a href="/dhoop-cones/">dhoop cones</a> and <a href="/havan-cups/">havan cups</a>.</p></div></div></section></main>';
  return {
    path: category.path,
    file: path.join(root, category.path.slice(1), "index.html"),
    html: pageShell(chunks, category, category.path, main, "website", "/assets/images/og-image.jpg", name + " by Ruhani Room", [
      categorySchema(category, ids),
      { "@type": "BreadcrumbList", itemListElement: crumbData([{ name: "Home", path: "/" }, { name: name, path: category.path }]) }
    ])
  };
}

function productSchema(id, product, meta) {
  var productUrl = absolute(product.href);
  var category = categoryFor(product);
  var copyDescription = copy[id].description;
  var sentenceParts = copyDescription.match(/[^.!?]+[.!?]+/g) || [copyDescription];
  var schemaDescription = sentenceParts.slice(0, 2).join("").trim();
  return {
    "@type": "Product",
    name: product.sanskrit + " — " + product.name.replace(/^[^ ]+ /, "").replace(/ \(pack of six\)/i, ""),
    description: schemaDescription,
    image: [absolute("/assets/images/products/" + product.image), absolute("/assets/images/og/" + id + ".svg")],
    sku: product.sku,
    brand: { "@type": "Brand", name: "Ruhani Room" },
    category: product.type,
    offers: {
      "@type": "Offer",
      price: products[id].price.toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "INR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" }
      }
    }
  };
}

function renderProduct(chunks, id) {
  var product = products[id];
  var data = copy[id];
  var category = categoryFor(product);
  var meta = { title: productMeta[id][0], description: productMeta[id][1] };
  var categoryName = product.format === "sticks" ? "Incense Sticks" : product.format === "cones" ? "Dhoop Cones" : product.format === "bundle" ? "Diwali Bundles" : "Havan Cups";
  var h1 = product.sanskrit + " — " + product.name.replace(/^[^ ]+ /, "").replace(/ \(pack of six\)/i, "");
  var breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: categoryName, path: category.path },
    { name: product.name.replace(/ \(pack of six\)/i, ""), path: product.href }
  ];
  var imageMarkup = '<img class="main" src="/assets/images/products/' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.alt) + '" width="' + productWidth(product) + '" height="' + productHeight(product) + '">';
  var stepMarkup = data.steps.map(function (step, index) {
    if (typeof step === "string") return "<li>" + escapeHtml(step) + "</li>";
    return '<li><strong>' + (index + 1) + ". " + escapeHtml(step.title) + ":</strong> " + escapeHtml(step.text) + "</li>";
  }).join("");
  var bullets = data.bullets.map(function (bullet) { return "<li>" + escapeHtml(bullet) + "</li>"; }).join("");
  var usps = data.usps.map(function (usp) {
    var iconId = uspIcons[usp] || (product.scent === "classic" ? "havan" : product.scent);
    return '<span class="product-usp"><svg class="scent-icon" aria-hidden="true"><use href="/assets/images/brand/fragrance-sprite.svg#' +
      escapeHtml(iconId) + '"></use></svg>' + escapeHtml(usp) + "</span>";
  }).join("");
  var otherFormatId = product.format === "sticks" ? "cones-" + product.scent : product.format === "cones" ? "sticks-" + product.scent : product.format === "bundle" ? "sticks-" + product.scent : "cones-sandalwood";
  var relatedIds = Object.keys(products).filter(function (otherId) {
    return otherId !== id && products[otherId].scent !== product.scent && products[otherId].format === product.format;
  }).slice(0, 2);
  var related = [otherFormatId].concat(relatedIds);
  if (product.format !== "havan") related.push("havan-classic");
  var relatedLinks = Array.from(new Set(related)).filter(function (otherId) { return otherId !== id; }).map(function (otherId) {
    return '<li><a href="' + products[otherId].href + '">' + escapeHtml(products[otherId].name) + "</a></li>";
  }).join("");
  var bundleContents = product.contents ? '<section class="bundle-contents"><h2>Inside the bundle</h2><ul>' +
    product.contents.map(function (itemId) {
      var included = products[itemId];
      return '<li><a href="' + included.href + '">' + escapeHtml(included.name) + "</a></li>";
    }).join("") + "</ul></section>" : "";
  var specsComment = product.format === "havan" ? "<!-- TODO: add verified pack quantity, ingredients and burn duration -->" : "";
  var safety = "Never leave burning incense unattended. Keep away from children, pets and flammable materials.";
  var main = '<main id="main" data-product-page data-static-product-page><section class="section product-page" data-scent="' + escapeHtml(product.scent) + '"><div class="wrap">' +
    renderCrumbs(breadcrumbItems) + '<div class="pd-grid"><div class="pd-gallery">' + imageMarkup + '</div><div class="pd-info">' +
    '<p class="eyebrow">' + escapeHtml(product.sanskritNative ? product.sanskritNative + " · " : "") + escapeHtml(product.type) +
    ' <span class="product-sku">SKU ' + escapeHtml(product.sku) + "</span></p>" +
    "<h1>" + escapeHtml(h1) + "</h1><div class=\"product-usps\">" + usps + "</div>" +
    '<div class="purchase-actions"><label class="quantity-field" for="product-quantity">Quantity <input id="product-quantity" data-product-quantity type="number" min="1" max="20" value="1" inputmode="numeric"></label>' +
    '<button class="btn btn-solid" type="button" data-product-add="' + id + '">Add to basket · ₹' + products[id].price + "</button></div>" +
    '<p class="purchase-note">Free delivery across India. Secure payment at checkout.</p>' +
    '<p class="product-description">' + escapeHtml(data.description) + "</p>" + bundleContents + "<ul class=\"product-bullets\">" + bullets + "</ul>" + specsComment +
    '<section class="how-to-use" id="how-to-use"><h2>How to Use</h2><ol>' + stepMarkup + "</ol></section>" +
    '<p class="product-closing">' + escapeHtml(data.closing) + "</p><p class=\"safety-note\">" + escapeHtml(safety) + "</p>" +
    '<p><a href="' + category.path + '">Browse ' + escapeHtml(categoryName.toLowerCase()) + "</a></p>" +
    '<section class="pairs"><h2>Pairs well with</h2><ul>' + relatedLinks + '</ul></section><p><a href="/contact.html#faq">Read answers to common questions</a></p>' +
    "</div></div></div></section></main>";
  var breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: crumbData(breadcrumbItems)
  };
  var ogFile = "/assets/images/og/" + id + ".svg";
  return {
    path: product.href,
    file: path.join(root, product.href.slice(1), "index.html"),
    html: pageShell(chunks, meta, product.href, main, "product", ogFile, product.alt, [productSchema(id, product, meta), breadcrumbSchema])
  };
}

function makeSocialSvg(id) {
  var product = products[id];
  var display = product.sanskritNative ? product.sanskrit + " · " + product.sanskritNative : product.sanskrit;
  var scent = product.name.replace(/^[^ ]+ /, "").replace(/ \(pack of six\)/i, "");
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">' +
    '<rect width="1200" height="630" fill="#f3ece0"/><path d="M800 0h400v630H800z" fill="#3a1414"/>' +
    '<image x="850" y="40" width="300" height="550" preserveAspectRatio="xMidYMid meet" href="' + absolute("/assets/images/products/" + product.image) + '"/>' +
    '<text x="88" y="200" fill="#84592a" font-family="Georgia,serif" font-size="32" letter-spacing="5">RUHANI ROOM</text>' +
    '<text x="88" y="285" fill="#2b201a" font-family="Georgia,serif" font-size="58">' + escapeHtml(display) + '</text>' +
    '<text x="88" y="370" fill="#2b201a" font-family="Georgia,serif" font-size="38">' + escapeHtml(scent) + '</text>' +
    '<text x="88" y="465" fill="#6c6157" font-family="Arial,sans-serif" font-size="24">Rituals for a calmer you</text></svg>';
}

function loadFaq() {
  return faq.map(function (entry) {
    return {
      "@type": "Question",
      name: entry.name,
      acceptedAnswer: { "@type": "Answer", text: entry.acceptedAnswer.text }
    };
  });
}

function transformContact() {
  var file = path.join(root, "contact.html");
  var html = fs.readFileSync(file, "utf8");
  var faqs = loadFaq();
  html = html.replace(/\s*<section class="section faq" id="faq">[\s\S]*?<\/section>/g, "");
  var faqSection = '<section class="section faq" id="faq"><div class="wrap"><h2>Frequently asked questions</h2><div class="faq">';
  faqs.forEach(function (faq) {
    faqSection += "<details><summary>" + escapeHtml(faq.name) + "</summary><p>" + escapeHtml(faq.acceptedAnswer.text) + "</p></details>";
  });
  faqSection += "</div></div></section>";
  html = html.replace("</main>", faqSection + "\n</main>");
  html = html.replace("<h1>Orders, gifting and everything in between</h1>", "<h1>Bulk incense orders, gifting and contact</h1>")
    .replace("<p class=\"lead\">Tell us what you'd like and we'll reply with availability and prices.</p>",
      '<p class="lead">Contact Ruhani Room about bulk incense orders, corporate gifting, wedding favours and festive hampers. Tell us what you need and we will reply with availability and prices.</p>');
  html = rewriteSharedLinks(html);
  html = rewriteHead(html, {
    title: "Contact, Gifting & Bulk Incense Orders | Ruhani Room",
    description: "Contact Ruhani Room about bulk incense orders, corporate gifting, wedding favours and festive hampers. Share your plans and we will reply with details."
  }, "/contact.html", "website", "/assets/images/og-image.jpg", "Ruhani Room incense gifting and bulk orders",
  rootSchemas([{ "@type": "FAQPage", mainEntity: faqs }].concat([{ "@type": "BreadcrumbList", itemListElement: crumbData([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact.html" }]) }]))
  );
  return { file: file, html: applySharedShell(html, readSharedChunks("")) };
}

function rewriteRootIndexAndShop() {
  var definitions = {
    "index.html": {
      meta: {
        title: "Ruhani Room | Incense Sticks, Dhoop Cones & Havan Cups",
        description: "Shop natural incense sticks (agarbatti), dhoop cones and havan cups in rose, mogra, sandalwood, lavender and jasmine. Free delivery across India."
      },
      canonical: "/",
      h1: ["<h1 id=\"hero-title\">Incense sticks and dhoop cones for a calmer home</h1>", "<h1 id=\"hero-title\">Incense sticks online in India for a calmer home</h1>"],
      imageAlt: "Ruhani Room incense sticks available online in India in five fragrances"
    },
    "shop.html": {
      meta: {
        title: "Buy Incense Sticks Online in India from Ruhani Room",
        description: "Buy incense sticks online in five classic Indian fragrances, plus dhoop cones and havan cups for puja. ₹200 per pack, with free delivery across India."
      },
      canonical: "/shop.html",
      h1: ["<h1>Incense sticks, dhoop cones and havan cups</h1>", "<h1>Buy incense sticks online in India</h1>"],
      imageAlt: "Shop Ruhani Room incense sticks, dhoop cones and havan cups"
    }
  };
  return Object.keys(definitions).map(function (name) {
    var definition = definitions[name];
    var file = path.join(root, name);
    var html = fs.readFileSync(file, "utf8");
    html = rewriteSharedLinks(html);
    html = html.replace(definition.h1[0], definition.h1[1]);
    if (name === "index.html") {
      html = html.replace(/<link rel="preload" as="image"[^>]*>\s*/gi, "");
      html = html.replace(/<section class="section" id="faq"[\s\S]*?<\/section>\s*/i, "");
      html = html.replace(
        '<link rel="stylesheet" href="/assets/css/ruhani.css">',
        '<link rel="preload" as="image" href="/assets/images/products/ruhani-room-incense-puja-hero.webp" fetchpriority="high">\n  <link rel="stylesheet" href="/assets/css/ruhani.css">'
      );
    }
    if (name === "shop.html") {
      html = html.replace(
        '<p class="lead">Every fragrance in the collection comes in two formats. Filter by format, or open any product to compare.</p>',
        '<p class="lead">Buy incense sticks online in five classic Indian fragrances. Browse agarbatti, dhoop cones online and havan cups for puja, all at ₹200 per pack with free delivery across India.</p>'
      );
      html = html.replace(/<!-- bundle-products:start -->[\s\S]*?<!-- bundle-products:end -->/g,
        "<!-- bundle-products:start --><!-- bundle-products:end -->");
      var ids = Object.keys(products).filter(function (id) { return products[id].format !== "bundle"; });
      var cardIndex = 0;
      html = html.replace(/<article class="product"[\s\S]*?<\/article>/g, function () {
        if (!ids[cardIndex]) throw new Error("Shop page contains more product cards than catalog products.");
        return renderProductCard(ids[cardIndex++]);
      });
      if (cardIndex !== ids.length) throw new Error("Shop page and catalog product counts do not match.");
      var bundleCards = Object.keys(products).filter(function (id) { return products[id].format === "bundle"; })
        .map(renderProductCard).join("\n");
      html = html.replace("<!-- bundle-products:start --><!-- bundle-products:end -->",
        "<!-- bundle-products:start -->\n" + bundleCards + "\n<!-- bundle-products:end -->");
    }
    var schemas = name === "index.html" ? [] :
      [{ "@type": "BreadcrumbList", itemListElement: crumbData([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop.html" }]) }];
    html = rewriteHead(html, definition.meta, definition.canonical, "website", "/assets/images/og-image.jpg", definition.imageAlt,
      rootSchemas(schemas));
    return { file: file, html: applySharedShell(html, readSharedChunks("")) };
  });
}

function rewriteNonIndexablePages() {
  return ["cart.html", "checkout.html", "404.html", "product.html", "product-havan.html"].map(function (name) {
    var file = path.join(root, name);
    var html = rewriteSharedLinks(fs.readFileSync(file, "utf8"));
    html = html.replace(/^\s*<link rel="canonical"[^>]*>\s*/gim, "\n")
      .replace(/^\s*<meta name="robots"[^>]*>\s*/gim, "\n");
    html = html.replace(/<\/head>/i, '  <meta name="robots" content="noindex, follow">\n</head>');
    return { file: file, html: applySharedShell(html, readSharedChunks("")) };
  });
}

function generatePages() {
  Object.keys(products).forEach(function (id) {
    if (!copy[id]) throw new Error("Missing product copy for " + id);
    if (!productMeta[id]) throw new Error("Missing SEO metadata for " + id);
    if (!Number.isFinite(products[id].price) || products[id].price < 1) throw new Error("Invalid catalog price for " + id);
    if (!products[id].sku) throw new Error("Missing SKU for " + id);
    if (products[id].contents && products[id].contents.some(function (itemId) { return !products[itemId]; })) {
      throw new Error("Bundle " + id + " refers to an unknown product.");
    }
  });
  var template = fs.readFileSync(path.join(root, "product.html"), "utf8");
  var chunks = readSharedChunks(template);
  var outputs = Object.keys(products).map(function (id) { return renderProduct(chunks, id); });
  outputs = outputs.concat(Object.keys(categories).map(function (key) { return renderCategory(chunks, key); }));
  outputs.push(transformContact());
  outputs = outputs.concat(rewriteRootIndexAndShop());
  outputs = outputs.concat(rewriteNonIndexablePages());
  outputs.push({
    file: path.join(root, "robots.txt"),
    html: "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /cart.html\nDisallow: /checkout.html\n\nSitemap: " + absolute("/sitemap.xml") + "\n"
  });
  Object.keys(products).forEach(function (id) {
    outputs.push({
      file: path.join(root, "assets/images/og", id + ".svg"),
      html: makeSocialSvg(id)
    });
    var seenTitles = Object.create(null);
    outputs.forEach(function (output) {
      if (!/\.html$/.test(output.file) || !output.html.includes('rel="canonical"')) return;
      var titleMatch = output.html.match(/<title>([\s\S]*?)<\/title>/i);
      var descriptionMatch = output.html.match(/<meta name="description" content="([^"]*)">/i);
      var title = titleMatch && titleMatch[1].replace(/&amp;/g, "&");
      var description = descriptionMatch && descriptionMatch[1].replace(/&amp;/g, "&");
      var pageName = path.relative(root, output.file);
      if (!title || !description) throw new Error(pageName + " is missing its title or description.");
      if (seenTitles[title]) throw new Error("Duplicate SEO title: " + title);
      seenTitles[title] = true;
      if ((title.length < 50 || title.length > 60) && title !== "Mangala Havan Cups for Puja | Ruhani Room") {
        throw new Error(pageName + " title must be 50–60 characters: " + title.length);
      }
      if (description.length < 140 || description.length > 160) {
        throw new Error(pageName + " description must be 140–160 characters: " + description.length);
      }
      var h1Count = (output.html.match(/<h1\b/g) || []).length;
      if (h1Count !== 1) throw new Error(pageName + " must contain exactly one H1; found " + h1Count + ".");
    });
  });
  outputs.forEach(function (output) {
    if (checkOnly) {
      if (!fs.existsSync(output.file) || fs.readFileSync(output.file, "utf8") !== output.html) {
        throw new Error(path.relative(root, output.file) + " is missing or out of date. Run npm run build:pages.");
      }
    } else {
      fs.mkdirSync(path.dirname(output.file), { recursive: true });
      fs.writeFileSync(output.file, output.html);
    }
  });
  writeSitemap();
}

function writeSitemap() {
  var urls = [
    "/",
    "/shop.html",
    "/contact.html"
  ].concat(Object.keys(categories).map(function (key) { return categories[key].path; }))
    .concat(Object.keys(products).map(function (id) { return products[id].href; }));
  var lastmod = new Date().toISOString().slice(0, 10);
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(function (url) { return "  <url><loc>" + escapeHtml(absolute(url)) + "</loc><lastmod>" + lastmod + "</lastmod></url>"; }).join("\n") +
    "\n</urlset>\n";
  var sitemapFile = path.join(root, "sitemap.xml");
  if (checkOnly) {
    if (!fs.existsSync(sitemapFile) || fs.readFileSync(sitemapFile, "utf8") !== xml) {
      throw new Error("sitemap.xml is missing or out of date. Run npm run build:pages.");
    }
  } else {
    fs.writeFileSync(sitemapFile, xml);
  }
}

try {
  generatePages();
  console.log(checkOnly ? "Generated SEO pages are up to date." : "Generated " + Object.keys(products).length + " product pages, " + Object.keys(categories).length + " category pages, social images and sitemap.xml.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
