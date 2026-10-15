"use strict";

var assert = require("node:assert/strict");
var crypto = require("node:crypto");
var EventEmitter = require("node:events");
var test = require("node:test");
var createOrder = require("../api/create-order.js");
var verifyPayment = require("../api/verify-payment.js");
var helpers = require("../server/razorpay.js");

var customer = {
  name: "Test Customer",
  email: "test.customer@example.com",
  phone: "9876543210",
  address: "1 Test Street",
  city: "New Delhi",
  state: "Delhi",
  postalCode: "110001"
};

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader: function (name, value) { this.headers[name] = value; },
    end: function (body) { this.body = JSON.parse(body); }
  };
}

function makeRequest(body) {
  var request = new EventEmitter();
  request.method = "POST";
  request.headers = { origin: "https://ruhani-room.vercel.app", host: "ruhani-room.vercel.app" };
  process.nextTick(function () {
    request.emit("data", JSON.stringify(body));
    request.emit("end");
  });
  return request;
}

function signatureFor(orderId, paymentId, secret) {
  return crypto.createHmac("sha256", secret).update(orderId + "|" + paymentId).digest("hex");
}

test("validates allowlisted basket prices on the server", function () {
  var order = helpers.validateOrder({
    items: [{ id: "sticks-rose", quantity: 2, price: 1 }],
    customer: customer
  });

  assert.equal(order.error, undefined);
  assert.equal(order.amount, 40000);
  assert.match(order.items, /Rose Incense Sticks x 2/);
});

test("rejects invalid basket items and customer details", function () {
  assert.match(helpers.validateOrder({
    items: [{ id: "unknown-product", quantity: 1 }],
    customer: customer
  }).error, /basket items are invalid/);

  assert.match(helpers.validateOrder({
    items: [{ id: "sticks-rose", quantity: 0 }],
    customer: customer
  }).error, /basket items are invalid/);

  assert.match(helpers.validateOrder({
    items: [{ id: "sticks-rose", quantity: 1 }],
    customer: Object.assign({}, customer, { phone: "123" })
  }).error, /mobile number/);
});

test("creates a Razorpay order with the server-calculated INR amount", async function () {
  var originalReadJson = helpers.readJson;
  var originalSameOrigin = helpers.hasSameOrigin;
  var originalCredentials = helpers.paymentCredentials;
  var originalRazorpayRequest = helpers.razorpayRequest;
  var requestBody;
  helpers.readJson = async function () {
    return { items: [{ id: "sticks-rose", quantity: 1 }], customer: customer };
  };
  helpers.hasSameOrigin = function () { return true; };
  helpers.paymentCredentials = function () { return { keyId: "rzp_test_example", keySecret: "test-secret" }; };
  helpers.razorpayRequest = async function (_credentials, path, options) {
    requestBody = { path: path, body: options.body };
    return { id: "order_test123", amount: 20000, currency: "INR" };
  };

  try {
    var response = makeResponse();
    await createOrder(makeRequest(), response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { order_id: "order_test123", amount: 20000, currency: "INR" });
    assert.equal(requestBody.path, "orders");
    assert.equal(requestBody.body.amount, 20000);
    assert.equal(requestBody.body.currency, "INR");
  } finally {
    helpers.readJson = originalReadJson;
    helpers.hasSameOrigin = originalSameOrigin;
    helpers.paymentCredentials = originalCredentials;
    helpers.razorpayRequest = originalRazorpayRequest;
  }
});

test("rejects a payment with a mismatched signature before contacting Razorpay", async function () {
  var originalSameOrigin = helpers.hasSameOrigin;
  var originalCredentials = helpers.paymentCredentials;
  var originalRazorpayRequest = helpers.razorpayRequest;
  var requestCount = 0;
  helpers.hasSameOrigin = function () { return true; };
  helpers.paymentCredentials = function () { return { keyId: "rzp_test_example", keySecret: "test-secret" }; };
  helpers.razorpayRequest = async function () { requestCount += 1; };

  try {
    var response = makeResponse();
    await verifyPayment(makeRequest({
      razorpay_payment_id: "pay_test123",
      razorpay_order_id: "order_test123",
      razorpay_signature: "0".repeat(64)
    }), response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.verified, undefined);
    assert.equal(requestCount, 0);
  } finally {
    helpers.hasSameOrigin = originalSameOrigin;
    helpers.paymentCredentials = originalCredentials;
    helpers.razorpayRequest = originalRazorpayRequest;
  }
});

test("verifies a valid signature and captures an authorized test payment", async function () {
  var originalSameOrigin = helpers.hasSameOrigin;
  var originalCredentials = helpers.paymentCredentials;
  var originalRazorpayRequest = helpers.razorpayRequest;
  var secret = "test-secret";
  var calls = [];
  helpers.hasSameOrigin = function () { return true; };
  helpers.paymentCredentials = function () { return { keyId: "rzp_test_example", keySecret: secret }; };
  helpers.razorpayRequest = async function (_credentials, path, options) {
    calls.push({ path: path, options: options });
    if (path === "orders/order_test123") return { id: "order_test123", amount: 20000, currency: "INR" };
    if (path === "payments/pay_test123") {
      return { id: "pay_test123", order_id: "order_test123", amount: 20000, currency: "INR", status: "authorized" };
    }
    return { id: "pay_test123", order_id: "order_test123", amount: 20000, currency: "INR", status: "captured" };
  };

  try {
    var response = makeResponse();
    await verifyPayment(makeRequest({
      razorpay_payment_id: "pay_test123",
      razorpay_order_id: "order_test123",
      razorpay_signature: signatureFor("order_test123", "pay_test123", secret)
    }), response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { verified: true, paymentId: "pay_test123" });
    assert.deepEqual(calls.map(function (call) { return call.path; }), [
      "orders/order_test123",
      "payments/pay_test123",
      "payments/pay_test123/capture"
    ]);
    assert.deepEqual(calls[2].options.body, { amount: 20000, currency: "INR" });
  } finally {
    helpers.hasSameOrigin = originalSameOrigin;
    helpers.paymentCredentials = originalCredentials;
    helpers.razorpayRequest = originalRazorpayRequest;
  }
});
