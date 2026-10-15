"use strict";

/* Payment tests with a fake Razorpay, so they run offline and never touch your account.
   Run: npm test */

var test = require("node:test");
var assert = require("node:assert/strict");
var crypto = require("node:crypto");
var { Readable } = require("node:stream");

process.env.RAZORPAY_KEY_ID = "rzp_test_unit";
process.env.RAZORPAY_KEY_SECRET = "unit_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "unit_webhook_secret";

var helpers = require("../server/razorpay.js");
var catalog = require("../assets/js/catalog.js");
var createOrder = require("../api/create-order.js");
var verifyPayment = require("../api/verify-payment.js");
var paymentConfig = require("../api/payment-config.js");
var webhook = require("../api/razorpay-webhook.js");
var realRequest = helpers.razorpayRequest;

var customer = {
  name: "Test Buyer", email: "buyer@example.com", phone: "+91 98765 43210",
  address: "12 Temple Road", city: "Mangaluru", state: "Karnataka", postalCode: "575001"
};

function call(handler, options) {
  options = options || {};
  var raw = options.raw !== undefined ? options.raw : (options.body ? JSON.stringify(options.body) : "");
  var req = Readable.from(raw ? [Buffer.from(raw)] : []);
  req.method = options.method || "POST";
  req.headers = Object.assign({ origin: "http://localhost:3000", host: "localhost:3000" }, options.headers || {});
  return new Promise(function (resolve) {
    var res = {
      statusCode: 200, headers: {},
      setHeader: function (k, v) { this.headers[k.toLowerCase()] = v; },
      end: function (body) { resolve({ status: this.statusCode, body: body ? JSON.parse(body) : null }); }
    };
    handler(req, res);
  });
}

function sign(orderId, paymentId) {
  return crypto.createHmac("sha256", "unit_secret").update(orderId + "|" + paymentId).digest("hex");
}

/* A tiny fake Razorpay. `state` controls how it behaves in each test. */
function fakeRazorpay(state) {
  state.calls = [];
  helpers.razorpayRequest = async function (credentials, path, options) {
    state.calls.push({ path: path, options: options });
    if (state.fail) { var e = new Error("boom"); e.statusCode = state.fail; throw e; }
    if (path === "orders") return { id: "order_T1", amount: options.body.amount, currency: "INR", status: "created" };
    if (path.indexOf("orders/") === 0) return { id: "order_T1", amount: state.orderAmount || 40000, currency: "INR" };
    if (/\/capture$/.test(path)) {
      if (state.captureRace) { state.status = "captured"; throw new Error("already captured"); }
      state.status = "captured";
      return { id: "pay_T1", order_id: "order_T1", amount: state.paymentAmount || 40000, currency: "INR", status: "captured" };
    }
    if (path.indexOf("payments/") === 0) {
      return { id: "pay_T1", order_id: "order_T1", amount: state.paymentAmount || 40000, currency: "INR", status: state.status || "authorized" };
    }
    throw new Error("unexpected path " + path);
  };
}

test.after(function () { helpers.razorpayRequest = realRequest; });

test("browser and server read prices from the same catalogue", function () {
  assert.equal(helpers.CATALOG, catalog);
  assert.equal(Object.keys(catalog).length, 11);
});

test("payment-config exposes the key ID only, never the secret", async function () {
  var r = await call(paymentConfig, { method: "GET" });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { enabled: true, keyId: "rzp_test_unit" });
  assert.ok(!JSON.stringify(r.body).includes("unit_secret"));
});

test("create-order prices the basket on the server (paise) and ignores browser prices", async function () {
  var state = {}; fakeRazorpay(state);
  var r = await call(createOrder, { body: {
    items: [{ id: "sticks-rose", quantity: 2, price: 1 }, { id: "havan-classic", quantity: 1 }], customer: customer
  } });
  assert.equal(r.status, 200);
  assert.equal(r.body.amount, 60000);
  assert.equal(r.body.order_id, "order_T1");
  assert.equal(state.calls[0].options.body.currency, "INR");
  assert.match(state.calls[0].options.body.receipt, /^rr_/);
});

test("create-order rejects unknown products, bad quantities and bad phone numbers", async function () {
  fakeRazorpay({});
  assert.equal((await call(createOrder, { body: { items: [{ id: "fake", quantity: 1 }], customer: customer } })).status, 400);
  assert.equal((await call(createOrder, { body: { items: [{ id: "sticks-rose", quantity: 0.5 }], customer: customer } })).status, 400);
  assert.equal((await call(createOrder, { body: { items: [], customer: customer } })).status, 400);
  assert.equal((await call(createOrder, { body: { items: [{ id: "sticks-rose", quantity: 1 }], customer: Object.assign({}, customer, { phone: "12345" }) } })).status, 400);
});

test("create-order blocks other websites (origin check)", async function () {
  fakeRazorpay({});
  var r = await call(createOrder, { headers: { origin: "https://evil.example" }, body: { items: [{ id: "sticks-rose", quantity: 1 }], customer: customer } });
  assert.equal(r.status, 403);
});

test("create-order returns 401 for bad keys and 500 for other Razorpay errors", async function () {
  fakeRazorpay({ fail: 401 });
  assert.equal((await call(createOrder, { body: { items: [{ id: "sticks-rose", quantity: 1 }], customer: customer } })).status, 401);
  fakeRazorpay({ fail: 502 });
  assert.equal((await call(createOrder, { body: { items: [{ id: "sticks-rose", quantity: 1 }], customer: customer } })).status, 500);
});

test("verify-payment accepts a correct signature and captures the payment", async function () {
  var state = {}; fakeRazorpay(state);
  var r = await call(verifyPayment, { body: { razorpay_order_id: "order_T1", razorpay_payment_id: "pay_T1", razorpay_signature: sign("order_T1", "pay_T1") } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { verified: true, paymentId: "pay_T1" });
  assert.equal(state.status, "captured");
});

test("verify-payment rejects a forged signature and does not touch Razorpay", async function () {
  var state = {}; fakeRazorpay(state);
  var r = await call(verifyPayment, { body: { razorpay_order_id: "order_T1", razorpay_payment_id: "pay_T1", razorpay_signature: "0".repeat(64) } });
  assert.equal(r.status, 400);
  assert.equal(state.calls.length, 0);
});

test("verify-payment rejects missing fields", async function () {
  fakeRazorpay({});
  assert.equal((await call(verifyPayment, { body: { razorpay_order_id: "order_T1" } })).status, 400);
});

test("verify-payment rejects an amount that does not match the order", async function () {
  fakeRazorpay({ paymentAmount: 100 });
  var r = await call(verifyPayment, { body: { razorpay_order_id: "order_T1", razorpay_payment_id: "pay_T1", razorpay_signature: sign("order_T1", "pay_T1") } });
  assert.equal(r.status, 400);
});

test("verify-payment succeeds even if the webhook captured the payment a moment earlier", async function () {
  fakeRazorpay({ captureRace: true });
  var r = await call(verifyPayment, { body: { razorpay_order_id: "order_T1", razorpay_payment_id: "pay_T1", razorpay_signature: sign("order_T1", "pay_T1") } });
  assert.equal(r.status, 200);
});

function webhookBody(event) {
  return JSON.stringify({ event: event, payload: { payment: { entity: { id: "pay_T1", order_id: "order_T1", amount: 40000, currency: "INR" } } } });
}
function webhookSig(raw) {
  return crypto.createHmac("sha256", "unit_webhook_secret").update(raw).digest("hex");
}

test("webhook captures an authorized payment when the customer closed the tab", async function () {
  var state = {}; fakeRazorpay(state);
  var raw = webhookBody("payment.authorized");
  var r = await call(webhook, { raw: raw, headers: { origin: undefined, "x-razorpay-signature": webhookSig(raw) } });
  assert.equal(r.status, 200);
  assert.equal(state.status, "captured");
});

test("webhook rejects events without a valid Razorpay signature", async function () {
  var state = {}; fakeRazorpay(state);
  var raw = webhookBody("payment.authorized");
  var r = await call(webhook, { raw: raw, headers: { "x-razorpay-signature": "f".repeat(64) } });
  assert.equal(r.status, 400);
  assert.equal(state.calls.length, 0);
});

test("webhook acknowledges other events without capturing", async function () {
  var state = {}; fakeRazorpay(state);
  var raw = webhookBody("payment.failed");
  var r = await call(webhook, { raw: raw, headers: { "x-razorpay-signature": webhookSig(raw) } });
  assert.equal(r.status, 200);
  assert.equal(state.calls.length, 0);
});
