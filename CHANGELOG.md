# Changelog

## [Unreleased]
- **Fixed:** `paymentService.js` to correctly pass the whole argument object for fetch spy mock in `paymentService.test.js`.
- **Added:** `fetchWithTimeout` wrapper across all components performing API requests (`SuccessPage.jsx`, `NDAGeneratorForm.jsx`, `useVectorSearch.js`, `paymentService.js`, `ErrorBoundary.jsx`).
- **Added:** Webhook Idempotency caching for `worker.js` via Cloudflare's Cache API using the event ID. Ensures duplicates don't trigger dual document renders.
- **Added:** Immediate telemetry event sanitization logic in `NDAGeneratorForm.jsx`. Replaces partial string emails in the queued telemetry batch with masked versions before transmission.
- **Added:** `React.memo` to `SuccessPage.jsx`, `Toast.jsx`, and `VerificationPortal.jsx` for UI render optimizations.
- **Updated:** `Toast.jsx` styling to match the dark cyberpunk AXiM theme.
- **Updated:** `ConfirmModal.jsx` styling to match the dark cyberpunk AXiM theme.
- **Updated:** `VerificationPortal.jsx` e-signature section styling to match the dark theme and other form elements.
- **Updated:** Fixed `update_verification_portal.js` syntax issues, ran it to refine the payload truncation and payload limits to protect the worker, and fully passed regressions.
- **Audited:** `useFormValidation.js` handles edge cases (extremes over 100/500 limits, missing inputs, invalid chars) with robust returns, preventing UI to Edge failures. Tested natively within `useFormValidation.test.jsx`.
- **Added:** Telemetry integration in `ErrorBoundary.jsx`, `VerificationPortal.jsx`, and `worker.js` (for PDF compilation errors) using `logException`.
- **Updated:** Modern UI/UX implementation applied to `UpsellCard.jsx` and `IntelligenceHub.jsx` utilizing `backdrop-blur-md` and cohesive shadow metrics aligned with the AXiM cyberpunk design system.
- **Security:** Added input sanitization to the `useVectorSearch.js` semantic search queries to mitigate prompt injection to the Onyx Mk3 bridge.

## [Unreleased]
### Added
- Auth & Session Persistence: added session-storage persistence logic in \`src/hooks/useAximAuth.js\` to ensure seamless reload recovery, fallback logic for offline state, and cross-tab zero-disruption auth management.

### Changed
- Telemetry & Analytics Hardening (\`src/utils/telemetry.js\`):
  - Refactored queue batching.
  - Implemented \`navigator.sendBeacon\` on \`beforeunload\`.
  - Suppressed unhandled promise rejections on fetch network dropouts.
- Worker Edge Sanitization & Error Contract (\`worker.js\`):
  - Injected strict data presence requirements for 'disclosing' and 'receiving' entity attributes.
  - Aligned edge-return responses uniformly into \`{ success: false, error: { code, message, details } }\` payloads for UI ingestion.
- Accessibility Polish:
  - Ensured \`ConfirmModal\` focus lock & traps on activation (\`src/components/ConfirmModal.jsx\`).
  - Improved \`Toast\` announcements with \`aria-live="polite"\` & \`role="status"\` for better accessibility tools detection (\`src/components/Toast.jsx\`).
