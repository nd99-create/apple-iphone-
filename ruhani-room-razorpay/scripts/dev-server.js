"use strict";

/* Local test server for Ruhani Room — no installs, no Vercel login needed.
   Serves the static site and runs the same /api/* functions Vercel runs.

   Usage:  npm run dev      (or: node scripts/dev-server.js)
   Then open http://localhost:3000 */

var fs = require("node:fs");
var http = require("node:http");
var path = require("node:path");

var ROOT = path.resolve(__dirname, "..");
var PORT = Number(process.env.PORT) || 3000;

/* Load .env into process.env (values already set in the shell win). */
function loadEnv(file) {
  if (!fs.existsSync(file)) return false;
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
    var match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || line.trim().charAt(0) === "#") return;
    var value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  });
  return true;
}

var MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

function sendFile(res, file, status) {
  res.writeHead(status || 200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res, pathname) {
  var relative = decodeURIComponent(pathname);
  if (relative.endsWith("/")) relative += "index.html";
  var file = path.resolve(ROOT, "." + relative);
  var hidden = path.relative(ROOT, file).split(path.sep).some(function (part) { return part.charAt(0) === "."; });
  if (!file.startsWith(ROOT + path.sep) || hidden || /^(scripts|server|tests|node_modules)(\/|\\)/.test(path.relative(ROOT, file))) {
    sendFile(res, path.join(ROOT, "404.html"), 404);
    return;
  }
  fs.stat(file, function (error, stat) {
    if (!error && stat.isFile()) sendFile(res, file);
    else sendFile(res, path.join(ROOT, "404.html"), 404);
  });
}

async function serveApi(req, res, name) {
  var file = path.join(ROOT, "api", name + ".js");
  if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(file)) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found." }));
    return;
  }
  try {
    await require(file)(req, res);
  } catch (error) {
    console.error("API /" + name + " crashed:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error." }));
    }
  }
}

function start() {
  var hasEnv = loadEnv(path.join(ROOT, ".env"));
  var server = http.createServer(function (req, res) {
    var started = Date.now();
    var pathname = new URL(req.url, "http://localhost").pathname;
    res.on("finish", function () {
      if (pathname.indexOf("/api/") === 0) {
        console.log(req.method + " " + pathname + " → " + res.statusCode + " (" + (Date.now() - started) + " ms)");
      }
    });
    var api = pathname.match(/^\/api\/([^/]+?)\/?$/);
    if (api) serveApi(req, res, api[1]);
    else serveStatic(req, res, pathname);
  });

  server.listen(PORT, function () {
    var keyId = process.env.RAZORPAY_KEY_ID || "";
    var mode = keyId.indexOf("rzp_test_") === 0 ? "TEST mode (no real money)" :
      keyId.indexOf("rzp_live_") === 0 ? "LIVE mode — REAL MONEY WILL MOVE" : "not configured";
    console.log("");
    console.log("  Ruhani Room local store  →  http://localhost:" + PORT);
    console.log("  Checkout page            →  http://localhost:" + PORT + "/checkout.html");
    console.log("  .env file                →  " + (hasEnv ? "loaded" : "missing (copy .env.example to .env)"));
    console.log("  Razorpay                 →  " + mode);
    console.log("  Key secret               →  " + (process.env.RAZORPAY_KEY_SECRET ? "set (kept on the server)" : "missing"));
    console.log("");
    console.log("  Press Ctrl+C to stop.");
    console.log("");
  });
}

if (require.main === module) start();
module.exports = { loadEnv: loadEnv };
