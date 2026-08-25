# Reca backend

WhatsApp study companion — **preset-first** (works with $0 LLM spend). Optional Claude key later.

## You can run this on your machine

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Test without Twilio:

```bash
curl -X POST http://localhost:3000/debug/chat -H "Content-Type: application/json" -d "{\"phone\":\"+2348000000001\",\"body\":\"explain photosynthesis\"}"
```

Then answer Q1 wrong (`mitochondria`), Q2 right (`glucose and oxygen`), wait `RESURFACE_MINUTES` (default 2) **or** fire:

```bash
curl -X POST http://localhost:3000/demo/resurface -H "Content-Type: application/json" -d "{\"phone\":\"+2348000000001\"}"
```

## Twilio webhook

1. Deploy or tunnel (`ngrok http 3000`)
2. Sandbox “when a message comes in” → `https://<host>/webhook/whatsapp`
3. Join sandbox from your phone
4. Send: `explain photosynthesis`

## Env

See `.env.example`. **Never commit `.env`.**

| Key | Required |
|-----|----------|
| TWILIO_* | For real WhatsApp |
| ANTHROPIC_API_KEY | Optional — presets work without it |
| RESURFACE_MINUTES | `2` for live demo |

## Collaborate with Koye

- This folder is the shared backend start
- If he already has code elsewhere, merge — don’t fork two bots
- Copy pack: `docs/reca/conversation-copy.md`
- Topics: `docs/reca/demo-topics.md`
