"use strict";

var crypto = require("node:crypto");
var helpers = require("../server/razorpay.js");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    helpers.sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  if (!helpers.hasSameOrigin(req)) {
    helpers.sendJson(res, 403, { error: "Please reload the store and try again." });
    return;
  }
  var credentials = helpers.paymentCredentials();
  if (!credentials) {
    helpers.sendJson(res, 503, { error: "Secure payments are not connected yet. Please try again later." });
    return;
  }

  var body;
  try {
    body = await helpers.readJson(req);
  } catch (error) {
    helpers.sendJson(res, 400, { error: error.message });
    return;
  }
  var order = helpers.validateOrder(body);
  if (order.error) {
    helpers.sendJson(res, 400, { error: order.error });
    return;
  }

  try {
    var result = await helpers.razorpayRequest(credentials, "orders", {
      method: "POST",
      body: {
        amount: order.amount,
        currency: "INR",
        receipt: "rr_" + crypto.randomUUID().replace(/-/g, "").slice(0, 32),
        notes: {
          buyer_name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          delivery_address: order.customer.address,
          city: order.customer.city,
          state: order.customer.state,
          pincode: order.customer.postalCode,
          items: order.items
        }
      }
    });
    helpers.sendJson(res, 200, {
      order_id: result.id,
      amount: result.amount,
      currency: result.currency
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error.message);
    var status = error.statusCode === 401 || error.statusCode === 403 ? 401 : 500;
    helpers.sendJson(res, status, {
      error: status === 401 ?
        "Razorpay rejected the server credentials. Check the test keys in .env and try again." :
        "We could not start secure payment. Please try again."
    });
  }
};
