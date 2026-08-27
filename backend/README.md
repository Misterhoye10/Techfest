# Reca backend

Study companion — **preset-first**, optional Gemini. Demo via **WhatsApp (Meta)** with **web chat** backup.

## Run locally

```powershell
cd backend
copy .env.example .env
# Fill META_* / GEMINI_API_KEY as needed
# DRY_RUN=true skips WhatsApp send while testing UI
npm install
npm run dev
```

Open **http://localhost:3000/chat.html** (or `/signup.html`).

## Live demo path (WhatsApp hero)

1. From allow-listed phone: `explain photosynthesis`  
2. Q1: answer `mitochondria` (wrong on purpose)  
3. Q2: `glucose and oxygen`  
4. **Teammate fires** (no UI button):

```powershell
$env:RECA_URL="https://reca-study-companion.onrender.com"
$env:DEMO_SECRET="your-secret"
npm run resurface -- +2348012345678
```

Or curl with header `x-demo-secret`. Requires Render: `ENABLE_DEMO=true` + matching `DEMO_SECRET`.

5. Phone receives unprompted recall → answer `chloroplast`  
6. Optional: `how am I doing in Biology?`

Web backup: same loop in `/chat.html`; after fire, outbox nudge appears within ~4s.

## APIs

| Route | Use |
|-------|-----|
| `GET /chat.html` | Student web UI |
| `GET /api/config` | Public WhatsApp number + continue link |
| `POST /api/session` | Start session (mints `guest_*` if needed) |
| `POST /api/chat` | Send message |
| `POST /api/send-alert` | Gated alert proxy (`x-demo-secret`) |
| `GET /api/events` | Poll resurface / briefing |
| `POST /demo/resurface` | Manual aha (gated) |
| `POST /demo/briefing` | Manual daily briefing (gated) |
| `GET/POST /webhook` | Meta WhatsApp Cloud API |

## Env

See `.env.example` and [docs/reca/security.md](../docs/reca/security.md). **Never commit `.env`.**

| Key | Notes |
|-----|--------|
| `ENABLE_DEMO` + `DEMO_SECRET` | Required on production for stage fire |
| `META_*` + `META_APP_SECRET` | WhatsApp send + signed webhooks |
| `GEMINI_API_KEY` | Optional — empty = preset bank only (safer for scripted demo) |
| `RESURFACE_MINUTES` | `1`–`2` for live demo |
| `DATABASE_URL` | Supabase — student upsert by phone (attempts still in-memory) |
| `DRY_RUN` / `OTP_ECHO` | Local only — never `true` on public host |

## Hosting note

Use **Render** (or Railway) for the hero. In-process cron + memory do **not** survive Vercel serverless well — keep `vercel.json` for experiments only.

## Docs

- [docs/reca/demo-script.md](../docs/reca/demo-script.md)  
- [docs/reca/WHATSAPP-SETUP.md](../docs/reca/WHATSAPP-SETUP.md)  
- [docs/reca/security.md](../docs/reca/security.md)  
- [docs/reca/WEB-CHAT-SETUP.md](../docs/reca/WEB-CHAT-SETUP.md)  
- [docs/reca/conversation-copy.md](../docs/reca/conversation-copy.md)  
- [docs/reca/demo-topics.md](../docs/reca/demo-topics.md)  
