# SaaS NDA Document Generator

## Cloudflare Infrastructure & Deployment
The application is deployed to Cloudflare Pages (frontend) and Cloudflare Workers (edge proxy/document generator) via `.github/workflows/deploy-production.yml`.

### Configuration Checklist
- `wrangler.jsonc` is configured with necessary environment variables: `VITE_ENABLE_WEB3`, `BACKEND_URL`, and `AXIM_SERVICE_KEY`.
- The Edge Worker handles routing, PDF generation (`workerDocumentGenerator.js`), caching, and securely proxying API requests to the AXiM Core.
- The `deploy-production.yml` workflow installs dependencies, runs Vitest checks, builds the Vite app, and uses `wrangler-action` to deploy the worker.

### Production QA
- Unit and integration tests cover payment flows, security token persistence, debounce efficiency, and UI rendering.
- UI components `Toast`, `ConfirmModal`, and `VerificationPortal` have been styled to match the dark AXiM ecosystem aesthetic.
