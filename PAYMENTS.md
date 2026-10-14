# Razorpay checkout setup

The storefront supports a persistent basket, INR checkout, Razorpay order creation, server-side signature verification, and payment capture. Payments stay disabled until both server environment variables are present.

## Connect Razorpay

1. In the Razorpay dashboard, use test keys first. Copy the **Key ID** and **Key Secret**; never put the secret in a website file or share it in chat.
2. In the Vercel project `ruhani-room`, open **Settings → Environment Variables** and add:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Select the **Production** environment (and **Preview** if you want to test preview deployments). Use the matching pair of Razorpay keys for each environment.
4. Redeploy the Vercel project. The checkout page will enable Razorpay when both values are available.
5. Complete a test purchase with Razorpay test mode before changing to live keys.

For local testing, start the Vercel function runtime with the ignored `.env` values loaded into its process:

```sh
set -a
. ./.env
set +a
npx vercel dev --local
```

The key ID is returned to the browser because Razorpay Checkout requires it. The key secret remains server-side in Vercel Functions. The server recalculates every basket at ₹200 per pack, creates the payment order, verifies the checkout signature, checks the payment/order amount and currency, and captures authorized payments.

## Order handling

Delivery name, email, phone, address, city, state, PIN code, and item summary are attached to the Razorpay order notes for fulfillment. Payment confirmation is only shown after the server verifies a captured payment. If confirmation is temporarily unavailable, checkout retains the basket and offers a retry instead of inviting another payment.

This static storefront does not send order emails or provide a separate order-management database. Use the Razorpay dashboard to review payment/order notes and fulfill orders.

## Prices and shipping

Current catalog prices are ₹200 per pack for incense sticks, dhoop cones, and havan cups. Shipping is free. If either policy changes, update the storefront catalog in `assets/js/main.js`, the server-side catalog in `server/razorpay.js`, and the displayed prices in `shop.html`.
