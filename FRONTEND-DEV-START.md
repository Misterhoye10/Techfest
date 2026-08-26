# 🎨 FRONTEND DEVELOPER — START HERE

**Status**: Ready to build  
**Timeline**: Day 1 (setup) → Day 2 (UI)  
**Your role**: Frontend - Chat interface, conversation flow, simple web view  

---

## 🎯 Your Mission (48 Hours)

Build a WhatsApp chat interface that shows:
1. ✅ **Conversation thread** — messages flowing naturally
2. ✅ **Message display** — explanations, questions, feedback
3. ✅ **Input field** — student typing answers
4. ✅ **(Optional Day 2)** Simple web dashboard — show all topics + progress

**Key**: The WhatsApp chat itself is the UI. You're designing the conversation flow and tone, not building a separate app.

---

## 📋 What You Need to Download

### **1. Node.js (JavaScript Runtime)**
- **Download**: https://nodejs.org/
- **Click**: LTS version (20.x)
- **Install**: Just run installer
- **Verify**: Open terminal, type `node --version`
- **Time**: 5 minutes

---

### **2. Figma Account (Design Tool — Optional)**
- **Go here**: https://www.figma.com/
- **What to do**: Sign up free (email or Google)
- **Why**: Design conversation wireframes before building
- **Time**: 2 minutes

---

### **3. Git (Already Installed)**
- **Check**: Open terminal, type `git --version`
- **Already have**: Yes (you cloned the repo)

---

### **4. Cursor or VS Code (Already Have)**
- **Code editor**: Use what you already have

---

### **5. Google Fonts (Free)**
- **Why**: Download fonts for chat UI (Sora, Inter)
- **Where**: https://fonts.google.com/
- **Do**: Just bookmark it, download when building UI

---

## 📥 DOWNLOAD CHECKLIST (Frontend)

| # | What | Link | Time |
|---|------|------|------|
| 1 | Node.js | https://nodejs.org/ | 5 min |
| 2 | Figma (optional) | https://figma.com/ | 2 min |
| 3 | Google Fonts (bookmark) | https://fonts.google.com/ | 1 min |

**Total: 8 minutes**

---

## 🎨 YOUR DAY 1 CHECKLIST

**Must finish by EOD:**

- [ ] Node.js installed and verified
- [ ] Figma account created (optional but recommended)
- [ ] Understand conversation flow (see below)
- [ ] Understand tone/style guidelines (see below)
- [ ] Coordinate with backend: confirm webhook URL
- [ ] Commit any design mockups to `AI-Study-Companion-frontend` branch

---

## 💬 Conversation Flow (What You're Designing)

**This is what the user sees on WhatsApp:**

```
Day 1, 4:12 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: explain photosynthesis

Reca: Photosynthesis is how plants make their own food using 
sunlight, water, and carbon dioxide...

Quick check — 
Q1: Which part of the plant cell captures sunlight? 
Q2: What are the two main products of photosynthesis?

User: Q1 mitochondria, Q2 glucose and oxygen

Reca: Q2 is correct ✅
Q1 — not quite, mitochondria is for respiration. 
The correct answer is chloroplast. 
I'll check this one again in a few days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 4, 9:00 AM (unprompted message)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reca: Quick recall — which part of the plant cell 
captures sunlight for photosynthesis?

User: chloroplast

Reca: Correct ✅ You've got this one now. 
Want another Biology topic, or should we look at Chemistry?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: how am I doing in Biology?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reca: You've covered 6 topics. 
Strong: Cell structure, Respiration, Genetics. 
Cleared: Photosynthesis ✅. 
Needs work: Ecology, Reproduction. 
Want to tackle Ecology next?
```

**Your job**: Make this conversation feel natural, encouraging, and easy to follow.

---

## 🎨 Tone & Style Guide

**Reca should sound like:**
- Encouraging, never scolding
- Simple language, no jargon
- Short sentences
- Celebrate small wins (✅)
- Frame mistakes as learning ("not quite, here's the correct one")

**Colors** (if building web dashboard):
- Primary text: Deep navy (#14213D)
- Background: Warm off-white (#FAF7F2)
- Correct answer: Amber gold (#E8A33D)
- Success: Muted green (#3C8859)
- Gentle correction: Soft terracotta (#C1553B)

**Typography**:
- Headings: Sora (Google Font)
- Body text: Inter (Google Font)

---

## 📁 What Lives on Frontend Branch

**What to commit to `AI-Study-Companion-frontend` branch:**

- [ ] Figma wireframes (or design mockups)
- [ ] Conversation flow documentation
- [ ] Optional: HTML mockup of web dashboard (Day 2 stretch)
- [ ] Tone guidelines + sample messages
- [ ] Any CSS/styling decisions

**Do NOT commit:**
- Backend code
- `.env` files
- Database schemas
- API keys

---

## 🚀 Your Workflow

**Day 1:**
1. Install Node.js
2. Create Figma mockups of conversation flow
3. Document tone & messaging guidelines
4. Commit to `AI-Study-Companion-frontend` branch
5. Sync with backend on webhook response format

**Day 2:**
1. Build HTML/React mockup of chat interface (if time allows)
2. Test with backend (see messages flowing)
3. Polish UI
4. Optional: Build simple web dashboard to show topics + progress

---

## 🔗 Quick Links

- **Figma**: https://figma.com/
- **Google Fonts**: https://fonts.google.com/
- **Your branch**: `AI-Study-Companion-frontend`
- **Tone guide**: See above ☝️
- **Backend webhook URL**: Will sync with backend dev

---

## 💭 Key Decisions for You

**Before Day 1 ends, decide:**

1. **Will you build a web dashboard?** (optional, Day 2 stretch)
2. **What's the first message Reca sends to new students?**
3. **How do we show progress?** (emoji, text, stats?)
4. **How do we handle errors gracefully?**

---

## 📚 Reference Docs (Same Folder)

- `docs/reca/product-prd.md` — Full product vision
- `docs/reca/technical-prd.md` — Backend architecture (for understanding)
- `docs/reca/BUILD-REQUIREMENTS.md` — Feature checklist

---

## ✅ That's It for Frontend

**Summary:**
- Download Node.js (5 min)
- Create Figma account (2 min)
- Design conversation flow
- Document tone & style
- Commit to `AI-Study-Companion-frontend` branch
- Sync with backend on message format

**You don't need to upload to GitHub yet** — just have designs ready. Backend will test with hardcoded responses first.

---

*Last updated: August 24, 2026*  
*Frontend role: Ready*  
*Timeline: 48 hours*
