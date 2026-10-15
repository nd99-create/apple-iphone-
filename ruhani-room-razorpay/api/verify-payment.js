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
    helpers.sendJson(res, 503, { error: "Secure payments are not connected yet." });
    return;
  }

  var body;
  try {
    body = await helpers.readJson(req);
  } catch (error) {
    helpers.sendJson(res, 400, { error: error.message });
    return;
  }
  var paymentId = body && body.razorpay_payment_id;
  var orderId = body && body.razorpay_order_id;
  var signature = body && body.razorpay_signature;
  if (typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
      typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId) ||
      typeof signature !== "string" || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    helpers.sendJson(res, 400, { error: "The payment confirmation is invalid. Please contact us before trying again." });
    return;
  }

  var expected = crypto.createHmac("sha256", credentials.keySecret)
    .update(orderId + "|" + paymentId)
    .digest();
  var received = Buffer.from(signature, "hex");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    helpers.sendJson(res, 400, { error: "We could not verify this payment. Please contact us with your payment reference." });
    return;
  }

  try {
    var result = await helpers.captureForOrder(credentials, orderId, paymentId, helpers.razorpayRequest);
    if (!result.ok && result.reason === "mismatch") {
      helpers.sendJson(res, 400, { error: "The payment details do not match this order. Please contact us." });
      return;
    }
    if (!result.ok) {
      helpers.sendJson(res, 402, { error: "Payment has not been captured. Please retry or contact us for help." });
      return;
    }

    helpers.sendJson(res, 200, { verified: true, paymentId: result.payment.id });
  } catch (error) {
    console.error("Razorpay payment verification failed:", error.message);
    helpers.sendJson(res, 500, { error: "We could not confirm the payment just yet. Please contact us with your payment reference." });
  }
};
