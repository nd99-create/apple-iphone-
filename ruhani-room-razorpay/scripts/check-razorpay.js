"use strict";

/* Confirms your Razorpay keys work by creating a ₹1 order (orders never charge anyone).
   Usage: npm run check */

var path = require("node:path");
require("./dev-server.js").loadEnv(path.join(__dirname, "..", ".env"));
var helpers = require("../server/razorpay.js");

(async function () {
  var credentials = helpers.paymentCredentials();
  if (!credentials) {
    console.error("✗ RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not both set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }
  var mode = credentials.keyId.indexOf("rzp_test_") === 0 ? "TEST" : "LIVE";
  console.log("Checking " + mode + " keys (" + credentials.keyId.slice(0, 13) + "…)");
  try {
    var order = await helpers.razorpayRequest(credentials, "orders", {
      method: "POST",
      body: { amount: 100, currency: "INR", receipt: "rr_keycheck_" + Date.now() }
    });
    console.log("✓ Keys accepted. Razorpay created test order " + order.id + " for ₹1 (status: " + order.status + ").");
    console.log("✓ Your setup is ready. Run `npm run dev` and open http://localhost:3000");
  } catch (error) {
    if (error.statusCode === 401) {
      console.error("✗ Razorpay rejected the keys (401). Check that the Key ID and Key Secret are a matching pair.");
    } else {
      console.error("✗ Could not reach Razorpay: " + error.message);
    }
    process.exit(1);
  }
})();
