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
| `ADMIN_NOTIFY_EMAIL` | Where booking alerts are sent |

There is no payment provider to configure. Stripe does not accept merchants
based in Jordan, so the site runs on CliQ and bank transfer, and the payment
details are entered in the admin panel rather than in environment variables.
See [PAYMENTS.md](PAYMENTS.md).

## 3. The schema and the first data

`npm run build` runs `prisma migrate deploy`, so **every deploy brings the
database up to date on its own** — there is nothing to run by hand.

For the very first deploy against an empty database, also set
`SEED_ON_BUILD=true`. The build then loads the RCA workshop, the two draft
workshops, two open cohorts and the payment settings. Set it back to `false`
afterwards.

The seed never overwrites a row that already exists, so it cannot undo an
edit made in the admin panel — but leaving the flag on just spends build
time for nothing.

## 4. Payment details

There is nothing to integrate. After the first deploy, open **Admin →
Settings** and fill in the CliQ alias and bank details. Those are what
customers see on their payment page and receive by email.

The status panel on that page tells you at a glance whether payments, email
and the site URL are ready.

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
2. **Settings** — enter the real CliQ alias, bank name, account name and IBAN. Nothing can be paid for until this is done.
3. **Live dates** — schedule the first RCA cohort and paste its Microsoft Teams link.
4. **Workshops** — check the RCA pricing, add a cover image, and publish the two draft workshops when they are ready.
5. Place a test booking yourself and walk it through: hold → report a transfer → approve → open the joining link.

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
