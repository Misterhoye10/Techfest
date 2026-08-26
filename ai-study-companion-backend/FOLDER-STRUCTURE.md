# Backend Folder Structure

This is how your backend should be organized by Day 2:

```
ai-study-companion-backend/
│
├── app.js                    ✅ Main server (already created)
├── package.json              ✅ Dependencies (already created)
├── .env                      📝 Your secrets (create from .env.example)
├── .env.example              ✅ Template (already created)
├── .gitignore                ✅ Protect secrets (already created)
│
├── config/                   📁 Configuration files (Day 2)
│   ├── twilio.js             - Initialize Twilio client
│   ├── supabase.js           - Initialize Supabase client
│   └── claude.js             - Initialize Claude client
│
├── routes/                   📁 API endpoints (Day 2)
│   └── webhook.js            - POST /webhook/whatsapp logic
│
├── services/                 📁 Business logic (Day 2)
│   ├── explanation.js        - Call Claude for explanations + questions
│   ├── grading.js            - Call Claude for grading
│   ├── storage.js            - Store/retrieve from Supabase
│   └── scheduler.js          - node-cron for resurface
│
├── db/                       📁 Database (Day 2)
│   └── schema.sql            - SQL to create tables in Supabase
│
├── utils/                    📁 Helpers (Day 2 if needed)
│   └── logger.js             - Logging utilities
│
└── README.md                 📝 This folder's purpose
```

---

## Day 1 — What Exists Now

✅ `app.js` — Basic Express server with:
- Health check endpoint (`GET /`)
- Webhook stub (`POST /webhook/whatsapp`)
- Test endpoint (`GET /send-test`)

✅ `package.json` — Dependencies installed:
- express
- dotenv
- twilio
- @supabase/supabase-js
- axios
- node-cron

✅ `.env.example` — Template for secrets

✅ `.gitignore` — Protects `.env` from being committed

---

## Day 2 — What to Add

### `config/twilio.js`
```javascript
const twilio = require('twilio');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = twilioClient;
```

### `config/supabase.js`
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabaseClient;
```

### `config/claude.js`
```javascript
const axios = require('axios');

const claudeClient = {
  call: async (prompt) => {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      { 
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    return response.data;
  }
};

module.exports = claudeClient;
```

### `db/schema.sql`
```sql
-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  syllabus_level TEXT
);

-- Attempts table (tracks wrong answers)
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  topic_id UUID REFERENCES topics(id),
  question_text TEXT NOT NULL,
  student_answer TEXT NOT NULL,
  is_correct BOOLEAN,
  attempted_at TIMESTAMP DEFAULT NOW(),
  next_review_date TIMESTAMP,
  review_count INT DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_attempts_student ON attempts(student_id);
CREATE INDEX idx_attempts_next_review ON attempts(next_review_date);
```

### `services/explanation.js`
```javascript
const claudeClient = require('../config/claude.js');

const explainTopic = async (topic) => {
  const prompt = `Explain "${topic}" to an SS2/SS3 Nigerian student in simple language (3-5 sentences). Then generate exactly 2 short-answer practice questions. Return JSON: { explanation: "...", questions: [{id: 1, text: "..."}, {id: 2, text: "..."}] }`;
  
  const response = await claudeClient.call(prompt);
  return JSON.parse(response.content[0].text);
};

module.exports = { explainTopic };
```

---

## Start Here (Day 1)

1. ✅ Backend folder created
2. ✅ Node packages installed
3. ✅ `app.js` basic server created
4. ✅ `.env.example` template created

**Next:**
1. Copy `.env.example` to `.env`
2. Fill in your Twilio, Supabase, Claude credentials
3. Run `npm start`
4. Test with `GET http://localhost:3000`

---

## Test Your Setup

```bash
cd ai-study-companion-backend

# Check Node + npm
node --version
npm --version

# Install again (just to be sure)
npm install

# Start server
npm start

# Should see:
# 🚀 Reca Backend Server
# Status: Running
# Port: 3000
```

Then in browser or terminal:
```bash
curl http://localhost:3000
# Should see: {"status":"✅ Reca backend is running",...}
```

**Success!** ✅
