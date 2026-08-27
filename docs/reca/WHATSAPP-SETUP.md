# Reca — WhatsApp setup flow (do this ASAP)

**Goal:** Get a free WhatsApp channel working so Reca can receive and send messages.  
**Budget:** Free only (Twilio Sandbox or Meta test number).  
**Default path:** **Twilio WhatsApp Sandbox** (fastest for a 2-day hackathon).

Related: [FREE-STACK.md](./FREE-STACK.md) · [BUILD-REQUIREMENTS.md](./BUILD-REQUIREMENTS.md) · [technical-prd.md](./technical-prd.md)

---

## Decision

| Option | Use when | Speed |
|--------|----------|-------|
| **Twilio WhatsApp Sandbox** (preferred) | You need to start today | ~20–30 min |
| Meta WhatsApp Cloud API test number | Twilio signup is blocked in your region | Slower (1–2+ hrs) |

**Locked for Reca MVP:** start on Twilio Sandbox. Switch to Meta only if Twilio fails.

---

## Flow A — Twilio WhatsApp Sandbox (required path)

### Step 1 — Create Twilio account
1. Open [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up (free trial is fine)
3. Verify your phone number

**Owner:** one teammate (post Account SID later — never in public chat as a full secret dump if avoidable; use team vault).

### Step 2 — Open WhatsApp Sandbox
1. Twilio Console → **Messaging** → **Try it out** → **Send a WhatsApp message**  
   Direct: [https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Copy the join instructions. Example shape:
   - Send `join <code-words>` to `+1 415 XXX XXXX`

### Step 3 — Join from every demo phone
On WhatsApp, message the Twilio sandbox number:

```text
join <the-code-shown-in-console>
```

Wait for confirmation that you joined the sandbox.

**Must join:**
- Every teammate’s phone
- The on-stage demo phone
- Any judge / volunteer phone you can get early

Sandbox **only** talks to numbers that have joined.

### Step 4 — Prove 2-way chat (before backend)
1. In Twilio “try it out”, send a WhatsApp message to your joined number
2. Reply from your phone
3. Confirm the inbound reply appears in Twilio (logs / monitor)

**Done when:** messages go both ways with **no code yet**.

### Step 5 — Save credentials for backend (private)
From Twilio Console:

| Value | Example shape | Store in |
|-------|---------------|----------|
| Account SID | `ACxxxxxxxx` | `.env` / team secrets |
| Auth Token | secret | `.env` / team secrets — **never commit to GitHub** |
| WhatsApp from | `whatsapp:+1415xxxxxxx` | `.env` |

Suggested `.env` keys:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+1415xxxxxxx
```

### Step 6 — Point webhook at Reca backend
When Express is running (Render / Railway, or local + tunnel):

1. Twilio Sandbox → **Sandbox settings** (or WhatsApp sandbox config)
2. **When a message comes in** →  
   `https://<your-app>.onrender.com/webhook/whatsapp`  
   (or ngrok / Cloudflare Tunnel URL while developing)
3. Method: **HTTP POST**
4. Save

**Local test (optional, free):**
- Run API on `localhost:3000`
- Expose with **ngrok free** or **Cloudflare Tunnel**
- Paste that HTTPS URL into the sandbox webhook field

### Step 7 — Smoke test with Reca
1. From a joined phone, send: `explain photosynthesis`
2. Backend should receive the webhook and reply on WhatsApp
3. First milestone reply can be: `Reca is online` (echo) before full AI loop

**Day 1 done for WhatsApp when:** join works + webhook receives + bot replies.

---

## Flow B — Meta WhatsApp Cloud API (fallback only)

Use only if Twilio is blocked.

1. Go to [https://developers.facebook.com](https://developers.facebook.com)
2. Create an app (type **Business**)
3. Add product **WhatsApp**
4. Copy the **test phone number** and **temporary access token**
5. Add recipient phone numbers to the allow-list
6. Configure webhook to the same endpoint:  
   `POST /webhook/whatsapp`
7. Verify token challenge (Meta sends a GET verify request — backend must handle it)

**Done when:** test number can message an allow-listed phone and receive replies via your webhook.

---

## End-to-end message flow (what we’re building toward)

```text
Student WhatsApp
      |
      |  (joined sandbox / allow-listed)
      v
Twilio or Meta WhatsApp API
      |
      |  POST /webhook/whatsapp
      v
Reca backend (Node + Express)
   |--> classify intent (topic / answer / recap)
   |--> Claude (explain / grade)  [free credits]
   |--> Supabase (store attempts)
   |--> node-cron / manual trigger (resurface)
      |
      |  outbound WhatsApp message
      v
Student WhatsApp
```

### Product loop over this channel

1. Capture topic  
2. Explain  
3. Quiz (2 questions)  
4. Grade + store  
5. **Unprompted resurface** (hero)  
6. Recap on request  

---

## Team checklist (ASAP)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1 | Create Twilio account | | |
| 2 | Post `join …` instructions in team chat | | |
| 3 | All teammates join sandbox | | |
| 4 | Prove 2-way chat in Twilio console | | |
| 5 | Save SID / token / from-number in private secrets | | |
| 6 | Deploy or tunnel webhook URL | | |
| 7 | Set sandbox “when message comes in” webhook | | |
| 8 | Echo reply: `Reca is online` | | |
| 9 | Wire explain → quiz → grade | | |
| 10 | Wire resurface + manual backup trigger | | |

---

## Demo-day rules (do not skip)

- Re-check that the **demo phone is still joined** to the sandbox (sessions can drop)
- Join **backup phones** the same morning
- Warm free hosting (Render/Railway) 5–10 minutes before going on stage
- Keep a **manual resurface** route/button even if cron works
- Never put Auth Token or Meta permanent tokens in the public repo

---

## Who does what right now

| Role | Do this next |
|------|----------------|
| Anyone with a phone | Create Twilio + share join code + everyone joins |
| Backend | Scaffold `POST /webhook/whatsapp` + echo reply |
| Rest of team | Join sandbox; don’t wait on code |

**Next 15 minutes:** one person creates Twilio, posts join instructions, everyone joins, send a test message both ways.
