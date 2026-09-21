#!/usr/bin/env bash
# One-shot Cloudflare deploy for RootSym.
#
#   cp .env.production.example .env.production.local   # then fill it in
#   bash scripts/deploy-cloudflare.sh
#
# Reads the values from .env.production.local (gitignored — never committed),
# stores them as Worker secrets, then builds and deploys. Re-running is safe.
set -euo pipefail

ENV_FILE=".env.production.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "✘ $ENV_FILE not found."
  echo "  cp .env.production.example $ENV_FILE and fill in the values first."
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "./$ENV_FILE"; set +a

echo "▸ Signing in to Cloudflare (a browser window will open)…"
npx wrangler login

echo
echo "▸ Storing secrets…"
put_secret() {
  local name="$1" value="${!1:-}"
  if [ -z "$value" ]; then
    echo "  – $name is empty, skipping"
    return
  fi
  printf '%s' "$value" | npx wrangler secret put "$name"
}

for name in DATABASE_URL AUTH_SECRET ADMIN_EMAIL ADMIN_PASSWORD \
            RESEND_API_KEY MAIL_FROM ADMIN_NOTIFY_EMAIL; do
  put_secret "$name"
done

echo
echo "▸ Building and deploying…"
npm run cf:deploy

echo
echo "✓ Done. The URL printed above is your live site."
echo "  Open /admin on it and sign in to check everything is there."
