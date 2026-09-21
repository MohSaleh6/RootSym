# Deploying RootSym

Target: **Cloudflare Workers + Neon Postgres**.

Cloudflare rather than Vercel for a concrete reason: Vercel's IP ranges are
not reliably reachable on Orange Jordan, which is a large share of this site's
audience. Cloudflare's network is reachable there, and it is closer to the
rest of the region too.

---

## 1. The database (Neon)

1. Create a project at <https://neon.tech> — Frankfurt (`aws-eu-central-1`) is the closest region to Jordan.
2. Copy the **pooled** connection string (the host contains `-pooler`).

The app uses Neon's WebSocket driver through `@prisma/adapter-neon`, so
`DATABASE_URL` must be a Neon URL. Workers cannot open a raw TCP socket, which
is what `node-postgres` would need.

## 2. The app (Cloudflare Workers)

```bash
npx wrangler login          # once, in a browser
npm run cf:deploy           # builds and deploys
```

`wrangler.jsonc` already sets everything: the Worker name (`rootsym`), the
`nodejs_compat` flag, and the static asset binding. The first deploy prints
your URL — `https://rootsym.<your-subdomain>.workers.dev`.

### Secrets

Environment variables are Worker **secrets**, set once with `wrangler`:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put AUTH_SECRET          # openssl rand -base64 48
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put MAIL_FROM
npx wrangler secret put ADMIN_NOTIFY_EMAIL
```

`NEXT_PUBLIC_SITE_URL` is different: it is inlined into the client bundle at
build time, so it belongs in `wrangler.jsonc` under `vars`, not in a secret.

### Deploying from the dashboard instead (no local tooling)

Connect the repository under **Workers & Pages → Create → Connect to Git**
and pick the branch you deploy from.

| Setting | Value |
|---|---|
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |

`opennextjs-cloudflare build` runs this package's own `build` script, so
`prisma generate` and `prisma migrate deploy` happen on their own — there is
nothing to chain in front of it.

Cloudflare keeps two separate lists and they are not interchangeable:

* **Settings → Build → Variables** — read while the build runs. `DATABASE_URL`
  must be here, because the build applies migrations.
* **Settings → Variables and Secrets** — read by the deployed Worker. Every
  key the app needs at runtime belongs here, added as a **Secret**, not a
  Variable: plain variables are overwritten from `wrangler.jsonc` on the next
  deploy, and secrets are not.

`DATABASE_URL` therefore goes in **both** lists.

Anything starting with `NEXT_PUBLIC_` is the opposite case: it is baked into
the JavaScript during the build, so it belongs **only** in the build list.
Added as a runtime secret it has no effect, because by then the value it would
have replaced is already compiled in.

Every push to that branch then deploys automatically.

## 3. The schema and the first data

`npm run build` runs `prisma migrate deploy`, so a deploy brings the database
up to date on its own.

For the very first deploy against an empty database, also set
`SEED_ON_BUILD=true`. The build then loads the RCA workshop, the two draft
workshops, two open cohorts and the payment settings. Set it back to `false`
afterwards. The seed never overwrites a row that already exists.

Migrations run against the **direct** database host, not the pooled one.
Neon's pooled host puts PgBouncer in transaction mode in front of Postgres,
which is right for the app — a Worker isolate opens a connection per request —
but wrong for `prisma migrate`, which needs one session that can hold an
advisory lock across several statements. `scripts/migrate.mjs` derives the
direct host from `DATABASE_URL` by dropping `-pooler`, drops the
`channel_binding` parameter that Prisma's migration engine rejects, and falls
back to `DATABASE_URL` as given if the direct host does not answer. Set
`DIRECT_DATABASE_URL` only if your provider names its two hosts some other way.

If the machine you are building on cannot reach the database at all, set
`SKIP_MIGRATE=true` for that build and run `npm run db:migrate` separately
from somewhere that can. It is meant as a temporary measure: with it set, a
deploy can ship code expecting a column the database does not have. Remove it
once the builder can reach the database.

## 4. Payment details

There is nothing to integrate. After the first deploy, open **Admin →
Settings** and fill in the CliQ alias and bank details — see
[PAYMENTS.md](PAYMENTS.md).

## 5. Email

Resend needs a verified domain before it will send to anyone other than the
account owner. Until that is done, customers will not receive their payment
details or joining links automatically — release them from the admin Bookings
page instead.

## 6. The domain

**Cloudflare dashboard → Workers & Pages → rootsym → Settings → Domains &
Routes → Add custom domain.** If the domain's DNS is already on Cloudflare
this is instant and the certificate is automatic.

**That is the whole job — there is nothing to change in the code.** Every
customer-facing link (joining links, payment pages, the URLs in emails) and
every canonical and Open Graph URL is built from the host on the incoming
request, so they follow the new domain the moment it starts serving traffic.
`NEXT_PUBLIC_SITE_URL` is only a fallback for code that runs outside a
request; updating it is tidy but not required.

---

## A note on Prisma and Workers

Prisma 7's default client compiles its query engine to WebAssembly at runtime,
which Cloudflare forbids (`Wasm code generation disallowed by embedder`). The
fix is in `prisma/schema.prisma`:

```prisma
generator client {
  provider     = "prisma-client"   // not prisma-client-js
  runtime      = "cloudflare"
  moduleFormat = "esm"
}
```

That generator emits a Worker-safe loader that imports the WebAssembly as a
static module instead of compiling it on the fly. Changing either line back
will break the deployed site while leaving local development working, so they
are easy to regress — leave them alone.

## First things to do in the admin panel

1. Sign in at `/admin`.
2. **Settings** — enter the real CliQ alias, bank name, account name and IBAN.
3. **Live dates** — schedule the first RCA cohort and paste its Microsoft Teams link.
4. **Workshops** — check the pricing, add a cover image, publish the drafts when ready.
5. Place a test booking and walk it through: hold → report a transfer → approve → open the joining link.
