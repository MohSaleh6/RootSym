# Payments

## Where things stand

**Stripe does not onboard merchants based in Jordan.** The Stripe code in this
repository is left in place and stays dormant: with `STRIPE_SECRET_KEY` unset,
the checkout shows a single payment method and every booking runs on **CliQ or
bank transfer**. Nothing else in the platform changes.

That is not a workaround — for a Jordanian audience it is the better rail.
CliQ settles instantly, costs nothing, and is what people already use.
Companies buying a 900 JOD room pay by transfer against an invoice anyway.

---

## The flow a customer sees

1. They fill in the checkout form and press **Continue**.
2. A booking is created with status `PENDING`, and the seat is **held for 48
   hours** (`holdExpiresAt`).
3. They land on `/checkout/confirm/<token>` — their payment page. It shows:
   - the amount due,
   - the booking reference (`RS-XXXX-XXXX`) to put in the transfer note,
   - a live countdown on the hold,
   - the CliQ alias and bank details, each with a copy button,
   - a form: **"Already sent it?"**
4. The same details go out by email, so they can come back to the page later.
5. They transfer the money, then enter their transfer reference or receipt
   number. The booking moves to `AWAITING_REVIEW` and you get an email.
6. You check the account, open **Bookings** in the admin panel, and press
   **Mark paid & send link**.
7. The booking becomes `PAID` and the customer is emailed their single-use
   joining link.

Nothing about this is automatic on the money side — which is the point. You
confirm the cash actually arrived before a seat is released.

---

## What you must fill in

**Admin → Settings**, before taking the first real booking:

| Field | Notes |
|---|---|
| CliQ alias | What customers send to — your registered alias or mobile number |
| CliQ account name | So they can check the name before confirming |
| Bank name, account name, account number, IBAN | For anyone who prefers a normal transfer |
| SWIFT / BIC | Only needed for transfers from outside Jordan |
| Extra notes (EN / AR) | Cut-off times, who to contact, anything else |

Leave a field blank and it is simply not displayed. Until at least a CliQ alias
or an IBAN exists, the payment page tells customers the details are coming by
email — bookings still work, they just need a manual follow-up.

---

## Adding card payments later

Only worth doing if you start selling outside Jordan. Two routes:

### A local Jordanian gateway
[PayTabs](https://ai.paytabs.com/en/jordan-payment-gateway/) and
[HyperPay](https://www.hyperpay.com/) both operate in Jordan, and
[MEPS](https://www.zawya.com/en/press-release/companies-news/middle-east-payment-services-partners-with-saudi-arabias-paytabs-group-hsamgmkj)
is the Jordanian bank-consortium processor. All of them require a **registered
business and a merchant account with a Jordanian bank** — they will not onboard
an individual trainer.

### A merchant of record
Paddle and Lemon Squeezy sell on your behalf, handle international cards and
tax, and pay out to your bank account. They are the usual answer for sellers in
countries Stripe does not cover. **Confirm seller eligibility for Jordan with
the provider directly before building anything** — country support changes, and
their published lists mostly describe where *buyers* can be, not sellers.

### Where the code hooks in

Adding a provider touches three places and nothing else:

| File | What to add |
|---|---|
| `src/lib/stripe.ts` | A sibling module, e.g. `src/lib/paytabs.ts`, exposing "is it configured?" and "create a hosted payment session" |
| `src/app/api/checkout/route.ts` | One more branch alongside the existing `useStripe` branch |
| `src/app/api/<provider>/webhook/route.ts` | Verify the signature, then call `confirmEnrollmentPaid(enrollmentId)` |

`confirmEnrollmentPaid` already does everything downstream: marks the booking
paid, emails the single-use joining link, and notifies you. Seat holds,
references, access tokens and the admin panel need no changes at all.

---

## Money handling

Prices are stored as integers in **fils** (1 JOD = 1000 fils), so there is no
floating-point rounding anywhere. `src/lib/money.ts` is the only place that
converts, formats, or parses an amount.

Sources: [PayTabs Jordan](https://ai.paytabs.com/en/jordan-payment-gateway/) ·
[HyperPay](https://www.hyperpay.com/) ·
[JoPACC — CliQ](https://www.jopacc.com/what-we-do/systems-platforms/what-cliq)
