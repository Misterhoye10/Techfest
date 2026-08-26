# 🚀 BACKEND DEVELOPER — START HERE

**Status**: Ready to build  
**Timeline**: Day 1 (setup) → Day 2 (code)  
**Your role**: Backend - Node.js + Express + WhatsApp + Claude  

---

## 📋 Your Mission (48 Hours)

Build a WhatsApp bot that:
1. ✅ **Explains** topics in simple language (Claude)
2. ✅ **Quizzes** students with 2 practice questions
3. ✅ **Grades** answers instantly with feedback
4. ✅ **Remembers** what they got wrong (Supabase)
5. ✅ **Resurfaces** weak topics 3 days later (without them asking)
6. ✅ **Recaps** progress on demand ("How am I doing in Biology?")

**Hero feature**: #5 — An unprompted message 3 days later asking the same question. That's what makes this different.

---

## 🎯 The Team Structure

| Role | Owns | You? |
|------|------|------|
| **Backend** (you) | WhatsApp webhook, Claude prompts, database, scheduler, deploy | ✅ YES |
| Frontend/Designer | Chat UI, onboarding message, tone | ❌ Someone else |
| BA/Content | 8-10 WAEC Biology/Chemistry topics, sample answers, testing | ❌ Someone else |

---

## 📥 PART 1: DOWNLOAD THESE (Do This First — 15 Min)

**In this order:**

1. **Node.js** (https://nodejs.org/)
   - Download LTS version
   - Run installer, verify with `node --version`

2. **Twilio Account** (https://www.twilio.com/try-twilio)
   - Sign up (free)
   - Get WhatsApp sandbox credentials

3. **Supabase Account** (https://supabase.com/)
   - Sign up (free, GitHub login)
   - Create database, get connection string

4. **Claude API Key** (https://console.anthropic.com/)
   - Copy API key (use existing team credits)

5. **Render Account** (https://render.com/)
   - Sign up (GitHub login)
   - For deploying Day 2

**Store all credentials in `.env` file (never commit)**

---

## 📚 DOCUMENTS FOR YOU (Read in Order)

| # | Document | What | Time |
|---|----------|------|------|
| 1 | **DOWNLOADS-QUICK-START.md** | What to install + 15 min setup | 15 min |
| 2 | **WHATSAPP-SETUP.md** | How to configure Twilio webhook | 20 min |
| 3 | **BACKEND-DEV-CHECKLIST.md** | Complete build guide with code | 30 min |
| 4 | **technical-prd.md** | Architecture + prompt design | 20 min |
| 5 | **BUILD-REQUIREMENTS.md** | MVP feature checklist | 10 min |

**Read #1 now. Do #2-5 while building.**

---

## 🔧 TECH STACK (Locked — Free Only)

```
WhatsApp (Twilio Sandbox)
    ↓
Node.js + Express (backend)
    ├─ Claude API (explain + grade)
    ├─ Supabase (store attempts)
    ├─ node-cron (scheduler for resurface)
    └─ Render (hosting)
```

**Tools**:
- `express` — HTTP framework
- `dotenv` — Environment variables
- `twilio` — WhatsApp SDK
- `@supabase/supabase-js` — Database client
- `axios` — HTTP client (for Claude)
- `node-cron` — Task scheduling

---

## ✅ YOUR DAY 1 CHECKLIST (Today)

**Must finish by EOD:**

- [ ] All credentials downloaded + `.env` created
- [ ] Node.js installed and verified
- [ ] Express server running locally (`npm start`)
- [ ] Twilio sandbox webhook pointing to your server
- [ ] Send "hello" → get "Reca is online" back ✅
- [ ] Code committed to `AI-Study-Companion-backend` branch
- [ ] Team aligned on Day 2 plan

**Success**: You can send a WhatsApp message and see it logged in your terminal.

---

## 🏗️ DAY 1 BUILD PHASES

### Phase 1: Setup (1 hour)
```bash
# Create backend folder
mkdir ai-study-companion-backend
cd ai-study-companion-backend

# Initialize Node
npm init -y

# Install packages
npm install express dotenv twilio @supabase/supabase-js axios node-cron
```

### Phase 2: Configure (30 min)
- Create `.env` with credentials
- Setup Twilio, Supabase, Claude clients
- Point Twilio webhook to your server

### Phase 3: Echo Server (1 hour)
- Create `app.js` with Express
- POST `/webhook/whatsapp` endpoint
- Log incoming messages
- Send echo reply

### Phase 4: Test (30 min)
- Have team member send message to Twilio
- Verify you see it in logs
- Verify they get reply

---

## 🎨 DAY 2 BUILD PHASES (High Level)

**Morning (3 hours):**
- [ ] Claude explain prompt works
- [ ] Claude question generation works
- [ ] Claude grading logic works
- [ ] Store attempts in Supabase

**Midday (2 hours):**
- [ ] node-cron scheduler wired
- [ ] Resurface message sends (manual trigger first)
- [ ] Recap command works

**Afternoon (2 hours):**
- [ ] Full demo rehearsal
- [ ] Deploy to Render
- [ ] Bug fixes + polish

---

## 📁 Your Backend Folder Structure

```
ai-study-companion-backend/
├── .env                (secrets — never commit)
├── .gitignore          (includes .env)
├── package.json        
├── app.js              (main server)
├── config/
│   ├── twilio.js
│   ├── supabase.js
│   ├── claude.js
├── routes/
│   └── webhook.js
├── services/
│   ├── explanation.js
│   ├── grading.js
│   ├── storage.js
│   └── scheduler.js
└── db/
    └── schema.sql
```

---

## 🔐 Your `.env` Template

```env
# TWILIO
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+1415...

# DATABASE
DATABASE_URL=postgresql://...

# AI
CLAUDE_API_KEY=sk-...

# SERVER
PORT=3000
NODE_ENV=development
```

**⚠️ Never commit this file. Add to `.gitignore`.**

---

## 💬 Workflow You're Building

```
1. Student sends WhatsApp: "explain photosynthesis"
   ↓
2. Twilio webhooks to: POST /webhook/whatsapp
   ↓
3. Your backend receives message
   ↓
4. Claude generates: explanation + 2 questions
   ↓
5. Backend sends via WhatsApp
   ↓
6. Student answers one question
   ↓
7. Claude grades it
   ↓
8. Backend stores in Supabase with next_review_date = today + 3 days
   ↓
9. node-cron fires in 3 days (or manually triggered in demo)
   ↓
10. Backend sends: "Hey, remember this? [same question]"
    ↓
11. Student answers correctly
    ↓
12. Backend marks as cleared
```

**That's the whole product. You're building the engine.**

---

## 🚨 Day 1 Risks & Mitigation

| Risk | Solution |
|------|----------|
| Twilio signup blocked | Use Meta WhatsApp API (fallback) |
| npm install fails | Clear cache: `npm cache clean --force` |
| Node not in PATH | Restart terminal after Node install |
| `.env` committed | Add to `.gitignore` immediately |
| Webhook URL invalid | Must be HTTPS; use ngrok for local testing |
| Can't receive messages | Confirm Twilio sandbox number is correct |

---

## 📞 Communication Checklist

**Before starting:**
- [ ] Team has Twilio join code
- [ ] Everyone joined sandbox (send "join honey-dog")
- [ ] You have Supabase connection string
- [ ] You have Claude API key
- [ ] You have Render account ready

**By EOD Day 1:**
- [ ] Post in team chat: "Backend echo server working ✅"
- [ ] Confirm everyone can send/receive messages
- [ ] Share your GitHub branch name: `AI-Study-Companion-backend`

---

## 🎯 Success Criteria

**Day 1 EOD:**
```
Message in WhatsApp: "hello"
↓
Server logs: "📨 Message received: {from, body, etc}"
↓
Message back: "Reca is online"
✅ SUCCESS
```

**Day 2 EOD:**
```
Full loop:
  "explain photosynthesis" → explanation + 2 Qs
  → "Q1: chloroplast" → "Correct! Q2: glucose and oxygen" → "Correct!"
  → (3 days later, compressed to 1 min for demo)
  → "Remember this? Which part captures sunlight?"
  → "chloroplast" → "Correct ✅"
✅ SUCCESS
```

---

## 🔗 Quick Links

- **Twilio Console**: https://console.twilio.com/
- **Supabase Dashboard**: https://app.supabase.com/
- **Claude API**: https://console.anthropic.com/
- **Render Dashboard**: https://dashboard.render.com/
- **Your repo**: https://github.com/Misterhoye10/Techfest

---

## 📖 Detailed Docs (Reference)

- `DOWNLOADS-QUICK-START.md` — Step-by-step setup
- `WHATSAPP-SETUP.md` — Twilio configuration guide
- `BACKEND-DEV-CHECKLIST.md` — Full build plan with code samples
- `docs/reca/technical-prd.md` — Architecture & prompts
- `docs/reca/BUILD-REQUIREMENTS.md` — Feature checklist
- `docs/reca/FREE-STACK.md` — Approved tools only

---

## 🚀 Ready to Start?

1. **Right now**: Read `DOWNLOADS-QUICK-START.md`
2. **Next 15 min**: Download Node.js, create Twilio/Supabase accounts
3. **Next hour**: Create `.env`, scaffold Express server
4. **Before bed**: Send first test message to Twilio

---

**You got this! Questions? Ask before you start.** 💪

---

*Last updated: August 24, 2026*  
*Backend role: Ready*  
*Timeline: 48 hours*  
*Budget: Free tiers only*
