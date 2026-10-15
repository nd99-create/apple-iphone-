# Razorpay checkout setup

The storefront supports a persistent basket, INR checkout, Razorpay order creation, server-side signature verification, and payment capture. Payments stay disabled until both server environment variables are present.

## Connect Razorpay

1. In the Razorpay dashboard, use test keys first. Copy the **Key ID** and **Key Secret**; never put the secret in a website file or share it in chat.
2. In the Vercel project `ruhani-room`, open **Settings → Environment Variables** and add:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET` (see the webhook section below)
3. Select the **Production** environment (and **Preview** if you want to test preview deployments). Use the matching pair of Razorpay keys for each environment.
4. Redeploy the Vercel project. The checkout page will enable Razorpay when both values are available.
5. Complete a test purchase with Razorpay test mode before changing to live keys.

For local testing, put your test keys in `.env` (see `.env.example`) and run `npm run dev`. Full steps, test cards and UPI IDs are in **TESTING.md**.

The key ID is returned to the browser because Razorpay Checkout requires it. The key secret remains server-side in Vercel Functions. The server recalculates every basket at ₹200 per pack, creates the payment order, verifies the checkout signature, checks the payment/order amount and currency, and captures authorized payments.

## Never lose a payment: capture settings and webhook

A payment is "authorized" first and must then be "captured", or Razorpay refunds it automatically after a few days. The site captures it in `/api/verify-payment`, but that relies on the customer's browser staying open. Set up both safety nets before going live:

1. **Automatic capture.** Razorpay Dashboard → Account & Settings → Payment capture → set automatic capture. This alone fixes the closed-tab problem.
2. **Webhook (recommended).** Razorpay Dashboard → Account & Settings → Webhooks → Add:
   - URL: `https://<your-domain>/api/razorpay-webhook`
   - Secret: a long random string
   - Events: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`

   Then add the same secret to Vercel as `RAZORPAY_WEBHOOK_SECRET` and redeploy. Test-mode and live-mode webhooks are configured separately in the dashboard.

The browser and the webhook can both try to capture the same payment; the code handles that safely.

## Order handling

Delivery name, email, phone, address, city, state, PIN code, and item summary are attached to the Razorpay order notes for fulfillment. Payment confirmation is only shown after the server verifies a captured payment. If confirmation is temporarily unavailable, checkout retains the basket and offers a retry instead of inviting another payment.

This static storefront does not send order emails or provide a separate order-management database. Use the Razorpay dashboard to review payment/order notes and fulfill orders.

## Prices and shipping

Current catalog prices are ₹200 per pack for incense sticks, dhoop cones, and havan cups. Shipping is free.

All names and prices live in one file: `assets/js/catalog.js`. The shop, product pages, basket and the payment server all read from it, so a price change is a single edit.
