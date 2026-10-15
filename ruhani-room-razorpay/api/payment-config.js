"use strict";

var helpers = require("../server/razorpay.js");

module.exports = function (req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    helpers.sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  var credentials = helpers.paymentCredentials();
  helpers.sendJson(res, 200, {
    enabled: Boolean(credentials),
    keyId: credentials ? credentials.keyId : null
  });
};
