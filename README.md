# Reca - AI Study Companion (Techfest)

Memory layer for Nigerian WAEC & JAMB prep. **Web** for Learn / Revise / Progress; **WhatsApp** for unprompted resurface. Remembers what you got wrong and comes back.

**Rebuild thesis:** Nigeria-first, global craft — see [`docs/reca/REBUILD-ROADMAP.md`](./docs/reca/REBUILD-ROADMAP.md).  
**Marketing site:** http://localhost:3000/ (`backend/public/index.html`)  
**Team docs:** [`docs/reca/`](./docs/reca/)  
**Backend:** [`backend/`](./backend/)

## Start here (rebuild)

1. **[docs/reca/marketing-site.md](./docs/reca/marketing-site.md)** — marketing brief  
2. **[docs/reca/REBUILD-ROADMAP.md](./docs/reca/REBUILD-ROADMAP.md)** — checklist spine  
2. **[docs/reca/discovery.md](./docs/reca/discovery.md)** — problem + JTBD  
3. **[docs/reca/vision.md](./docs/reca/vision.md)** — dual-surface rule  
4. **[docs/reca/ia.md](./docs/reca/ia.md)** · **[states.md](./docs/reca/states.md)** · **[curriculum.md](./docs/reca/curriculum.md)**  
5. **[docs/reca/rebuild-tech.md](./docs/reca/rebuild-tech.md)** · **[pilot.md](./docs/reca/pilot.md)**  
6. **[docs/reca/voice.md](./docs/reca/voice.md)** · [conversation-copy.md](./docs/reca/conversation-copy.md)

## Fest / demo (historical)

Hackathon MVP docs remain under `docs/reca/` ([BUILD-REQUIREMENTS.md](./docs/reca/BUILD-REQUIREMENTS.md), [product-prd.md](./docs/reca/product-prd.md)). Superseded for **rebuild direction** by vision + roadmap.

## Locked decisions (rebuild)

| Decision | Choice |
| :--- | :--- |
| Market | Nigeria first (WAEC + JAMB) |
| Study surface | Web — Learn / Revise / Progress |
| Habit channel | WhatsApp required for resurface |
| Hero feature | Unprompted resurfacing of weak topics |
| Past questions | Inside Revise (WAEC \| JAMB) |

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend / Web UI** | HTML5, CSS3, Vanilla JavaScript, HugeIcons | Web companion (`/chat.html`, Learn, Revise & Progress dashboards) |
| **Messaging Channel** | Meta WhatsApp Cloud API | WhatsApp conversational interface for revision prompts & unprompted resurfacing |
| **Telephony & Auth** | Twilio API | Phone verification, OTP delivery & fallback alerts |
| **Backend & Server** | Node.js (v18+) & Express.js | Core REST API, Meta webhooks, session handling & rate limiting |
| **Scheduler Engine** | `node-cron` | Automated spaced-repetition memory follow-ups & daily briefing cron triggers |
| **Database & Storage** | PostgreSQL / Supabase (`pg`, `@supabase/supabase-js`) | Student accounts, subject mastery tracking & exam attempt history |
| **AI & Vision Model** | Google Gemini API (`gemini-1.5`) | Plain-language concept explanations, 2-question quiz generation, grading & photo OCR |
| **Offline Fail-Safe** | Local WAEC/JAMB Curriculum Bank | Zero-latency fallback bank for live stage demos without API lag |
| **Deployment** | Render / Railway & Vercel | Background cron server, webhook receivers & web client hosting |

## Do not build from

Root [`PRD.md`](./PRD.md) is an older generic draft (also archived under `docs/archive/`).
