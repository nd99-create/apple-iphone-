"use strict";

var https = require("node:https");

var CATALOG = {
  "sticks-rose": { name: "Prema Rose Incense Sticks", price: 200 },
  "sticks-mogra": { name: "Mallika Mogra Incense Sticks", price: 200 },
  "sticks-sandalwood": { name: "Chandana Sandalwood Incense Sticks", price: 200 },
  "sticks-lavender": { name: "Shanti Lavender Incense Sticks", price: 200 },
  "sticks-jasmine": { name: "Saurabha Jasmine Incense Sticks", price: 200 },
  "cones-rose": { name: "Smriti Rose Dhoop Cones", price: 200 },
  "cones-mogra": { name: "Kusuma Mogra Dhoop Cones", price: 200 },
  "cones-sandalwood": { name: "Dhara Sandalwood Dhoop Cones", price: 200 },
  "cones-lavender": { name: "Nivriti Lavender Dhoop Cones", price: 200 },
  "cones-jasmine": { name: "Prakriti Jasmine Dhoop Cones", price: 200 },
  "havan-classic": { name: "Mangala Havan Cups (pack of six)", price: 200 }
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function paymentCredentials() {
  var keyId = cleanCredential(process.env.RAZORPAY_KEY_ID);
  var keySecret = cleanCredential(process.env.RAZORPAY_KEY_SECRET);
  return keyId && keySecret ? { keyId: keyId, keySecret: keySecret } : null;
}

function cleanCredential(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^["']+|["']+$/g, "").trim();
}

function hasSameOrigin(req) {
  var origin = req.headers.origin;
  var host = req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch (error) {
    return false;
  }
}

function readJson(req) {
  return new Promise(function (resolve, reject) {
    var raw = "";
    var tooLarge = false;
    req.on("data", function (chunk) {
      if (tooLarge) return;
      if (raw.length + chunk.length > 16384) {
        tooLarge = true;
        reject(new Error("Request is too large."));
        return;
      }
      raw += chunk;
    });
    req.on("end", function () {
      if (tooLarge) return;
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function razorpayRequest(credentials, path, options) {
  options = options || {};
  var body = options.body ? JSON.stringify(options.body) : "";
  var auth = Buffer.from(credentials.keyId + ":" + credentials.keySecret).toString("base64");
  return new Promise(function (resolve, reject) {
    var request = https.request({
      hostname: "api.razorpay.com",
      path: "/v1/" + path,
      method: options.method || "GET",
      headers: {
        Authorization: "Basic " + auth,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } : {})
      },
      timeout: 12000
    }, function (response) {
      var raw = "";
      response.setEncoding("utf8");
      response.on("data", function (chunk) { raw += chunk; });
      response.on("end", function () {
        var result;
        try {
          result = JSON.parse(raw);
        } catch (error) {
          reject(new Error("Razorpay returned an invalid response."));
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          var message = result && result.error && result.error.description;
          var error = new Error(message || "Razorpay could not complete the request.");
          error.statusCode = response.statusCode;
          reject(error);
          return;
        }
        resolve(result);
      });
    });
    request.on("timeout", function () {
      request.destroy(new Error("Razorpay request timed out."));
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function validateOrder(body) {
  if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 11) {
    return { error: "Your basket is empty or invalid. Please review it and try again." };
  }

  var seen = Object.create(null);
  var quantityTotal = 0;
  var lines = [];
  var amount = 0;
  for (var i = 0; i < body.items.length; i += 1) {
    var item = body.items[i];
    var product = item && CATALOG[item.id];
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || seen[item.id]) {
      return { error: "One or more basket items are invalid. Please review your basket." };
    }
    seen[item.id] = true;
    quantityTotal += item.quantity;
    amount += product.price * item.quantity;
    lines.push(product.name + " x " + item.quantity);
  }
  if (quantityTotal > 50 || !Number.isSafeInteger(amount) || amount < 1) {
    return { error: "Your basket exceeds the order limit. Please reduce the quantities and try again." };
  }
  if (amount * 100 < 100) {
    return { error: "The minimum payment amount is ₹1." };
  }

  var customer = body.customer || {};
  var name = typeof customer.name === "string" ? customer.name.trim() : "";
  var email = typeof customer.email === "string" ? customer.email.trim() : "";
  var phone = typeof customer.phone === "string" ? customer.phone.replace(/[^\d]/g, "") : "";
  var address = typeof customer.address === "string" ? customer.address.trim() : "";
  var city = typeof customer.city === "string" ? customer.city.trim() : "";
  var state = typeof customer.state === "string" ? customer.state.trim() : "";
  var postalCode = typeof customer.postalCode === "string" ? customer.postalCode.trim() : "";

  if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return { error: "Enter a valid name and email address to continue." };
  }
  if (!(/^[6-9]\d{9}$/.test(phone) || /^91[6-9]\d{9}$/.test(phone))) {
    return { error: "Enter a valid Indian mobile number to continue." };
  }
  if (!address || address.length > 240 || !city || city.length > 80 || !state || state.length > 80 || !/^\d{6}$/.test(postalCode)) {
    return { error: "Enter a complete delivery address and a valid 6-digit PIN code." };
  }

  return {
    amount: amount * 100,
    items: lines.join(", ").slice(0, 256),
    customer: {
      name: name,
      email: email,
      phone: phone.length === 10 ? "91" + phone : phone,
      address: address,
      city: city,
      state: state,
      postalCode: postalCode
    }
  };
}

module.exports = {
  CATALOG: CATALOG,
  hasSameOrigin: hasSameOrigin,
  paymentCredentials: paymentCredentials,
  readJson: readJson,
  razorpayRequest: razorpayRequest,
  sendJson: sendJson,
  validateOrder: validateOrder
};
