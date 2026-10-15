# Testing payments (Razorpay test mode)

Test mode uses Razorpay's sandbox: no real money moves, and nothing reaches a bank.

## 1. One-time setup

You need Node.js 18 or newer (`node -v`). Nothing else to install.

1. Make sure `.env` exists in the project root with your **test** keys
   (copy `.env.example` to `.env` if it is missing). It is git-ignored.
2. Check the keys work:

   ```sh
   npm run check
   ```

   You should see `✓ Keys accepted`. That creates one ₹1 *order* in your
   Razorpay test dashboard. Orders never charge anyone.

## 2. Run the store locally

```sh
npm run dev
```

Open http://localhost:3000. The terminal confirms `Razorpay → TEST mode`.

## 3. Make a test purchase

1. Add a couple of items to the basket, then go to checkout.
2. A dashed **Test mode** panel lists the test details. It only appears with
   `rzp_test_` keys, never to real customers.
3. Fill in delivery details (any name, a 10-digit mobile starting 6–9, any 6-digit PIN).
4. Click **Pay ₹… securely** and pay with one of these:

| Method | Use | Result |
|---|---|---|
| UPI | `success@razorpay` | Payment succeeds |
| UPI | `failure@razorpay` | Payment fails |
| Visa | `4100 2800 0000 1007` | Any CVV, any future expiry, then **Success** on the bank page |
| Mastercard | `5500 6700 0000 1002` | Same |
| RuPay | `6527 6589 0000 1005` | Same |
| Netbanking / wallet | any bank | Choose **Success** or **Failure** on the mock page |

## 4. What to check

| Scenario | Expected |
|---|---|
| Successful payment | "Your payment is confirmed" with a `pay_…` reference; basket empties |
| `failure@razorpay` or **Failure** on the bank page | Red error message; basket kept; you can try again |
| Close the payment window | "Payment window closed. Your basket is saved…" |
| Razorpay Dashboard → Transactions → Payments (Test Mode) | Payment shows **Captured**, with delivery details in the order notes |
| Pay, then refresh during "confirming…" | Page resumes confirmation; Pay button stays locked, so no double payment |

The terminal logs each API call, e.g. `POST /api/verify-payment → 200`.

## 5. Automated tests (offline)

```sh
npm test
```

Fourteen tests run against a fake Razorpay, covering server-side pricing,
forged signatures, mismatched amounts, the capture race and the webhook.
They never touch your Razorpay account.

## 6. Testing on Vercel (optional)

Add the same test keys to Vercel → Project → Settings → Environment Variables
for the **Preview** environment only, then push to a branch other than `main`.
Vercel builds a preview URL where you can run the same test purchase.
Keep **Production** empty (or on live keys) until you are ready to go live.

The webhook can only be tested on a public URL (Vercel preview or production),
not on localhost; see PAYMENTS.md.
