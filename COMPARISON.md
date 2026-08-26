# PRD Comparison: Your Vision vs Partner's Vision

**Date**: August 2026  
**Hackathon**: AI BuildFest 2026 - Track 3 (AI Study Companion)  
**Status**: Ready for team decision

---

## Quick Summary

| Aspect | YOUR PRD | PARTNER'S PRD (Reca) |
|--------|----------|------------|
| **Approach** | Comprehensive, web-based study platform | Focused WhatsApp bot for exam prep |
| **Scope** | Full-featured adaptive learning system | MVP achievable in 48 hours |
| **Target User** | All students (general) | WAEC/JAMB candidates (specific) |
| **Key Innovation** | Proactive learning recommendations | Unprompted spaced-repetition resurface |
| **Platform** | Web app + mobile (roadmap) | WhatsApp (only channel needed) |
| **MVP Complexity** | High (needs many features) | Medium (focused feature set) |
| **Demo Risk** | Medium (need polished UI) | Low (text-based, fully in your control) |
| **Time to Market** | 2 days → basic, not production-ready | 2 days → shippable MVP |

---

## Side-by-Side Feature Comparison

### Your PRD

**Strengths**:
- ✅ **Ambitious scope**: 11 core features documented
- ✅ **Proactive intelligence**: Real differentiator vs ChatGPT
- ✅ **Personalization**: Adaptive difficulty, learning paths, gap detection
- ✅ **Comprehensive**: Handles multiple learning styles (summaries, flashcards, explanations, etc.)
- ✅ **Scalable**: Roadmap through Phase 3 with advanced features
- ✅ **Well-researched**: Privacy, security, learning integrity baked in

**Weaknesses / Hackathon Challenges**:
- ⚠️ **Too much for 48 hours**: 11 features → realistically 3-4 work well, rest are partial/buggy
- ⚠️ **UI/UX dependency**: Success depends on polished frontend (hard to build fast)
- ⚠️ **Tech complexity**: Need React, Node, Python/Claude, PostgreSQL, Redis all working together
- ⚠️ **Demo risk**: Flaky UI, unstyled components, or missing features visible to judges
- ⚠️ **Generic positioning**: "Study companion" could describe 50 other apps; what makes it uniquely yours?
- ⚠️ **Proof point unclear**: How do you demo proactivity in 90 seconds? Shows hard.

**What judges see**:
- Potentially impressive scope, but incomplete/buggy features
- Good product thinking, poor execution for timeframe
- "This is a great Phase 1 roadmap, but where's the working demo?"

---

### Partner's PRD (Reca)

**Strengths**:
- ✅ **Hackathon-focused**: Ruthlessly scoped to 48-hour reality
- ✅ **Clear hero feature**: Unprompted resurface = memory = competitive advantage
- ✅ **Specific target**: WAEC/JAMB students (1.95M + 2.24M yearly) with real, urgent need
- ✅ **Emotionally resonant**: "It remembers what you got wrong and comes back" = easy to pitch
- ✅ **Demo-friendly**: 90-second full loop is clean and provable
- ✅ **Tech simplicity**: Node + WhatsApp + Supabase + Claude = boring stack that works
- ✅ **Free-tier playbook**: Everything runs on sandbox/free tiers (no budget surprises)
- ✅ **Existential proof**: Cron fires during demo = undeniable proof of proactivity (unlike your "planned" resurfacing)
- ✅ **Team alignment**: Specific roles, specific build plan by day

**Weaknesses**:
- ⚠️ **Narrower scope**: Exam prep only (seasonal market)
- ⚠️ **Single channel**: WhatsApp only (no web/app option yet, but roadmap-able)
- ⚠️ **Limited subject coverage**: Demo is Biology + Chemistry only (but generalizes post-hackathon)
- ⚠️ **Requires content curation**: Need 8-10 pre-written WAEC topics/answers (non-trivial, but doable)
- ⚠️ **WhatsApp API risk**: Twilio sandbox can be finicky in live demo (mitigated by manual backup trigger)

**What judges see**:
- Focused, achievable MVP with a clear proof point
- Smart platform choice (students already on WhatsApp)
- Team that understands hackathon reality
- Working system that actually does something competitors don't (persistent memory)

---

## The Core Difference

**Your PRD says**: "Build an intelligent, proactive study platform with adaptive recommendations."  
**Your challenge**: Proving 11 features in 48 hours looks like proving 3 features badly.

**Partner's PRD says**: "Build one focused loop that works perfectly: explain → test → resurface → remember."  
**Partner's challenge**: Curating Biology/Chemistry topics, WhatsApp sandbox stability (both manageable).

---

## Decision Framework

### Choose YOUR PRD if:
- Your team has frontend/design experience and can ship polished UI in 1 day
- You want to position for **general-market appeal** and follow-on funding
- You're comfortable with "impressive scope, incomplete execution" pitch
- You have 3+ full-stack engineers who can divide and conquer across 11 features
- You're okay with judges seeing potential rather than a working demo

### Choose PARTNER'S PRD (Reca) if:
- You want a **100% working, fully-demonstrated feature loop** on Day 2 afternoon
- You want to win on **clear differentiation** (memory = the moat, not just recommendations)
- You want **judges to run the demo themselves** and feel it working
- You're comfortable with narrower TAM now (but bigger post-hackathon)
- Your team prefers **execution over ambition** in a 48-hour window
- You want to ship something that actually works and scales (unlike a polished prototype that breaks under user load)

---

## My Take (Honest Assessment)

**For a hackathon, Reca wins** because:

1. **Proof wins over potential**: A working WhatsApp bot that actually remembers is more impressive than a partially-functional web app with 11 features.

2. **Judges want to see ownership**: "We picked the scope we could own in 48 hours" beats "We tried to build Duolingo in 2 days."

3. **Demo clarity**: One clear loop (explain → test → resurface) is easier to explain and debug live than 11 interconnected features.

4. **Your proactivity insight lives in Reca too**: Reca's resurfacing *is* proactive. It just proves it differently (via scheduler firing) than your "recommendation engine."

5. **Specificity is strength**: Tying to WAEC/JAMB makes the pitch stronger ("4M students a year need this") than generic ("all students").

6. **Technical confidence**: Node + WhatsApp + Supabase is boring and boring is reliable in 48 hours.

**That said**, your PRD is not wasted:
- **Reca can adopt your proactivity framing**: "AI observes performance and decides what's next."
- **Your architecture thinking is solid** for Phase 2/3 post-hackathon.
- **Your features (explanations, gap detection, study plans)** are exactly what Reca needs to scale.

---

## Recommendation: Merge Approach

Rather than choosing one entirely, consider:

1. **Ship Reca for the hackathon** (focused, provable, winnable)
2. **Adopt your proactivity language** for the pitch ("We don't wait for students to ask — we actively monitor performance and decide what they should practice next")
3. **Use your Phase 2/3 roadmap** as the "where this goes" story for judges
4. **Build the core loop first (explain → test → grade)**, then if Day 1 is green and Day 2 morning is smooth, add:
   - Your gap detection summary ("Here's what you're weak at")
   - Your learning path logic ("We recommend tackling X next because you've mastered the prerequisites")
   - Stretch: Your study plan based on weak topics

This way, you ship a **working MVP** (Reca) + **forward vision** (your comprehensive PRD), making the best of both.

---

## Questions for the Team

**Before deciding, ask each other:**

1. **Scope reality check**: Can we build a polished UI for 11 features in 48 hours? (Be honest.)
2. **Demo moment**: Which feels more impressive live — a partially-working web app or a WhatsApp bot that sends an unprompted message proving memory?
3. **Team confidence**: Which stack can we execute flawlessly under pressure? (Web? WhatsApp? Both?)
4. **TAM vs focus**: Do we want broad appeal or do we want to own a specific, urgent need (exam prep)?
5. **Follow-on story**: Which version is easier to explain to investors / a real customer in 2 minutes?

---

## Next Steps

1. **Team sync tonight (if possible)**: 30 min read both PRDs in full.
2. **Vote**: Which approach feels more winnable?
3. **Merge if both**: Use Reca as MVP, adopt your proactivity framing + roadmap.
4. **Lock tech stack**: Free-tier only (Reca's rule is smart).
5. **Assign roles**: Who owns backend? Design/copy? Content curation?
6. **Start coding**: Backend webhook by tonight, UI/prompts by morning.

---

## Appendix: Feature Mapping

**How your features map to Reca**:

| Your Feature | Reca Equivalent | Reca MVP Status |
|--------------|-----------------|-----------------|
| Material upload | WhatsApp topic text | ✅ Built |
| Summarization | "Explain" endpoint | ✅ Built |
| Concept explanation | Same explain endpoint | ✅ Built |
| Practice questions | 2-3 auto-generated | ✅ Built |
| Answer feedback | Grading + correction | ✅ Built |
| Gap identification | Stored incorrect attempts | ✅ Built |
| Study planning | Weak-topic resurface schedule | ✅ Built (hero feature) |
| Progress tracking | "How am I doing?" recap | ✅ Built |
| Proactive recommendations | Unprompted resurfacing | ✅ Built |
| Flashcards | Stretch (roadmap) | ⏳ Post-hackathon |
| Learning paths | Stretch (roadmap) | ⏳ Post-hackathon |

**Result**: Reca ships 9/11 of your core features in 48 hours. Everything else is roadmap.

---

**Final call**: Recommend **Reca MVP + your proactivity vision as roadmap**. Best of both worlds.
