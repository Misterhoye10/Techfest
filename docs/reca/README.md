# Reca — team docs

**Product thesis (rebuild):** Nigeria-first WAEC/JAMB memory layer — **web** for Learn/Revise/Progress, **WhatsApp** for unprompted resurface (required channel).  
**Craft bar:** global quality, not global launch on day one.

## Marketing site

- Live locally: **http://localhost:3000/** (`backend/public/index.html`)
- First-run: **http://localhost:3000/onboarding.html** ([onboarding.md](./onboarding.md))
- Brief: [marketing-site.md](./marketing-site.md)
- Auth after value: `/signup.html` · Sign in: `/signup.html?mode=signin`

## Start here (rebuild)

1. **[REBUILD-ROADMAP.md](./REBUILD-ROADMAP.md)** — checklist spine  
2. **[discovery.md](./discovery.md)** — problem map + JTBD  
3. **[vision.md](./vision.md)** — dual-surface rule + craft bars  
4. **[voice.md](./voice.md)** — calm tutor  
5. **[ia.md](./ia.md)** · **[states.md](./states.md)** · **[curriculum.md](./curriculum.md)** · **[flows/revise.md](./flows/revise.md)**  
6. **[rebuild-tech.md](./rebuild-tech.md)** · **[pilot.md](./pilot.md)**  

## Locked decisions

| Decision | Choice |
|----------|--------|
| Market wedge | Nigeria first (WAEC + JAMB) |
| Primary surface | Web app (Learn / Revise / Progress) |
| Habit channel | WhatsApp required for full resurface loop — [0002](./decisions/0002-whatsapp-required-habit-channel.md) |
| Past questions | Inside Revise, not a fourth tab |
| Revise session | Default 8 · Keep going +5 · subject or topic — [flows/revise.md](./flows/revise.md) |
| Diagrams | Curated packs only — never LLM-invented labels |

## Hackathon / fest (historical)

Still valid as BuildFest contract; **superseded for rebuild direction** by vision + roadmap.

| File | What it is |
|------|------------|
| [BUILD-REQUIREMENTS.md](./BUILD-REQUIREMENTS.md) | Fest MVP contract |
| [product-prd.md](./product-prd.md) | Fest product PRD |
| [technical-prd.md](./technical-prd.md) | Fest technical PRD |
| [conversation-copy.md](./conversation-copy.md) | WhatsApp copy (keep aligned with voice.md) |
| [demo-script.md](./demo-script.md) | 90s live demo |
| [WHATSAPP-SETUP.md](./WHATSAPP-SETUP.md) | Meta / Twilio setup |
| [WEB-CHAT-SETUP.md](./WEB-CHAT-SETUP.md) | Dev harness |
| [FREE-STACK.md](./FREE-STACK.md) | Fest free tools |

## Code

**[`../../backend/`](../../backend/)** — presets, APIs, WhatsApp webhook. `chat.html` = harness, not the rebuild product UI.

## Archive

Root `PRD.md` is an older generic draft. Archive: [../archive/](../archive/)
