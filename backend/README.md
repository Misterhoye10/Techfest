# Reca backend

Study companion — **preset-first**. Demo via **web chat** (primary when Meta/Twilio blocked). WhatsApp webhook optional.

## Run (web chat demo)

```powershell
cd backend
copy .env.example .env
# Recommended while WhatsApp is blocked:
# DRY_RUN=true
npm install
npm run dev
```

Open **http://localhost:3000/chat.html**

### Live demo path

1. `explain photosynthesis`  
2. Q1: `mitochondria`  
3. Q2: `glucose and oxygen`  
4. Click **Resurface now**  
5. `chloroplast`  
6. Optional: `how am I doing in Biology?`

## APIs

| Route | Use |
|-------|-----|
| `GET /chat.html` | Judge-facing chat UI |
| `GET /api/config` | Public WhatsApp number + continue link |
| `POST /api/session` | Start session |
| `POST /api/chat` | Send message |
| `POST /api/send-alert` | Proxy → Render Meta alert API |
| `GET /api/events` | Poll resurface |
| `POST /demo/resurface` | Manual aha |
| `GET/POST /webhook` | Meta WhatsApp Cloud API |

## Env

See `.env.example`. **Never commit `.env`.**

| Key | Required |
|-----|----------|
| `DATABASE_URL` | Shared Supabase — phone is student unique ID |
| `RECA_WHATSAPP_NUMBER` | Business number for `wa.me` (default `15556777893`) |
| `RECA_ALERT_URL` | Render alert endpoint |
| `META_*` / `GEMINI_API_KEY` | Optional on web if Render owns Meta+Gemini |
| `RESURFACE_MINUTES` | `2` for live demo |
| `OTP_ECHO=true` | Local only — shows OTP when WhatsApp can’t deliver |
| `DRY_RUN=true` | Local dry-run (skips WhatsApp send) |

### Backend-team contract (web vs Render)

- **Web:** signup with WhatsApp phone → store in Supabase · Continue on WhatsApp · `POST /api/send-alert`
- **Render:** Meta WhatsApp + Gemini · `https://reca-study-companion.onrender.com/api/send-alert`
- Click-to-chat: `https://wa.me/15556777893?text=explain%20[TOPIC]`

## Docs

- [docs/reca/WEB-CHAT-SETUP.md](../docs/reca/WEB-CHAT-SETUP.md)  
- [docs/reca/conversation-copy.md](../docs/reca/conversation-copy.md)  
- [docs/reca/demo-topics.md](../docs/reca/demo-topics.md)  
