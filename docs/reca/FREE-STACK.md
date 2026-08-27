# Reca — Free tools only (locked)

**Hard rule for this hackathon:** build and demo Reca on **free tools / free tiers only**. No paid subscriptions required to ship the MVP.

If a teammate wants a paid tool, they must propose a free alternative first — or get explicit team approval with a cost owner.

---

## Approved free stack

| Layer | Tool | Plan | Notes |
|-------|------|------|--------|
| Messaging | **Meta WhatsApp Cloud API** | Free / test number | `META_PHONE_NUMBER_ID` + `META_ACCESS_TOKEN`. Webhook: `GET/POST /webhook`. (Twilio retired for this build.) |
| Backend runtime | **Node.js + Express** | Free | Open source |
| AI | **Google Gemini** (`GEMINI_API_KEY`) | Free tier | Default model `gemini-2.0-flash`. Preset curriculum is always the offline fallback. Groq/OpenRouter OK if Gemini quota dies. |
| Database | **Supabase** (Postgres) | Free tier | Stay under free row/storage limits |
| Scheduler | **node-cron** (in-process) | Free | Plus manual “fire resurface” for demo |
| Hosting | **Render** or **Railway** | Free web service | Expect cold starts — warm the service before the live demo |
| Source control | **GitHub** | Free | This repo |
| IDE | **Cursor** / VS Code | Already owned / free | |
| Local webhook tunnel | **ngrok** free or **Cloudflare Tunnel** | Free | Only for local testing before deploy |
| Fonts / design assets | Google Fonts (if any web stretch) | Free | |

---

## Explicitly not allowed (for MVP)

- Paid WhatsApp Business Solution Providers
- Paid hosting (Pro plans) unless someone personally covers it *and* the free path still works as backup
- Paid vector databases, Redis Cloud paid, etc.
- Paid analytics / monitoring suites
- Paid SMS fallback
- Buying extra LLM capacity mid-hackathon if a free path exists

---

## Free-tier gotchas (plan for these)

| Risk | What to do |
|------|------------|
| Render/Railway free service sleeps | Hit the health URL 5–10 min before demo |
| Meta test number only talks to allow-listed phones | Add demo + backup phones in Meta dashboard ahead of time |
| Supabase free limits | Tiny schema; don’t store media |
| LLM credit burn | Short prompts; 2 questions max; pre-test demo topics; preset bank is offline backup |
| ngrok free URL changes | Prefer deployed webhook URL for the actual demo |
| Production demo fire blocked | Set `ENABLE_DEMO=true` **and** `DEMO_SECRET` on Render |

---

## Pitch line (optional)

> Built end-to-end on a free stack — Meta WhatsApp test number, Gemini free tier, Supabase, and free hosting — so it’s real to ship, not a paid prototype.
