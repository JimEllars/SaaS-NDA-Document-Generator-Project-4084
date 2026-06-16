# Changelog

## [Unreleased]
- **Fixed:** `paymentService.js` to correctly pass the whole argument object for fetch spy mock in `paymentService.test.js`.
- **Added:** `fetchWithTimeout` wrapper across all components performing API requests (`SuccessPage.jsx`, `NDAGeneratorForm.jsx`, `useVectorSearch.js`, `paymentService.js`, `ErrorBoundary.jsx`).
- **Added:** Webhook Idempotency caching for `worker.js` via Cloudflare's Cache API using the event ID. Ensures duplicates don't trigger dual document renders.
- **Added:** Immediate telemetry event sanitization logic in `NDAGeneratorForm.jsx`. Replaces partial string emails in the queued telemetry batch with masked versions before transmission.
- **Added:** `React.memo` to `SuccessPage.jsx`, `Toast.jsx`, and `VerificationPortal.jsx` for UI render optimizations.
