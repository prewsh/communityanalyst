# Security Template

This repository handles production user data and privileged API access. Treat security requirements as **non-optional**.

## Agent Rules (MUST FOLLOW)

- **No secrets in code**
  - Never commit: Service role keys, JWT secrets, database passwords, API keys.
  - Client-side env vars must be limited to `NEXT_PUBLIC_*` and must be non-sensitive.

- **Assume public keys are public**
  - Anyone can extract client-side keys from a web app.
  - All data protection must be enforced via **server-side checks**.

- **Service role usage**
  - Service role keys may only be used in:
    - Next.js Route Handlers (`src/app/api/**`)
    - Edge Functions or serverless functions
    - Trusted backend workers
  - Never expose service role keys to the browser.

- **Prefer server endpoints for public write actions**
  - Any endpoint that handles file uploads or analytics must:
    - Validate input (file type, file size, MIME type)
    - Apply rate limits
    - Use server-side processing only
  - Client components must not call write RPCs directly. Use a server route.

- **Function hardening**
  - Validate all inputs before processing (type, size, format).
  - Restrict function execution to only what is needed.

- **Do not increase attack surface**
  - Do not attach privileged objects to `window` unless strictly required.
  - Avoid broad CORS (`*`) except where explicitly intended and reviewed.

## Required Checks Before Merge

- **Repository scan**
  - Search for leaked keys:
    - API keys (e.g., `AIza...`, `sk-...`)
    - JWTs (`eyJ...`)
    - Any secret keys or tokens

- **Verify public write paths**
  - Confirm all file upload routes validate MIME type, size, and content.
  - Confirm any public write action is routed through a server endpoint.

## API Security Standards (This Project)

- **`/api/analyze` (POST)**
  - Validates file presence and file size (10MB cap).
  - Only `.txt` and `.html` files are processed.
  - AI API key lives in `process.env.GOOGLE_GENERATIVE_AI_API_KEY` — never client-side.
  - Error responses never expose raw stack traces or internal error details to the client.
  - Rate limit errors are caught and returned with user-friendly `429` messages.

## Environment Variables

| Variable | Location | Notes |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `.env.local` / Vercel env | Server-only. Never expose to browser. |

## Incident Response (If a Key is Exposed)

- Rotate impacted keys immediately.
- Review logs for unusual access patterns.
- Add a regression test/checklist entry to prevent recurrence.
