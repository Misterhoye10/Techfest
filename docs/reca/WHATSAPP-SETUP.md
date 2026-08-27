# Reca — WhatsApp setup (Meta Cloud API)

**Goal:** Get WhatsApp receive + send working so Reca can message students first.  
**Budget:** Free / Meta test number only.  
**Locked path:** **Meta WhatsApp Cloud API** (Twilio is retired for this build — ignore old Twilio docs).

Related: [FREE-STACK.md](./FREE-STACK.md) · [security.md](./security.md) · [demo-script.md](./demo-script.md)

---

## Why Meta

The backend (`backend/src/whatsapp.js`) talks to Meta Graph API only. Credentials:

| Env | Purpose |
|-----|---------|
| `META_PHONE_NUMBER_ID` | Send API |
| `META_ACCESS_TOKEN` | Bearer token |
| `META_VERIFY_TOKEN` | Webhook GET challenge (must match Meta dashboard) |
| `META_APP_SECRET` | Verify `X-Hub-Signature-256` on POST (**required in production**) |
| `META_DISPLAY_PHONE_NUMBER` | Optional E.164 shown in UI |

---

## Setup flow

### 1 — Meta app + WhatsApp product

1. Open [https://developers.facebook.com](https://developers.facebook.com)
2. Create (or open) a **Business** app
3. Add product **WhatsApp**
4. From **API Setup**, copy:
   - Phone number ID
   - Temporary (or permanent) access token
   - Test / display phone number

### 2 — Allow-list every demo phone

Meta test numbers only talk to **allow-listed** recipients.

Add:
- On-stage demo phone
- Backup phone
- Every teammate who will test

**Done when:** Meta console can send a test message to that phone.

### 3 — Deploy Reca webhook

Host on **Render** (always-on Node — not Vercel for the hero cron):

```text
GET/POST https://<your-app>.onrender.com/webhook
```

(Also mounted at `/webhook/whatsapp` for older notes.)

In Meta → WhatsApp → Configuration → Webhook:

1. Callback URL = the URL above  
2. Verify token = same string as `META_VERIFY_TOKEN` in Render env  
3. Subscribe to **messages**

**Done when:** Meta shows webhook verified (GET challenge succeeds).

### 4 — Render env (minimum for stage)

```env
NODE_ENV=production
ENABLE_DEMO=true
DEMO_SECRET=<long-random>
META_PHONE_NUMBER_ID=
META_ACCESS_TOKEN=
META_VERIFY_TOKEN=<unique-not-default>
META_APP_SECRET=
DRY_RUN=false
OTP_ECHO=false
RESURFACE_MINUTES=2
```

See [security.md](./security.md) for the full list.

### 5 — Smoke test

From an allow-listed phone:

```text
explain photosynthesis
```

Expect a Reca reply. Then complete Q1 wrong → fire resurface (teammate):

```bash
RECA_URL=https://<your-app>.onrender.com DEMO_SECRET=… npm run resurface -- +234…
```

**Day done when:** inbound explain works + unprompted resurface lands on WhatsApp.

---

## Message flow

```text
Student WhatsApp (allow-listed)
      |
      |  Meta Cloud API
      |  POST /webhook
      v
Reca backend (Node + Express on Render)
   |--> explain / quiz / grade (Gemini or preset)
   |--> in-memory attempts + nextReviewAt
   |--> node-cron / POST /demo/resurface
      |
      |  outbound WhatsApp
      v
Student WhatsApp  ← hero: Reca messages first
```

---

## Demo-day rules

- Re-check allow-list the morning of (tokens expire; numbers get dropped)
- Warm Render `/health` 5–10 minutes before stage
- Keep a **manual fire** ready — there is no student UI “Resurface now” button
- Never commit access tokens or app secrets to GitHub
- Prefer **preset quiz** on stage if Gemini invents different questions mid-pitch

---

## Team checklist

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Meta app + WhatsApp product | | |
| 2 | Allow-list demo + backup phones | | |
| 3 | Deploy Render + set env (incl. `ENABLE_DEMO` + `DEMO_SECRET`) | | |
| 4 | Webhook verify + messages subscribed | | |
| 5 | Smoke: `explain photosynthesis` replies | | |
| 6 | Smoke: wrong answer → `npm run resurface` → WhatsApp first | | |
| 7 | Laptop fire script ready for stage | | |

**Next 15 minutes:** one person confirms allow-list + webhook; another warms Render and tests fire with the secret.
