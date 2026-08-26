# Reca — Web chat setup (no Meta / Twilio required)

**When to use:** WhatsApp sandbox / Meta API blocked.  
**What it is:** Browser chat that runs the same Reca loop (explain → quiz → grade → resurface → recap).

## Setup (you)

```powershell
cd "C:\Users\USER\Documents\Projects\Reca\backend"
copy .env.example .env
# Optional: DRY_RUN=true
npm install
npm run dev
```

Open **http://localhost:3000/chat.html**

## Demo path

Follow the checklist on the left of the chat page, or [demo-script.md](./demo-script.md) with **Resurface now** instead of waiting for WhatsApp.

## Judge line

> Production is WhatsApp. Sandbox APIs blocked us, so you’re seeing the live loop here — same memory engine.

## Share with Koye

```text
Web chat demo is ready in backend/public.
Run: cd backend && npm run dev
Open: http://localhost:3000/chat.html

Same engine as WhatsApp path. /demo/resurface button for the aha.
Meta/Twilio can stay blocked — we demo this.
```

Full notes: [../../backend/public/README.md](../../backend/public/README.md)
