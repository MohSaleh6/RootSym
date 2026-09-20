# Deploying RootSym

Target: **Vercel + Neon Postgres**, which is free to start and takes a custom
domain in a couple of minutes. Anything that runs Node 20+ and can reach a
PostgreSQL database will work just as well.

---

## 1. The database (Neon)

1. Create a project at <https://neon.tech> — pick the region closest to Jordan (Frankfurt is a good choice).
2. Copy the **pooled** connection string. It looks like:
   `postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require`
3. Keep it for the next step.

## 2. The app (Vercel)

1. Push this repository to GitHub.
2. At <https://vercel.com/new>, import it. Vercel detects Next.js on its own — leave the build settings alone.
3. Add the environment variables below under **Settings → Environment Variables**, then deploy.

### Required

| Name | Value |
|---|---|
| `DATABASE_URL` | The Neon pooled connection string |
| `ADMIN_EMAIL` | The email you sign in to `/admin` with |
| `ADMIN_PASSWORD` | A long password (or use `ADMIN_PASSWORD_HASH`) |
| `AUTH_SECRET` | 32+ random characters — `openssl rand -base64 48` |
| `NEXT_PUBLIC_SITE_URL` | `https://rootsym.com` — no trailing slash |

### Optional but recommended

| Name | Value |
|---|---|
| `RESEND_API_KEY` | From <https://resend.com> — without it, emails only go to the server log |
| `MAIL_FROM` | `RootSym <hello@rootsym.com>` (the domain must be verified in Resend) |
| `ADMIN_NOTIFY_EMAIL` | Where new-booking alerts are sent |
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…`, from step 4 |
| `STRIPE_CURRENCY` | `jod`, or a supported currency if your account cannot settle JOD |
| `STRIPE_RATE_PER_JOD` | Only needed when `STRIPE_CURRENCY` is not `jod` |

## 3. Create the schema

After the first deploy, run the migration against the production database:

```bash
DATABASE_URL="<your neon url>" npx prisma migrate deploy
DATABASE_URL="<your neon url>" npm run db:seed     # optional: loads the RCA workshop
```

You can run both from your own machine — they only touch the database.

## 4. Stripe

1. In the Stripe dashboard, **Developers → Webhooks → Add endpoint**.
2. URL: `https://rootsym.com/api/stripe/webhook`
3. Events: `checkout.session.completed` and `checkout.session.expired`.
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

The success page also verifies the session directly with Stripe, so a
customer is never left waiting if a webhook is delayed — but set the webhook
up anyway, it is the source of truth.

> **If Stripe is not available to you yet:** leave the keys empty. Every
> checkout then uses the bank transfer / CliQ path, the customer gets your
> transfer details by email, and you release their joining link from the
> admin Bookings page once the money lands. Nothing else changes.

## 5. Email

Resend needs a verified domain before it will send from `@rootsym.com`. Until
that is done you can keep `MAIL_FROM` as `RootSym <onboarding@resend.dev>`,
which works immediately for testing.

## 6. The domain

**Vercel → Settings → Domains → Add.** Point the registrar at the records
Vercel shows (an `A` record for the apex, a `CNAME` for `www`). HTTPS is
issued automatically. Then update `NEXT_PUBLIC_SITE_URL` and redeploy, so
joining links are built from the real domain.

---

## First things to do in the admin panel

1. Sign in at `/admin`.
2. **Settings** — replace the placeholder bank details with the real bank name, account name, IBAN and CliQ alias.
3. **Live dates** — schedule the first RCA cohort and paste its Microsoft Teams link.
4. **Workshops** — check the RCA pricing, add a cover image, and publish the two draft workshops when they are ready.

## Health check

`/admin/settings` shows whether Stripe, email and the site URL are wired up,
so you can confirm the deployment at a glance.

---

## Self-hosting instead

```bash
npm ci
npx prisma migrate deploy
npm run build
npm start          # listens on :3000 — put nginx or Caddy in front for TLS
```

Set the same environment variables in the process environment. Node 20 or
newer, and a reachable PostgreSQL 14+ instance, are the only requirements.
