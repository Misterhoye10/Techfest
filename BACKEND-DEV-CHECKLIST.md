# Backend Developer Setup & Build Checklist
## Reca — AI Study Companion (WhatsApp Edition)

**Role:** Backend Developer  
**Timeline:** Day 1 (setup) → Day 2 (features)  
**Language:** Node.js + Express  
**Platform:** WhatsApp (Twilio Sandbox → Render/Railway)  

---

## PART 1: WHAT YOU'RE DOWNLOADING (Today — Setup Phase)

### 1.1 Essential Downloads & Accounts

#### **A. Twilio Account (Free)**
- **What**: WhatsApp messaging gateway
- **Where**: https://www.twilio.com/try-twilio
- **Cost**: Free (trial credits)
- **Sign up**: Phone verification required
- **What you'll get**: Account SID, Auth Token, WhatsApp sandbox number
- **Store**: In `.env` file (never commit to GitHub)

**Credentials to save**:
```env
TWILIO_ACCOUNT_SID=AC... (keep secret)
TWILIO_AUTH_TOKEN=... (keep secret)
TWILIO_WHATSAPP_FROM=whatsapp:+1415...
```

#### **B. Node.js & npm (Free)**
- **What**: JavaScript runtime + package manager
- **Where**: https://nodejs.org/
- **Version**: 18+ LTS recommended
- **Install**: Standard installer (Windows/Mac/Linux)
- **Verify**: Open terminal, run `node --version` and `npm --version`

#### **C. Git (Free)**
- **What**: Version control
- **Where**: https://git-scm.com/download/win
- **Already have**: Yes (you cloned the repo)

#### **D. Cursor or VS Code (Free)**
- **What**: Code editor
- **Already have**: Yes (mentioned in team notes)

#### **E. Render or Railway Account (Free)**
- **What**: Hosting for your backend (replaces laptop for demo day)
- **Where**: 
  - Render: https://render.com/
  - Railway: https://railway.app/
- **Cost**: Free tier (cold starts are OK for demo)
- **Sign up**: GitHub login is easiest
- **Do this**: Create account today, link GitHub

#### **F. Supabase Account (Free)**
- **What**: PostgreSQL database for storing student attempts
- **Where**: https://supabase.com/
- **Cost**: Free tier (more than enough for 48-hour demo)
- **Sign up**: GitHub login
- **What you'll get**: Database credentials, connection string
- **Store**: In `.env` as `DATABASE_URL=...`

**Connection string format**:
```env
DATABASE_URL=postgresql://user:password@host:5432/db?schema=public
```

#### **G. Claude API (Existing Credits)**
- **What**: AI model for explanations, questions, grading
- **Where**: https://console.anthropic.com/
- **Cost**: Use existing team credits (or free tier if new account)
- **What you'll get**: API key
- **Store**: In `.env` as `CLAUDE_API_KEY=...`

#### **H. ngrok or Cloudflare Tunnel (Free) — Optional for local testing**
- **What**: Exposes localhost to the internet (so Twilio can webhook to your laptop)
- **Where**: 
  - ngrok: https://ngrok.com/
  - Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- **Cost**: Free
- **When**: Only if you want to test webhooks locally before deploying
- **Skip on Day 1** if you're deploying straight to Render/Railway

---

### 1.2 Summary: Download Checklist

**Do this in this order:**

- [ ] **1. Create Twilio account** → Get sandbox number + credentials
- [ ] **2. Create Supabase account** → Get database connection string
- [ ] **3. Create Render/Railway account** → Link GitHub
- [ ] **4. Get Claude API key** → Add to secrets
- [ ] **5. Install Node.js** → Verify with `node --version`
- [ ] **6. (Optional) Install ngrok** → For local webhook testing

**Store all secrets in `.env` file** (see template below)

---

## PART 2: YOUR `.env` FILE (Keep Private, Never Commit)

Create a file named `.env` in the repo root:

```env
# ========== TWILIO ==========
TWILIO_ACCOUNT_SID=AC... (your Twilio Account SID)
TWILIO_AUTH_TOKEN=... (your Twilio Auth Token)
TWILIO_WHATSAPP_FROM=whatsapp:+1415... (Twilio sandbox WhatsApp number)

# ========== DATABASE ==========
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres?schema=public
# (Get this from Supabase → Settings → Database)

# ========== AI ==========
CLAUDE_API_KEY=sk-... (your Claude API key)

# ========== SERVER ==========
PORT=3000
NODE_ENV=development
ENVIRONMENT=dev

# ========== OPTIONAL (Local Testing) ==========
NGROK_URL=https://xxxx-xxx-xxx.ngrok.io
# (Only if using ngrok for local development)
```

**Important:**
- Add `.env` to `.gitignore` (so it's never committed)
- Share credentials with team securely (1Password, team vault, etc.)
- **Never paste credentials in GitHub, Slack, or public chat**

---

## PART 3: BACKEND PROJECT STRUCTURE (What You'll Build)

After setting up, here's the folder structure for your backend:

```
Techfest/
├── ai-study-companion-backend/     (or whatever you name the backend folder)
│   ├── .env                         (secrets — not committed)
│   ├── .gitignore                   (includes .env)
│   ├── package.json                 (dependencies)
│   ├── app.js                       (main Express app)
│   ├── config/
│   │   ├── twilio.js                (Twilio client setup)
│   │   ├── supabase.js              (Supabase client setup)
│   │   └── claude.js                (Claude API setup)
│   ├── routes/
│   │   └── webhook.js               (POST /webhook/whatsapp)
│   ├── services/
│   │   ├── explanation.js           (Claude: explain + generate questions)
│   │   ├── grading.js               (Claude: grade answers)
│   │   ├── storage.js               (Supabase: store attempts)
│   │   └── scheduler.js             (node-cron: resurface logic)
│   ├── controllers/
│   │   └── whatsappController.js    (process incoming messages)
│   ├── db/
│   │   └── schema.sql               (Supabase schema creation)
│   └── package-lock.json
```

---

## PART 4: NPM PACKAGES YOU'LL INSTALL

```bash
cd ai-study-companion-backend
npm init -y
npm install express dotenv twilio @supabase/supabase-js axios node-cron
```

**What each does:**

| Package | Purpose | Why |
|---------|---------|-----|
| `express` | Web framework | Handle HTTP webhooks from Twilio |
| `dotenv` | Load `.env` file | Keep secrets safe |
| `twilio` | Twilio SDK | Send/receive WhatsApp messages |
| `@supabase/supabase-js` | Supabase client | Store student attempts in DB |
| `axios` | HTTP client | Call Claude API |
| `node-cron` | Task scheduler | Run cron jobs for resurface (Day 2) |

---

## PART 5: STEP-BY-STEP SETUP (Do This Now)

### Phase 1: Accounts & Credentials (30 min)

**Step 1: Twilio**
1. Go to https://www.twilio.com/try-twilio
2. Sign up, verify phone
3. Go to Messaging → Try it out → Send a WhatsApp message
4. Copy your **Account SID**, **Auth Token**, and **WhatsApp sandbox number**
5. Post the join instructions in team chat (e.g., "join honey-dog")
6. Everyone on the team joins from their phone
7. Verify you can send/receive messages in Twilio console

**Step 2: Supabase**
1. Go to https://supabase.com/
2. Sign up (use GitHub login)
3. Create new project
4. Go to Settings → Database → Connection string → URI
5. Copy the full connection string and paste into `.env` as `DATABASE_URL=...`

**Step 3: Claude**
1. Go to https://console.anthropic.com/
2. Copy your API key
3. Paste into `.env` as `CLAUDE_API_KEY=...`

**Step 4: Render/Railway**
1. Go to https://render.com/ (or Railway)
2. Sign up (use GitHub)
3. Create new Web Service (will link to repo in Day 1 afternoon)

### Phase 2: Local Setup (30 min)

**Step 5: Clone repo & setup Node**
```bash
cd Techfest
git checkout AI-Study-Companion-backend
# or create the branch if it doesn't exist
git checkout -b AI-Study-Companion-backend

# Create backend folder
mkdir ai-study-companion-backend
cd ai-study-companion-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express dotenv twilio @supabase/supabase-js axios node-cron
```

**Step 6: Create `.env` file**
```bash
# Copy template from PART 2 above into .env
# Add your real credentials
```

**Step 7: Create `app.js` (basic server)**
```javascript
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.send('Reca backend is running');
});

// Webhook for Twilio WhatsApp
app.post('/webhook/whatsapp', (req, res) => {
  console.log('Received message:', req.body);
  res.send('OK');
  // More logic tomorrow
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 8: Test locally**
```bash
npm start
# Output: "Server running on port 3000"
# Leave running
```

**Step 9: Expose with ngrok (if testing locally)**
```bash
# In a new terminal
ngrok http 3000
# Copy the HTTPS URL (e.g., https://xxxx-xxx.ngrok.io)
```

**Step 10: Point Twilio webhook**
1. Go to Twilio Sandbox settings
2. When a message comes in → `https://xxxx-xxx.ngrok.io/webhook/whatsapp` (or your Render URL)
3. Save

**Step 11: Send a test message**
1. From your phone (already joined sandbox), send: `test message`
2. Check your terminal — you should see the message logged

---

## PART 6: TODAY'S BUILD GOALS (Day 1)

By end of today, these should work:

- [ ] Twilio account + sandbox setup
- [ ] All team members joined sandbox (can send/receive)
- [ ] Supabase database connected
- [ ] Claude API key saved
- [ ] Node + Express running
- [ ] Webhook receives Twilio messages
- [ ] Echo reply works (send message → get "Reca is online" back)
- [ ] Server deployable to Render/Railway

**Success**: Send `hello` to Reca → get `Reca is online` back

---

## PART 7: DAY 2 BUILD GOALS (Sketch)

**Morning:**
- [ ] Explain + question generation via Claude
- [ ] Grading logic
- [ ] Store attempts in Supabase

**Midday:**
- [ ] Resurface cron job (or manual trigger)
- [ ] Recap command

**Afternoon:**
- [ ] Full demo rehearsal
- [ ] Bug fixes

---

## PART 8: COMMON GOTCHAS

| Issue | Solution |
|-------|----------|
| "npm command not found" | Install Node.js (includes npm) |
| Twilio says "invalid webhook" | URL must be HTTPS; use ngrok or deployed URL |
| Can't receive messages in sandbox | Make sure your phone has joined the sandbox first |
| Database connection fails | Check `DATABASE_URL` format (should include schema=public) |
| Claude API rate limited | Use short prompts, cache demo topics |
| Free hosting sleeps | Hit health endpoint 5 min before demo |
| `.env` accidentally committed | Add `.env` to `.gitignore` immediately |

---

## PART 9: TEAM SYNC CHECKLIST

**Before Day 1 ends, sync with team:**

- [ ] Everyone has `.env` saved locally (never in repo)
- [ ] Twilio sandbox is live and everyone joined
- [ ] Supabase project created and connection tested
- [ ] Backend code scaffold (app.js + package.json) committed to `AI-Study-Companion-backend` branch
- [ ] Webhook URL set in Twilio
- [ ] One echo message sent and received successfully
- [ ] Render/Railway account linked and ready to deploy

---

## PART 10: QUICK REFERENCE — Commands You'll Use

```bash
# Install dependencies
npm install

# Start local server
npm start

# Restart Node (if code changes)
# Ctrl+C, then npm start

# Deploy to Render (via GitHub — covered later)
git push origin AI-Study-Companion-backend

# View logs locally
# Check console output when messages arrive

# View logs on Render/Railway
# Check dashboard after deployment
```

---

## PART 11: NEXT IMMEDIATE ACTIONS

**Right now (next 15 min):**
1. Create Twilio account
2. Post join instructions to team chat
3. Everyone joins sandbox

**In next hour:**
1. Create Supabase + get connection string
2. Get Claude API key
3. Install Node.js

**By end of today:**
1. Backend scaffold running
2. Echo message working
3. Code committed to `AI-Study-Companion-backend` branch

---

**Questions? Ask before starting — this is your build plan for 48 hours.** 🚀

---

## Quick Links (Bookmark These)

- Twilio Console: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- Supabase Dashboard: https://app.supabase.com/
- Claude Console: https://console.anthropic.com/
- Render Dashboard: https://dashboard.render.com/
- WhatsApp Setup Guide: `./WHATSAPP-SETUP.md` (in this repo)
- Technical PRD: `./docs/reca/technical-prd.md` (in this repo)
