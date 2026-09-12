# Reca — Marketing website design brief

**Purpose:** Public site *before* sign-in / sign-up. Show the value; gate the account, not the front door.  
**Reference:** Claude.com craft patterns (structure, hierarchy, CTA clarity) — **not** a visual clone.  
**Brand lock:** [product-prd.md](./product-prd.md) palette + [voice.md](./voice.md) + [vision.md](./vision.md)  
**Last updated:** 2026-09-10

---

## Verdict

Steal Claude’s **discipline**. Keep Reca’s **identity**.

| From Claude (transfer) | For Reca (own it) |
|------------------------|-------------------|
| Sparse top nav + clear primary CTA | Nav: Product, How it works, Pricing, FAQ · CTA: **Start studying** |
| One hero job + short subline | Hero sells **memory**, not generic AI |
| Serif display + sans UI | Keep **Gilda Display + Inter** (already on signup) |
| Ghost + solid button hierarchy | Outline secondary / solid primary on Reca cream |
| Pricing toggle (Individual / Team) | Toggle: **Students** / **Schools & tutorials** |
| Check-list plan cards | Free / Plus / School — honest Nigeria pricing later |
| FAQ accordion (serif Q + `+`) | Reca questions in calm tutor voice |
| Mega footer columns | Compact: Product, Study, Company, Legal |
| Auth *after* interest | Marketing → `/signup.html` · Sign in → `/signup.html?mode=signin` |

**Do not copy:** Claude’s near-black marketing shell, orange starburst, “Think fast, build faster,” Google-in-hero as the whole page, or Cowork product theatre. That reads as Anthropic, not a WAEC/JAMB tutor (#9, #21).

**Theme:** Claude-style dark marketing (`#0e0e0e` / warm off-white type / coral accent). User-locked preference over cream marketing.

---

## Job of the site

> Convince an SS3 / JAMB student (or their parent/tutor) that Reca **remembers what they forget** — then send them to Start studying.

Primary CTA: **Start studying** → `signup.html`  
Secondary: **Sign in** → `signup.html?mode=signin`  
Tertiary: **See how WhatsApp comes back** (anchor to How it works)

Anti-pattern avoided: signup wall before any value (#9 / anti-pattern “Sign up to continue” as the whole homepage).

---

## Sitemap (v1)

```text
/                 marketing home (this brief)
/signup.html      auth (exists)
/chat.html        product (after auth / guest)
#product          scroll
#how-it-works     scroll
#pricing          scroll
#faq              scroll
```

Later: `/schools`, `/privacy`, `/terms` as real pages if footer needs them.

---

## Page sections (one job each)

### 1. Nav
- Left: Reca mark + wordmark (serif)  
- Centre/right links: Product · How it works · Pricing · FAQ  
- Actions: Sign in (text) · **Start studying** (solid)

### 2. Hero (first viewport budget)
Only:
1. Brand (Reca) as hero-level signal  
2. One headline  
3. One supporting sentence  
4. CTA group (Start studying + secondary)  
5. One dominant product visual (WhatsApp “Quick recall” moment or Learn→miss→resurface story)

**Headline (locked):** “The topic you missed texts you back.”  
**Eyebrow:** WAEC and JAMB  
**Subline:** Reca explains, quizzes you, then returns on WhatsApp until it sticks. Built for Nigerian exam prep.  

**Copy rules:** No competitor names in hero. No em dashes. No italic filler. Periods over dashes.

**Not in hero:** pricing, stats strip, subject pills, school logos, FAQ.

### 3. Product — the loop
One composition showing: Learn → Revise → Progress → WhatsApp resurface.  
Copy: short; principle #2 = memory is the primary action story.

### 4. How it works (3 steps)
1. Learn a topic on the web  
2. Practise in Revise (incl. past-question style)  
3. Reca messages you first on WhatsApp  

### 5. Pricing
Toggle: **Students** | **Schools & tutorials**  
Claude-style single board with column dividers (not loose “coming soon” cards).

**Students:** Free (₦0) · Plus (₦1,500/mo, early access free) · Pro (from ₦3,500)  
**Schools:** Centre (pilot) · Campus (custom)  

Never show Plus as ₦0 beside Free — price the plan, waive with copy. Use “Everything in Free, plus:” / trust lines under CTAs.

### 6. FAQ (accordion)
Suggested Qs:
- What is Reca?  
- Does Reca work on WhatsApp?  
- Is this official WAEC/JAMB?  
- How is this different from ChatGPT?  
- Do I need to pay?  
- Can my school use Reca?  

Answers: voice.md — calm, honest, no score guarantees.

### 7. Footer
Columns: Product · Study (WAEC/JAMB) · Company · Legal  
Bottom: mark · © · social optional (sparse)

---

## Visual system (marketing)

| Token | Value |
|-------|--------|
| `--bg` | `#FAF7F2` |
| `--ink` | `#14213D` |
| `--muted` | `#5C6578` |
| `--surface` | `#FFFFFF` / soft navy wash for alternate bands |
| `--accent` | `#E8A33D` |
| `--line` | navy @ 12% |
| Display | Gilda Display |
| UI / body | Inter |
| Radius | ~12–16px (match signup) |
| Primary button | Solid ink or solid cream-on-navy band; high contrast |
| Secondary | Ghost / outline |

Motion: 1–2 intentional moments only (hero visual settle, FAQ open) — `#5`, honour reduced motion.

---

## Claude vs Reca hero (side by side)

| Claude | Reca |
|--------|------|
| Dark void | Warm paper |
| Auth box in hero | CTA out to signup (auth page owns Google/email/OTP) |
| Abstract cowork UI | Concrete recall: “Quick recall — chloroplast…” |
| Global productivity | Nigeria exam prep |

---

## Build order

1. `backend/public/index.html` + `marketing.css` — full marketing page  
2. Point brand links on signup to `/`  
3. Wire CTAs to existing signup  
4. Optional: light navy alternate band for Pricing (not full-site dark)  
5. Real prices / school plan only when business locks them  

---

## Success check

- [ ] Stranger understands “comes back when you forget” in 5 seconds  
- [ ] Brand still reads as Reca with logo/name removed from nav only (hero carries Reca)  
- [ ] Start studying is unmistakable (#2)  
- [ ] No signup wall before the story  
- [ ] Does not look like a Claude reskin
