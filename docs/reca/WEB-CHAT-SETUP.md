# Reca web chat

**This is the student product UI** — not a judge control panel.

Open: **http://localhost:3000/chat.html**

## What students see

- Clean chat with Reca
- Suggested topics (photosynthesis, osmosis, etc.)
- Type any topic or answer freely
- Weak topics **resurface automatically** after `RESURFACE_MINUTES` (default 2 for fest)

## What was removed (on purpose)

- Demo sidebar / cheat answer chips
- “Resurface now” button (stage fire is CLI/curl with `x-demo-secret` — see [demo-script.md](./demo-script.md))
- Judge notes about WhatsApp being blocked

For the pitch/demo video: record the student flow. Narrate the aha when Reca messages first.

## Run

```powershell
cd backend
npm run dev
```

Set in `.env` for a faster live aha:

```env
RESURFACE_MINUTES=1
DRY_RUN=true
```

On production, set `ENABLE_DEMO=true` + `DEMO_SECRET` and fire with `npm run resurface -- +234…`.

## Judge line (spoken, not on screen)

> This is what the student sees on the web. Production ships on WhatsApp — same memory loop.
