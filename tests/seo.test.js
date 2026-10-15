"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");
var catalog = require("../assets/js/catalog.js");
var siteConfig = require("../scripts/site-config.js");
var root = path.resolve(__dirname, "..");

test("indexable pages have unique metadata and root-relative assets", function () {
  var paths = ["/", "/shop.html", "/contact.html", "/incense-sticks/", "/dhoop-cones/", "/havan-cups/"]
    .concat(Object.keys(catalog).map(function (id) { return catalog[id].href; }));
  var titles = new Set();
  paths.forEach(function (url) {
    var file = path.join(root, url === "/" ? "index.html" : url.slice(1) + (url.endsWith("/") ? "index.html" : ""));
    var html = fs.readFileSync(file, "utf8");
    var title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
    var description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
    var h1Count = (html.match(/<h1\b/gi) || []).length;
    assert.ok(title, url + " has no title");
    assert.ok(!titles.has(title), "Duplicate title: " + title);
    titles.add(title);
    assert.ok((title.length >= 50 && title.length <= 60) || title === "Mangala Havan Cups for Puja | Ruhani Room");
    assert.ok(description && description.length >= 140 && description.length <= 160, url + " has invalid description length");
    assert.equal(h1Count, 1, url + " must have exactly one H1");
    assert.match(html, /<html lang="en-IN">/);
    assert.ok(html.includes('<link rel="canonical" href="' + siteConfig.SITE_URL + url + '">'));
    for (var asset of html.matchAll(/(?:src|href)="(\/assets\/[^"#?]+)"/g)) {
      assert.equal(fs.existsSync(path.join(root, asset[1].slice(1))), true, url + " references missing " + asset[1]);
    }
    var jsonLd = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
      .map(function (match) { return JSON.parse(match[1])["@graph"]; })
      .filter(Array.isArray)
      .flat();
    assert.ok(jsonLd.some(function (entry) { return entry["@type"] === "Organization"; }), url + " has no Organization schema");
    assert.ok(jsonLd.some(function (entry) { return entry["@type"] === "WebSite"; }), url + " has no WebSite schema");
    if (url !== "/") {
      assert.ok(jsonLd.some(function (entry) { return entry["@type"] === "BreadcrumbList"; }), url + " has no breadcrumb schema");
    }
  });
});

test("all catalog products have a static, indexable clean URL", function () {
  Object.keys(catalog).forEach(function (id) {
    var product = catalog[id];
    var file = path.join(root, product.href.slice(1), "index.html");
    assert.equal(fs.existsSync(file), true, id + " page is missing");
    var html = fs.readFileSync(file, "utf8");
    assert.match(html, /<h1\b/);
    assert.match(html, new RegExp('data-product-add="' + id + '"'));
    assert.ok(html.includes('<link rel="canonical" href="' + siteConfig.SITE_URL + product.href + '">'));
    assert.match(html, /<meta property="og:type" content="product">/);
    assert.match(html, /<html lang="en-IN">/);
    assert.doesNotMatch(html, /href="(?:product\.html(?:\?|")|product-havan\.html|shop\.html\?type=)/);

    var scripts = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g));
    var graph = scripts.map(function (match) { return JSON.parse(match[1]); })
      .find(function (value) { return Array.isArray(value["@graph"]); });
    assert.ok(graph, id + " page has no JSON-LD graph");
    var productSchema = graph["@graph"].find(function (entry) { return entry["@type"] === "Product" && entry.sku === id; });
    assert.ok(productSchema);
    assert.equal(productSchema.offers.price, catalog[id].price.toFixed(2));
    assert.equal(productSchema.offers.shippingDetails.shippingRate.value, "0.00");
    assert.match(html, /TODO: add hasMerchantReturnPolicy only after a verified returns policy exists/);
    assert.equal(/aggregateRating|"review"\s*:/.test(html), false, "No fabricated review data");
  });
});

test("category pages, sitemap and crawler exclusions are present", function () {
  ["/incense-sticks/", "/dhoop-cones/", "/havan-cups/"].forEach(function (slug) {
    var file = path.join(root, slug.slice(1), "index.html");
    assert.equal(fs.existsSync(file), true, slug + " category page is missing");
    assert.match(fs.readFileSync(file, "utf8"), /"@type":"CollectionPage"/);
  });
  var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  assert.match(sitemap, new RegExp(siteConfig.SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/incense-sticks/prema-rose/"));
  assert.equal((sitemap.match(/<url>/g) || []).length, 17);
  assert.doesNotMatch(sitemap, /\/(?:cart|checkout)\.html/);
  var robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  assert.match(robots, /Disallow: \/api\//);
  assert.ok(robots.includes("Sitemap: " + siteConfig.SITE_URL + "/sitemap.xml"));
});

test("Vercel redirects legacy query URLs to clean pages", function () {
  var config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  assert.equal(config.trailingSlash, true);
  assert.ok(config.redirects.some(function (redirect) {
    return redirect.source === "/product.html" &&
      redirect.destination === "/incense-sticks/prema-rose/" &&
      redirect.statusCode === 301 &&
      redirect.has.some(function (condition) { return condition.key === "f" && condition.value === "rose"; });
  }));
  assert.ok(config.redirects.some(function (redirect) {
    return redirect.source === "/shop.html" && redirect.destination === "/dhoop-cones/" && redirect.statusCode === 301;
  }));
  assert.ok(config.redirects.some(function (redirect) {
    return redirect.source === "/product.html" && redirect.destination === "/shop.html" && redirect.statusCode === 301 && !redirect.has;
  }));
});
