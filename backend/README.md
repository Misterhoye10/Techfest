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
| `POST /api/session` | Start session |
| `POST /api/chat` | Send message |
| `GET /api/events` | Poll resurface |
| `POST /demo/resurface` | Manual aha |
| `POST /webhook/whatsapp` | Twilio (optional) |

## Env

See `.env.example`. **Never commit `.env`.**

| Key | Required |
|-----|----------|
| `DRY_RUN=true` | Yes while Twilio broken |
| `TWILIO_*` | Only for real WhatsApp |
| `RESURFACE_MINUTES` | `2` for live demo |

## Docs

- [docs/reca/WEB-CHAT-SETUP.md](../docs/reca/WEB-CHAT-SETUP.md)  
- [docs/reca/conversation-copy.md](../docs/reca/conversation-copy.md)  
- [docs/reca/demo-topics.md](../docs/reca/demo-topics.md)  
