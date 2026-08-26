# Quick Start: What to Download RIGHT NOW (15 Minutes)

## TL;DR — Download These (Free)

| # | What | Where | Why | Time |
|---|------|-------|-----|------|
| 1 | **Node.js** | https://nodejs.org/ | JavaScript runtime (backend) | 5 min install |
| 2 | **Twilio Account** | https://www.twilio.com/try-twilio | WhatsApp messaging | 5 min signup |
| 3 | **Supabase Account** | https://supabase.com/ | Database | 3 min signup |
| 4 | **Claude API Key** | https://console.anthropic.com/ | AI (use existing credits) | 1 min copy |
| 5 | **Render Account** | https://render.com/ | Hosting (for Day 2 deploy) | 2 min signup |

**Total time: 16 minutes. Do this NOW before anything else.**

---

## Step-by-Step (Copy/Paste)

### 1️⃣ Install Node.js (5 min)
```
Open: https://nodejs.org/
Click: Download LTS (20.x or later)
Run the installer
Verify in terminal:
  node --version
  npm --version
```

### 2️⃣ Create Twilio Account (5 min)
```
Open: https://www.twilio.com/try-twilio
Click: Sign up free
Enter phone number (for SMS verification)
Verify code from SMS

SAVE these credentials:
  - Account SID (starts with AC...)
  - Auth Token (long string)
  - WhatsApp sandbox number (e.g., +1415...)
```

### 3️⃣ Create Supabase Account (3 min)
```
Open: https://supabase.com/
Click: Sign up
Use GitHub login (easiest)
Create new project
Go: Settings → Database → Connection string
SAVE the "URI" string (looks like: postgresql://...)
```

### 4️⃣ Get Claude API Key (1 min)
```
Open: https://console.anthropic.com/
Go: API Keys
Copy your key (starts with sk-...)
SAVE it
```

### 5️⃣ Create Render Account (2 min)
```
Open: https://render.com/
Click: Get Started
Use GitHub login
(Don't deploy yet — just create account)
```

---

## Create Your `.env` File

In the backend folder, create a file called `.env` with:

```env
TWILIO_ACCOUNT_SID=AC... (from Twilio)
TWILIO_AUTH_TOKEN=... (from Twilio)
TWILIO_WHATSAPP_FROM=whatsapp:+1415... (from Twilio)
DATABASE_URL=postgresql://... (from Supabase)
CLAUDE_API_KEY=sk-... (from Claude)
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANT: Never commit this file to GitHub. Add to `.gitignore`.**

---

## Install Node Packages

```bash
cd ai-study-companion-backend
npm init -y
npm install express dotenv twilio @supabase/supabase-js axios node-cron
```

---

## Verify Everything Works

Create a file called `app.js`:

```javascript
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('✅ Reca backend is ready');
});

app.post('/webhook/whatsapp', (req, res) => {
  console.log('📨 Message received:', req.body);
  res.send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

Run it:
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
```

---

## Next: Tell Your Team

1. **Post in team chat:**
   - Twilio sandbox join code (from Twilio console)
   - Supabase connection string (for database setup)
   - Claude API key (keep private!)

2. **Everyone join Twilio sandbox:**
   ```
   Send to WhatsApp: join honey-dog
   (replace "honey-dog" with your actual code)
   ```

3. **You're ready for Day 1 coding** ✅

---

## Common Questions

**Q: Do I need to pay for anything?**  
A: No. Everything is free tier. Keep `.env` safe so you don't leak paid credentials.

**Q: What if Twilio signup is blocked?**  
A: Use Meta WhatsApp Cloud API (fallback) — see `WHATSAPP-SETUP.md`

**Q: Can I use different Node version?**  
A: Yes, 16+ works. 20 LTS is recommended.

**Q: Do I deploy to Render today?**  
A: No. Deploy on Day 2 afternoon. Today is local testing.

---

## You're Now Ready!

✅ Node installed  
✅ Twilio account created  
✅ Supabase database set up  
✅ Claude API key saved  
✅ `.env` configured  
✅ Express server running  

**Next step:** Read `BACKEND-DEV-CHECKLIST.md` for detailed build plan.

---

**Time to start? NOW. You got this! 🚀**
