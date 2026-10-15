"use strict";

/* Razorpay webhook: the safety net for customers who pay and then close the tab.
   Razorpay calls this endpoint directly (not the browser), so a payment is still
   captured even if /api/verify-payment never runs. Without capture, Razorpay
   refunds an authorized payment automatically after a few days.

   Setup (Razorpay Dashboard → Accounts & Settings → Webhooks):
     URL:     https://<your-domain>/api/razorpay-webhook
     Secret:  any long random string; put the same value in RAZORPAY_WEBHOOK_SECRET
     Events:  payment.authorized, payment.captured, payment.failed, order.paid
*/

var crypto = require("node:crypto");
var helpers = require("../server/razorpay.js");

function validSignature(rawBody, signature, secret) {
  if (typeof signature !== "string" || !/^[a-fA-F0-9]{64}$/.test(signature)) return false;
  var expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  var received = Buffer.from(signature, "hex");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    helpers.sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  var webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  var credentials = helpers.paymentCredentials();
  if (!webhookSecret || !credentials) {
    helpers.sendJson(res, 503, { error: "Webhook is not configured." });
    return;
  }

  var rawBody;
  try {
    rawBody = await helpers.readRawBody(req);
  } catch (error) {
    helpers.sendJson(res, 400, { error: error.message });
    return;
  }
  if (!validSignature(rawBody, req.headers["x-razorpay-signature"], webhookSecret)) {
    helpers.sendJson(res, 400, { error: "Invalid webhook signature." });
    return;
  }

  var event;
  try {
    event = JSON.parse(rawBody);
  } catch (error) {
    helpers.sendJson(res, 400, { error: "Webhook body must be valid JSON." });
    return;
  }

  var payment = event && event.payload && event.payload.payment && event.payload.payment.entity;
  try {
    if (event.event === "payment.authorized" && payment && payment.order_id) {
      var result = await helpers.captureForOrder(credentials, payment.order_id, payment.id, helpers.razorpayRequest);
      console.log("Webhook payment.authorized:", payment.id, result.ok ? "captured" : "not captured (" + result.reason + ")");
    } else if (event.event === "payment.failed" && payment) {
      console.log("Webhook payment.failed:", payment.id, payment.error_description || "");
    } else {
      console.log("Webhook received:", event.event, payment ? payment.id : "");
    }
    // Always acknowledge a correctly signed event so Razorpay does not retry it forever.
    helpers.sendJson(res, 200, { received: true });
  } catch (error) {
    // A 500 makes Razorpay retry later, which is what we want for a temporary failure.
    console.error("Webhook handling failed:", error.message);
    helpers.sendJson(res, 500, { error: "Webhook could not be processed yet." });
  }
}

// The signature is computed over the exact raw bytes, so the body is read from the
// stream directly (Vercel only parses req.body if code asks for it).
module.exports = handler;
