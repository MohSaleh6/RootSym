<div align="center">

# RootSym

**Root Cause Analysis & Systematic Actions** — by Rand Saleh

A complete course platform: a public site that sells live workshops, a
single-use joining-link system for Microsoft Teams sessions, an interactive
RCA playground, and a full admin panel — in English and Arabic.

</div>

---

## What it does

**For visitors**
- A portfolio and biography built from Rand Saleh's CV — experience, education, certifications and skills.
- A workshop catalogue with full agendas, outcomes, audience, tools and FAQs.
- Two-tier pricing on every workshop: an individual seat price and a flat company-room price capped at 15 attendees.
- Checkout with **Stripe** card payments or **bank transfer / CliQ**, whichever is configured.
- A **playground** of five interactive activities that drill the RCA method.
- One click switches the whole site between **English and Arabic**, including right-to-left layout.

**For the customer, after paying**
- A personal joining page. It reveals the Microsoft Teams link **once** and then seals itself, so a paid link cannot be forwarded around.
- The link, a copy button and an `.ics` calendar file are all on that page.

**For the admin**
- Create and edit workshops: title, tagline, summary, full description, cover image, duration, level, language, delivery mode, individual price, company price, max attendees, accent colour, icon, learning outcomes, audience, tools, an hour-by-hour agenda and FAQs — each with an Arabic translation field.
- Schedule live cohorts and attach a Microsoft Teams link to each one.
- Approve bank transfers, reissue or revoke joining links, and keep private notes on every booking.
- Read and handle contact-form messages.
- Edit the bank-transfer instructions that customers receive.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 with a custom RootSym design system |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Payments | Stripe Checkout, with a manual bank-transfer fallback |
| Email | Resend (optional — falls back to server logs) |
| Auth | Signed JWT cookie (`jose`) + edge middleware |
| 3D / motion | A hand-written canvas wireframe renderer, no 3D library |

---

## Running it locally

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, ADMIN_* and AUTH_SECRET
npx prisma migrate dev      # create the schema
npm run db:seed             # load the RCA workshop and two draft workshops
npm run dev
```

Open <http://localhost:3000>. The admin panel lives at `/admin` and signs in
with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Useful scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:migrate` | Apply migrations (use in production) |
| `npm run db:seed` | Seed the RCA workshop and site settings |
| `npm run db:studio` | Browse the database |

---

## Deploying

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for the full walkthrough: Neon,
Vercel, the custom domain, Stripe keys and the webhook, and Resend.

---

## How the one-time joining link works

1. Payment clears (Stripe webhook, the success page verifying with Stripe, or an admin approving a bank transfer).
2. The booking is marked `PAID` and an email goes out containing `/access/<token>`, where the token is 24 random bytes.
3. Opening that page shows a confirmation button — nothing is revealed by a link preview or a prefetch.
4. Pressing it runs a conditional update (`accessOpenedAt IS NULL`), so two simultaneous clicks cannot both win. The Teams link comes back only to the winner.
5. Every later visit shows "already opened". The admin can issue a fresh link, or revoke access entirely, from the Bookings page.

If no Teams link has been published yet for that cohort, the token is **not**
consumed — the page says the date is still to be announced.

---

## Money

Prices are stored as integers in **fils** (1 JOD = 1000 fils), which is also
Stripe's minor unit for JOD, so amounts pass through untouched. If your Stripe
account cannot settle in JOD, set `STRIPE_CURRENCY` and `STRIPE_RATE_PER_JOD`
and the storefront keeps quoting JOD while Stripe charges in the supported
currency.

---

## Project layout

```
prisma/           schema, migrations and the seed
src/app/          routes — public pages, checkout, access, admin, API
src/components/   design system, sections, the 3D canvas, the five games
src/content/      profile (from the CV) and legal copy
src/i18n/         English + Arabic dictionary and the locale provider
src/lib/          prisma, auth, stripe, mail, money, dates, validation
```
