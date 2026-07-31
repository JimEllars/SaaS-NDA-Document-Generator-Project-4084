# SaaS NDA Document Generator

This app deploys as:

1. **Cloudflare Pages** for the Vite frontend (`dist`)
2. **Cloudflare Workers** for API proxying, document generation, webhook handling, and edge security

## Cloudflare install and deployment setup

### 1) Required GitHub Actions secrets

Add these repository secrets before pushing to `main`:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

`deploy-production.yml` uses these to deploy both Pages and the Worker.

### 2) Worker configuration (`wrangler.jsonc`)

The Worker deploy now uses `wrangler.jsonc` directly (via `wrangler-action`), so bindings and runtime config are applied consistently:

- Worker name: `axim-nda-worker`
- Script entrypoint: `worker.js`
- Static asset binding: `ASSETS -> dist`
- KV binding: `AXIM_EDGE_KV`
- Cron trigger: every 15 minutes for DLQ retry + heartbeat

Before first deploy, replace KV placeholders in `wrangler.jsonc`:

- `REPLACE_WITH_PRODUCTION_KV_NAMESPACE_ID`
- `REPLACE_WITH_PREVIEW_KV_NAMESPACE_ID`

### 3) Worker vars vs secrets

Set **vars** (non-secret):

- `BACKEND_URL`
- `VITE_PAYMENT_API_URL`
- `AXIM_ENV`
- `VITE_ENABLE_WEB3`

Set **secrets** (sensitive) with Wrangler:

```bash
wrangler secret put AXIM_CORE_API_KEY
wrangler secret put AXIM_CORE_TOKEN
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### 4) Frontend (Pages) environment variables

Set these in the Pages project environment:

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_ENABLE_WEB3`
- Optional: `VITE_PAYMENT_API_URL` (leave empty in production for same-origin `/api/*` worker routing)
- Optional: `VITE_TELEMETRY_URL`
- Optional: `VITE_TELEMETRY_DIAGNOSTICS_URL`
- Optional: `VITE_ADMIN_MONITOR_KEY`

## CI/CD flow

`.github/workflows/deploy-production.yml`:

1. Installs dependencies
2. Runs tests
3. Builds frontend
4. Deploys Pages (`dist`)
5. Deploys Worker with `deploy --config wrangler.jsonc`

This keeps Worker deploys aligned with config-defined bindings (KV, assets, cron, vars).
