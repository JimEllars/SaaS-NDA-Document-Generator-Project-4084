# AXiM Commercial NDA Generator

AXiM Business Development Flagship SaaS Micro-App for executing Non-Disclosure Agreements with zero-knowledge architecture.

## Repository Setup

This repository requires specific environment bindings to run fully in production:

### Worker Environment Secrets:
- `EMAILIT_API_KEY`: API Key for EmailIt v2 routing.
- `RESEND_API_KEY`: Fallback API key for Resend email service.
- `TURNSTILE_SECRET_KEY`: Server-side secret for bot validation.
- `AXIM_TELEMETRY_KEY`: Ingest key for AXiM core telemetry.

## Running Locally

Run `npm install` followed by `npm run dev` for Vite and `npm run cf:dev` for the edge worker.
