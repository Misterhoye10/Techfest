# Reca web chat (demo channel)

Use this when **Meta / Twilio WhatsApp is blocked**. Same memory engine; browser chat for judges.

## Run

```powershell
cd "C:\Users\USER\Documents\Projects\Reca\backend"
npm install
npm run dev
```

Open: **http://localhost:3000/chat.html**

Optional: set `DRY_RUN=true` in `.env` so Twilio failures never matter.

## Demo script (90 sec)

1. Open chat → welcome appears  
2. Type: `explain photosynthesis`  
3. Q1 answer: `mitochondria`  
4. Q2 answer: `glucose and oxygen`  
5. Click **Resurface now** (or wait `RESURFACE_MINUTES`)  
6. Reply: `chloroplast`  
7. Optional: `how am I doing in Biology?`

## Judge line

> Production channel is WhatsApp. Sandbox APIs blocked us this fest, so you’re seeing the live loop here — same memory engine: remember the miss, come back unprompted.

## API

| Route | Job |
|-------|-----|
| `POST /api/session` | Start session + welcome |
| `POST /api/chat` | Student message → bot replies |
| `GET /api/events?phone=` | Poll unprompted resurface |
| `POST /demo/resurface` | Manual aha trigger |

## Pitch note

Do **not** hide that it’s a web demo. Own the constraint; sell the **memory** moment.
