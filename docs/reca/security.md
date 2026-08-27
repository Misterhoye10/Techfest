# Reca security — competition / public traffic

Frontend is untrusted. Every sensitive decision is enforced on the server (`src/security.js` + route guards in `src/index.js`).

## Must set on Render (or any public host)

| Variable | Why |
|----------|-----|
| `NODE_ENV=production` | Tightens OTP echo, health detail, demo gates |
| `ENABLE_DEMO=true` | **Required in production** or `/demo/*` and `/debug/*` return 404 |
| `DEMO_SECRET` | Protects `/demo/*`, `/debug/*`, `/api/send-alert` — header `x-demo-secret` |
| `META_VERIFY_TOKEN` | Unique webhook verify token (not the repo default) |
| `META_APP_SECRET` | Verifies `X-Hub-Signature-256` on webhook POST — **required in production** |
| `META_PHONE_NUMBER_ID` + `META_ACCESS_TOKEN` | Live WhatsApp send/receive |
| `OTP_ECHO=false` | Never return codes in API responses publicly |
| `DRY_RUN=false` | Real WhatsApp only when you intend it |
| `RESURFACE_MINUTES=1` or `2` | Compressed aha for stage |
| `CORS_ORIGIN` | Optional comma list; empty = same-origin only |

Without **both** `ENABLE_DEMO=true` and a matching `DEMO_SECRET`, stage fire will fail on a production host.

Demo fire from your laptop:

```bash
curl -X POST https://YOUR_HOST/demo/resurface \
  -H "Content-Type: application/json" \
  -H "x-demo-secret: YOUR_DEMO_SECRET" \
  -d "{\"phone\":\"+2348012345678\"}"
```

Or: `RECA_URL=https://YOUR_HOST DEMO_SECRET=… npm run resurface -- +234…`

## What we locked

1. **Helmet** + no `X-Powered-By`
2. **CORS** default same-origin
3. **Rate limits** — global, auth, chat, upload, webhook
4. **Demo/debug/alert** — secret-gated (404 in prod unless `ENABLE_DEMO` + secret)
5. **Webhook signatures** — HMAC when `META_APP_SECRET` set; reject unsigned in production
6. **Guest IDs** — `guest_<uuid>` instead of shared `+2348000000001`
7. **OTP** — 6-digit `crypto.randomInt`, timing-safe compare, no code in logs, no echo in production
8. **Upload** — mime allowlist + ~1.5MB cap (server + LLM layer)
9. **Chat body** — length cap
10. **Health** — minimal in production unless `HEALTH_DETAIL=true`

## Still soft (known fest trade-offs)

- Phone / guest id in `localStorage` is still client-held — knowing someone’s E.164 can still hit their in-memory progress on the same server instance. Full opaque sessions are the next step after fest.
- Attempts live in-process memory — Render restart wipes Progress until Postgres persistence lands.
- In-memory OTP + rate limits reset on process restart / multi-instance unless you add Redis.
- Rotate any secrets that were shared in chat or screenshots before the public round.

## Quick self-test

```bash
# Should 401 without secret (when DEMO_SECRET set)
curl -i -X POST http://localhost:3000/demo/resurface -H "Content-Type: application/json" -d "{\"phone\":\"+2348012345678\"}"

# Session should mint guest_*
curl -s -X POST http://localhost:3000/api/session -H "Content-Type: application/json" -d "{}"
```
