(() => {
  const FALLBACK_TOPICS = [
    { id: "genetics-basics", label: "Genetics basics", subject: "Biology", send: "explain genetics basics", icon: "bubble-chat-double" },
    { id: "osmosis", label: "Osmosis", subject: "Biology", send: "explain osmosis", icon: "droplet" },
    { id: "aerobic-respiration", label: "Respiration", subject: "Biology", send: "explain aerobic respiration", icon: "lungs" },
    { id: "acids-bases", label: "Acids & bases", subject: "Chemistry", send: "explain acids and bases", icon: "chemistry-01" },
  ];

  const app = document.getElementById("app");
  const thread = document.getElementById("thread");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const statusLine = document.getElementById("statusLine");
  const chatStatus = document.getElementById("chatStatus");
  const sideTopics = document.getElementById("sideTopics");
  const sideTopicsLabel = document.getElementById("sideTopicsLabel");
  const mainTitle = document.getElementById("mainTitle");
  const mainEyebrow = document.getElementById("mainEyebrow");
  const mainDock = document.getElementById("mainDock");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  const learnWelcome = document.getElementById("learnWelcome");
  const reviseWelcome = document.getElementById("reviseWelcome");
  const learnTopics = document.getElementById("learnTopics");
  const reviseTopics = document.getElementById("reviseTopics");
  const learnSubjects = document.getElementById("learnSubjects");
  const reviseSubjects = document.getElementById("reviseSubjects");

  const quizPanel = document.getElementById("quizPanel");
  const quizTopic = document.getElementById("quizTopic");
  const quizCount = document.getElementById("quizCount");
  const quizQuestion = document.getElementById("quizQuestion");
  const quizOptions = document.getElementById("quizOptions");
  const quizFeedback = document.getElementById("quizFeedback");
  const quizSummary = document.getElementById("quizSummary");
  const quizBar = document.getElementById("quizBar");
  const quizMemory = document.getElementById("quizMemory");
  const quizEndBtn = document.getElementById("quizEndBtn");
  const quizDiagram = document.getElementById("quizDiagram");
  const quizDiagramImg = document.getElementById("quizDiagramImg");
  const quizDiagramCap = document.getElementById("quizDiagramCap");
  const attachBtn = document.getElementById("attachBtn");
  const imageUpload = document.getElementById("imageUpload");
  const composerPreview = document.getElementById("composerPreview");
  const composerPreviewImg = document.getElementById("composerPreviewImg");
  const composerPreviewLabel = document.getElementById("composerPreviewLabel");
  const composerPreviewClear = document.getElementById("composerPreviewClear");
  const progressDue = document.getElementById("progressDue");
  const progressDueList = document.getElementById("progressDueList");
  const progressDueLead = document.getElementById("progressDueLead");
  const learnRecommend = document.getElementById("learnRecommend");
  const reviseRecommend = document.getElementById("reviseRecommend");
  const profileBtn = document.getElementById("profileBtn");
  const profilePopover = document.getElementById("profilePopover");
  const profileName = document.getElementById("profileName");
  const profileExamDate = document.getElementById("profileExamDate");
  const profileWrap = document.getElementById("profileWrap");

  const progressPanel = document.getElementById("progressPanel");
  const progressEmpty = document.getElementById("progressEmpty");
  const progressBody = document.getElementById("progressBody");
  const progressStats = document.getElementById("progressStats");
  const progressFilters = document.getElementById("progressFilters");
  const progressNeeds = document.getElementById("progressNeeds");
  const progressStrong = document.getElementById("progressStrong");
  const progressLoading = document.getElementById("progressLoading");
  const progressError = document.getElementById("progressError");
  const progressEmptyCta = document.getElementById("progressEmptyCta");
  const waForm = document.getElementById("waForm");
  const waPhone = document.getElementById("waPhone");
  const waStatus = document.getElementById("waStatus");
  const waHint = document.getElementById("waHint");
  const userDisplayName = document.getElementById("userDisplayName");

  let TOPICS = FALLBACK_TOPICS.slice();
  let learnQuery = "";
  let reviseQuery = "";
  const seen = new Set();
  let phone = localStorage.getItem("reca_phone") || "";
  let lastEventId = "";
  let busy = false;
  let feature = "learn";
  let learnFilter = "All";
  let reviseFilter = "All";
  let progressFilter = "All";
  let thinkingEl = null;
  let thinkingTimer = null;
  let thinkingSecondaryTimer = null;
  let pendingUpload = null;
  let quizLocked = false;
  let recaConfig = {
    whatsappNumber: "15556777893",
  };

  function continueOnWhatsAppUrl(topicLabel) {
    const biz = String(recaConfig.whatsappNumber || "15556777893").replace(/\D/g, "");
    const topic = String(topicLabel || "genetics-basics")
      .trim()
      .replace(/^explain\s+/i, "");
    return `https://wa.me/${biz}?text=${encodeURIComponent(`explain ${topic}`)}`;
  }

  async function loadConfig() {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data.whatsappNumber) recaConfig.whatsappNumber = data.whatsappNumber;
    } catch (_) {
      /* defaults */
    }
  }

  async function sendWhatsAppAlert(message) {
    const p = (localStorage.getItem("reca_phone") || phone || "").replace(/\D/g, "");
    if (!p || !message) return;
    try {
      await fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p, message }),
      });
    } catch (_) {
      /* best-effort — Render may be cold */
    }
  }

  function makeContinueWaButton(topicLabel) {
    const a = document.createElement("a");
    a.className = "learn-cta__btn learn-cta__btn--wa";
    a.href = continueOnWhatsAppUrl(topicLabel);
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Continue on WhatsApp";
    return a;
  }

  let lastLearnTopic = null;
  let activeQuizTopic = null;
  let activeNudge = null;
  const UNREAD_KEY = "reca_unread_nudges";

  function loadUnreadNudges() {
    try {
      const raw = JSON.parse(localStorage.getItem(UNREAD_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (_) {
      return [];
    }
  }

  function saveUnreadNudges(list) {
    localStorage.setItem(UNREAD_KEY, JSON.stringify(list.slice(-20)));
  }

  function unreadCount() {
    return loadUnreadNudges().length;
  }

  function syncProgressBadge(extraDue = 0) {
    const badges = [
      document.getElementById("progressBadge"),
      document.getElementById("mobileProgressBadge"),
    ].filter(Boolean);
    const n = Math.max(unreadCount(), extraDue);
    badges.forEach((badge) => {
      if (n > 0) {
        badge.hidden = false;
        badge.textContent = n > 9 ? "9+" : String(n);
      } else {
        badge.hidden = true;
        badge.textContent = "0";
      }
    });
  }

  function clearUnreadNudges() {
    saveUnreadNudges([]);
    syncProgressBadge();
  }

  function topicFromNudge(nudge) {
    if (!nudge) return null;
    if (nudge.topicId) {
      return (
        TOPICS.find((t) => t.id === nudge.topicId) || {
          id: nudge.topicId,
          label: nudge.topicLabel || capitalizeWords(nudge.topicId),
          subject: "Biology",
        }
      );
    }
    if (nudge.topicLabel) {
      const label = nudge.topicLabel.toLowerCase();
      return TOPICS.find((t) => t.label.toLowerCase() === label) || null;
    }
    return null;
  }

  function capitalizeWords(id) {
    return String(id || "")
      .split("-")
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ");
  }

  function questionFromNudge(nudge) {
    if (!nudge) return "";
    if (nudge.questionText) return String(nudge.questionText).trim();
    const raw = String(nudge.text || "").trim();
    return raw.replace(/^quick recall\s*[—\-–:]\s*/i, "").trim() || raw;
  }

  function showNudge(nudge) {
    const bar = document.getElementById("nudgeBar");
    const titleEl = document.getElementById("nudgeTitle");
    const textEl = document.getElementById("nudgeText");
    const eyeEl = document.getElementById("nudgeEyebrow");
    const metaEl = document.getElementById("nudgeMeta");
    const cta = document.getElementById("nudgeCta");
    if (!bar || !nudge) return;

    activeNudge = nudge;
    const isBriefing = nudge.type === "briefing";
    if (eyeEl) {
      eyeEl.textContent = isBriefing ? "Daily briefing" : "Time to recall";
    }
    if (titleEl) {
      titleEl.textContent = isBriefing
        ? nudge.title || "Today’s focus"
        : nudge.topicLabel
          ? `Recall · ${nudge.topicLabel}`
          : nudge.title || "Quick recall";
    }
    if (textEl) {
      textEl.textContent = isBriefing
        ? String(nudge.text || "").split("\n").filter(Boolean)[0] || nudge.text
        : questionFromNudge(nudge);
    }
    if (metaEl) {
      metaEl.textContent = isBriefing
        ? "Reca picked today’s focus from your weak spots."
        : "You missed this earlier. Answer now to clear it from memory.";
    }
    if (cta) cta.textContent = isBriefing ? "Start focus" : "Answer now";
    bar.hidden = false;
    announce(isBriefing ? "Daily briefing from Reca" : "Quick recall from Reca");
  }

  function hideNudge() {
    const bar = document.getElementById("nudgeBar");
    if (bar) bar.hidden = true;
    activeNudge = null;
  }

  function openRecallModal(nudge) {
    const panel = document.getElementById("recallPanel");
    const qEl = document.getElementById("recallQuestion");
    const titleEl = document.getElementById("recallTitle");
    const inputEl = document.getElementById("recallInput");
    const feedback = document.getElementById("recallFeedback");
    const doneBtn = document.getElementById("recallDone");
    const form = document.getElementById("recallForm");
    if (!panel || !nudge) return;

    activeNudge = nudge;
    if (titleEl) {
      titleEl.textContent = nudge.topicLabel
        ? `Recall · ${nudge.topicLabel}`
        : "Answer this";
    }
    if (qEl) qEl.textContent = questionFromNudge(nudge);
    if (feedback) {
      feedback.hidden = true;
      feedback.textContent = "";
      feedback.className = "recall__feedback";
    }
    if (doneBtn) doneBtn.hidden = true;
    if (form) form.hidden = false;
    if (inputEl) {
      inputEl.value = "";
      inputEl.disabled = false;
    }
    panel.hidden = false;
    document.body.style.overflow = "hidden";
    inputEl?.focus();
  }

  function closeRecallModal() {
    const panel = document.getElementById("recallPanel");
    if (panel) panel.hidden = true;
    document.body.style.overflow = "";
  }

  async function submitRecallAnswer(answer) {
    const feedback = document.getElementById("recallFeedback");
    const doneBtn = document.getElementById("recallDone");
    const form = document.getElementById("recallForm");
    const inputEl = document.getElementById("recallInput");
    const submitBtn = document.getElementById("recallSubmit");
    if (!answer || !phone) return;

    if (submitBtn) submitBtn.disabled = true;
    if (inputEl) inputEl.disabled = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, body: answer, mode: "chat" }),
      });
      const data = await res.json();
      const reply = (data.replies && data.replies[0]) || "Checked.";
      const ok = /correct|cleared/i.test(reply);
      if (feedback) {
        feedback.hidden = false;
        feedback.className =
          "recall__feedback " + (ok ? "is-correct" : "is-wrong");
        feedback.textContent = reply.split("\n")[0];
      }
      if (form) form.hidden = true;
      if (doneBtn) doneBtn.hidden = false;
      if (activeNudge?.id) {
        saveUnreadNudges(loadUnreadNudges().filter((n) => n.id !== activeNudge.id));
        syncProgressBadge();
      }
      announce(ok ? "Recall cleared" : "Recall checked");
    } catch (_) {
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "recall__feedback is-wrong";
        feedback.textContent = "Couldn’t check that. Try again.";
      }
      if (inputEl) inputEl.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function enqueueNudge(msg) {
    const nudge = {
      id: msg.id,
      text: msg.text,
      type: msg.type || "bot",
      topicId: msg.topicId || null,
      topicLabel: msg.topicLabel || null,
      title: msg.title || null,
      questionText: msg.questionText || null,
      at: msg.at || Date.now(),
    };
    const list = loadUnreadNudges().filter((n) => n.id !== nudge.id);
    list.push(nudge);
    saveUnreadNudges(list);
    syncProgressBadge();
    showNudge(nudge);
  }

  function markValue() {
    localStorage.setItem("reca_has_value", "1");
  }

  function syncDisplayName() {
    const name = (localStorage.getItem("reca_display_name") || "").trim();
    if (userDisplayName) userDisplayName.textContent = name || "Student";
  }

  function recommendedTopic() {
    return (
      TOPICS.find((t) => t.id === "genetics-basics") ||
      TOPICS.find((t) => /genetics/i.test(t.label)) ||
      TOPICS[0]
    );
  }

  function syncRecommend() {
    const rec = recommendedTopic();
    if (!rec) return;
    const reviseTitle = document.getElementById("reviseRecommendTitle");
    if (reviseTitle) reviseTitle.textContent = rec.label;
    const reviseMeta = reviseRecommend?.querySelector(".recommend__meta");
    if (reviseMeta) reviseMeta.textContent = `${rec.subject || "Biology"} · AI will quiz you`;
  }

  /** Inline SVGs — no icon font (CDN glyphs were rendering as CJK tofu). */
  const ICON_PATHS = {
    "mortarboard-01":
      '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "book-open-01":
      '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "book-01":
      '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    "quiz-03":
      '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/>',
    "analytics-01":
      '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    "bookmark-01":
      '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    student:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "checkmark-circle-02":
      '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "alert-circle":
      '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    "menu-01": '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
    "search-01": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sent: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    "ai-chat-02":
      '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>',
    "rotate-clockwise":
      '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    "arrow-down-01": '<path d="m6 9 6 6 6-6"/>',
    "leaf-01":
      '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    "chemistry-01":
      '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    flash: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    "calculator-01":
      '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M16 14v4"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    "sun-03":
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    "moon-01":
      '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    computer:
      '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    "settings-01":
      '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    "cancel-01": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "notification-01":
      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    lungs:
      '<path d="M6.081 22c-1.605 0-2.888-1.37-2.708-2.966l1.735-15.3A2.5 2.5 0 0 1 7.59 1.5h.82a2.5 2.5 0 0 1 2.482 2.234l.75 6.516"/><path d="M17.919 22c1.605 0 2.888-1.37 2.708-2.966l-1.735-15.3A2.5 2.5 0 0 0 16.41 1.5h-.82a2.5 2.5 0 0 0-2.482 2.234l-.75 6.516"/><path d="M12 10v12"/>',
    "image-add-01":
      '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M19 3v4"/><path d="M21 5h-4"/>',
  };

  function recaAvatarEl() {
    const img = document.createElement("img");
    img.className = "turn__avatar-mark";
    img.src = "/assets/reca-mark.svg";
    img.alt = "";
    img.width = 34;
    img.height = 34;
    img.setAttribute("aria-hidden", "true");
    return img;
  }

  function iconEl(name, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.75");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("ico");
    if (className) {
      className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((c) => svg.classList.add(c));
    }
    svg.innerHTML = ICON_PATHS[name] || ICON_PATHS["book-01"];
    return svg;
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((el) => {
      if (el.tagName === "svg") return;
      const name = el.getAttribute("data-icon");
      const extra = [...el.classList].join(" ");
      const svg = iconEl(name, extra);
      if (el.classList.contains("brand__mark") || el.classList.contains("side__avatar") || el.classList.contains("profile-pop__avatar")) {
        el.replaceChildren(svg);
        el.removeAttribute("data-icon");
        return;
      }
      el.replaceWith(svg);
    });
  }

  hydrateIcons();

  const THEME_KEY = "reca_theme";

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function themePref() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "system";
  }

  function resolveTheme(pref) {
    if (pref === "light" || pref === "dark") return pref;
    return systemTheme();
  }

  function syncAppearButtons(pref) {
    document.querySelectorAll(".appear__btn").forEach((btn) => {
      const on = btn.dataset.appear === pref;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });
    const cap = document.getElementById("profileAppearCap");
    const appearHint = document.getElementById("settingsAppearHint");
    const resolved = resolveTheme(pref);
    const label =
      pref === "system"
        ? `System · ${resolved === "dark" ? "Dark" : "Light"}`
        : pref === "dark"
          ? "Dark"
          : "Light";
    if (cap) cap.textContent = label;
    if (appearHint) {
      appearHint.textContent =
        pref === "system"
          ? `Follows your device · currently ${resolved}.`
          : `Using ${resolved} mode.`;
    }
  }

  function applyThemePref(pref, persist) {
    const nextPref = pref === "light" || pref === "dark" ? pref : "system";
    const resolved = resolveTheme(nextPref);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-pref", nextPref);
    if (persist) {
      if (nextPref === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, nextPref);
    }
    syncAppearButtons(nextPref);
  }

  applyThemePref(themePref(), false);

  document.querySelectorAll(".appear__btn").forEach((btn) => {
    btn.addEventListener("click", () => applyThemePref(btn.dataset.appear, true));
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (themePref() !== "system") return;
    applyThemePref("system", false);
  });

  const settingsModal = document.getElementById("settingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const settingsClose = document.getElementById("settingsClose");
  const settingsTitle = document.getElementById("settingsTitle");
  const profileScrim = document.getElementById("profileScrim");
  const profilePopEmail = document.getElementById("profilePopEmail");
  const profileWaMeta = document.getElementById("profileWaMeta");

  const SETTINGS_TITLES = {
    general: "Profile",
    appearance: "Appearance",
    exam: "Exam",
    whatsapp: "WhatsApp",
    about: "About Reca",
    how: "How Reca works",
    help: "Get help",
    privacy: "Privacy",
    team: "Team & BuildFest",
  };

  function syncProfileMenuMeta() {
    const name = (localStorage.getItem("reca_display_name") || "").trim();
    const phoneSaved = (localStorage.getItem("reca_phone") || "").trim();
    if (profilePopEmail) {
      profilePopEmail.textContent = name || phoneSaved || "Student";
    }
    if (profileWaMeta) {
      profileWaMeta.textContent = /^\+\d{10,15}$/.test(phoneSaved) ? "Linked" : "Link";
    }
  }

  function flashSave(el, text, isError) {
    if (!el) return;
    el.hidden = false;
    el.classList.toggle("is-error", Boolean(isError));
    el.textContent = text;
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => {
      el.hidden = true;
    }, 2400);
  }

  function isGuestSession() {
    if (localStorage.getItem("reca_signed_in") === "1") return false;
    return (
      localStorage.getItem("reca_guest") === "1" ||
      !/^\+\d{10,15}$/.test((localStorage.getItem("reca_phone") || "").trim())
    );
  }

  function daysFromExamValue(value) {
    if (!value) return null;
    return Math.round(
      (new Date(`${value}T12:00:00`) - new Date(new Date().toDateString())) / 86400000
    );
  }

  function syncSettingsAccountUi() {
    const phoneSaved = (localStorage.getItem("reca_phone") || "").trim();
    const signedIn = localStorage.getItem("reca_signed_in") === "1";
    const linked = /^\+\d{10,15}$/.test(phoneSaved);
    const guest = isGuestSession();

    const badge = document.getElementById("settingsAccountBadge");
    const label = document.getElementById("settingsAccountLabel");
    const emailEl = document.getElementById("profileEmail");
    const authAction = document.getElementById("settingsAuthAction");
    const authLink = document.getElementById("profileAuthLink");
    const authLabel = document.getElementById("profileAuthLabel");

    if (badge) badge.classList.toggle("is-linked", linked && !guest);
    if (label) {
      label.textContent = linked && !guest ? "WhatsApp linked" : guest ? "Guest session" : "Signed in";
    }
    if (emailEl) {
      if (linked) {
        emailEl.hidden = false;
        emailEl.textContent = phoneSaved;
      } else {
        emailEl.hidden = true;
      }
    }

    const signOut = () => {
      localStorage.removeItem("reca_signed_in");
      localStorage.removeItem("reca_email");
      localStorage.setItem("reca_guest", "1");
      location.assign("/signup.html?mode=signin&force=1");
    };

    if (authAction) {
      if (signedIn || (linked && !guest)) {
        authAction.textContent = "Sign out";
        authAction.href = "#";
        authAction.onclick = (e) => {
          e.preventDefault();
          signOut();
        };
      } else {
        authAction.textContent = "Link WhatsApp";
        authAction.href = "/signup.html";
        authAction.onclick = null;
      }
    }

    if (authLink && authLabel) {
      if (signedIn || (linked && !guest)) {
        authLabel.textContent = "Sign out";
        authLink.href = "#";
      } else {
        authLabel.textContent = "Link WhatsApp";
        authLink.href = "/signup.html";
      }
    }

    const examEmpty = document.getElementById("settingsExamEmpty");
    const examClear = document.getElementById("settingsExamClear");
    const examVal = profileExamDate?.value || localStorage.getItem("reca_exam_date") || "";
    if (examEmpty) examEmpty.hidden = Boolean(examVal);
    if (examClear) examClear.hidden = !examVal;
    syncExamHint(daysFromExamValue(examVal));

    const waLinked = document.getElementById("settingsWaLinked");
    const waEmpty = document.getElementById("settingsWaEmpty");
    const waLinkedValue = document.getElementById("settingsWaLinkedValue");
    if (waLinked) waLinked.hidden = !linked;
    if (waEmpty) waEmpty.hidden = linked;
    if (waLinkedValue) waLinkedValue.textContent = linked ? phoneSaved : "—";
    if (waPhone && linked && !waPhone.value) waPhone.value = phoneSaved;

    const link = document.getElementById("waContinueLink");
    if (link) {
      link.href = continueOnWhatsAppUrl(
        lastLearnTopic?.label || activeQuizTopic?.label || "genetics-basics"
      );
      link.hidden = false;
    }

    syncProfileMenuMeta();
  }

  function showSettingsSection(section) {
    const key = SETTINGS_TITLES[section] ? section : "general";
    document.querySelectorAll("[data-settings-nav]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-settings-nav") === key);
    });
    document.querySelectorAll("[data-settings-pane]").forEach((pane) => {
      pane.hidden = pane.getAttribute("data-settings-pane") !== key;
    });
    if (settingsTitle) settingsTitle.textContent = SETTINGS_TITLES[key];
    app.dataset.settingsSection = key;
    syncSettingsAccountUi();

    if (key === "general") profileName?.focus();
    if (key === "exam") profileExamDate?.focus();
    if (key === "whatsapp") {
      refreshWhatsAppStatus();
      waPhone?.focus();
    }
  }

  function closeLearnMoreFlyout() {
    clearTimeout(learnMoreCloseTimer);
    const flyout = document.getElementById("learnMoreFlyout");
    const btn = document.getElementById("menuLearnMore");
    if (flyout) flyout.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function openLearnMoreFlyout() {
    clearTimeout(learnMoreCloseTimer);
    const flyout = document.getElementById("learnMoreFlyout");
    const btn = document.getElementById("menuLearnMore");
    if (flyout) flyout.hidden = false;
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function scheduleCloseLearnMoreFlyout() {
    clearTimeout(learnMoreCloseTimer);
    learnMoreCloseTimer = setTimeout(closeLearnMoreFlyout, 180);
  }

  function openSettingsModal(section) {
    closeLearnMoreFlyout();
    closeProfile();
    if (!settingsModal) return;
    settingsModal.hidden = false;
    document.body.style.overflow = "hidden";
    syncAppearButtons(themePref());
    syncSettingsAccountUi();
    showSettingsSection(section || "general");
    const dialog = document.getElementById("settingsDialog");
    dialog?.focus?.();
  }

  function closeSettingsModal() {
    if (!settingsModal) return;
    settingsModal.hidden = true;
    document.body.style.overflow = "";
  }

  function openProfile() {
    if (!profilePopover || !profileBtn) return;
    if (settingsModal && !settingsModal.hidden) closeSettingsModal();
    profilePopover.hidden = false;
    profileBtn.setAttribute("aria-expanded", "true");
    profileBtn.setAttribute("aria-label", "Close account menu");
    app.classList.add("is-profile-open");
    if (profileScrim) profileScrim.hidden = false;
    syncAppearButtons(themePref());
    syncProfileMenuMeta();
    closeLearnMoreFlyout();
  }

  function closeProfile() {
    if (!profilePopover || !profileBtn) return;
    closeLearnMoreFlyout();
    profilePopover.hidden = true;
    profileBtn.setAttribute("aria-expanded", "false");
    profileBtn.setAttribute("aria-label", "Open account menu");
    app.classList.remove("is-profile-open");
    if (profileScrim) profileScrim.hidden = true;
  }

  function toggleProfile() {
    if (!profilePopover) return;
    if (profilePopover.hidden) openProfile();
    else closeProfile();
  }

  if (profileBtn) profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleProfile();
  });
  if (profileScrim) profileScrim.addEventListener("click", closeProfile);

  let learnMoreCloseTimer = 0;
  const menuLearnMore = document.getElementById("menuLearnMore");
  const learnMoreFlyout = document.getElementById("learnMoreFlyout");
  const learnMoreWrap = document.querySelector(".profile-flyout-wrap");
  if (menuLearnMore) {
    menuLearnMore.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menuLearnMore.getAttribute("aria-expanded") === "true";
      if (open) closeLearnMoreFlyout();
      else openLearnMoreFlyout();
    });
  }
  if (learnMoreWrap) {
    learnMoreWrap.addEventListener("mouseenter", () => openLearnMoreFlyout());
    learnMoreWrap.addEventListener("mouseleave", () => scheduleCloseLearnMoreFlyout());
  }

  document.querySelectorAll("[data-open-settings]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openSettingsModal(el.getAttribute("data-open-settings"));
    });
  });
  document.querySelectorAll("[data-settings-nav]").forEach((btn) => {
    btn.addEventListener("click", () => showSettingsSection(btn.getAttribute("data-settings-nav")));
  });
  if (settingsBackdrop) settingsBackdrop.addEventListener("click", closeSettingsModal);
  if (settingsClose) settingsClose.addEventListener("click", closeSettingsModal);
  document.addEventListener("click", (e) => {
    if (!profileWrap || profilePopover?.hidden) return;
    if (!profileWrap.contains(e.target) && e.target !== profileScrim) closeProfile();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (learnMoreFlyout && !learnMoreFlyout.hidden) {
      closeLearnMoreFlyout();
      return;
    }
    if (settingsModal && !settingsModal.hidden) {
      closeSettingsModal();
      return;
    }
    closeProfile();
  });

  if (profileName) {
    const savedName = (localStorage.getItem("reca_display_name") || "").trim();
    profileName.value = savedName;
    syncDisplayName();
    const saveName = () => {
      const v = profileName.value.trim().slice(0, 40);
      if (v) localStorage.setItem("reca_display_name", v);
      else localStorage.removeItem("reca_display_name");
      syncDisplayName();
      syncSettingsAccountUi();
      const saveEl = document.getElementById("settingsProfileSave");
      flashSave(saveEl, v ? "Name saved" : "Name cleared");
      if (phone) {
        fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, name: v }),
        }).catch(() => flashSave(saveEl, "Couldn’t sync name", true));
      }
    };
    profileName.addEventListener("change", saveName);
    profileName.addEventListener("blur", saveName);
  } else {
    syncDisplayName();
  }

  function syncExamHint(days) {
    const hint = document.getElementById("profileExamHint");
    const stat = document.getElementById("settingsExamStat");
    const label =
      typeof days === "number"
        ? days >= 0
          ? `${days}d left`
          : "Exam open"
        : "Set date";
    if (hint) hint.textContent = label;
    if (stat) {
      stat.textContent =
        typeof days === "number"
          ? days >= 0
            ? `${days} day${days === 1 ? "" : "s"} left`
            : "Exam window is open"
          : "Set your date";
    }
  }

  if (profileExamDate) {
    const savedExam = localStorage.getItem("reca_exam_date") || "";
    if (savedExam) profileExamDate.value = savedExam;
    const saveExam = (v) => {
      const saveEl = document.getElementById("settingsExamSave");
      if (v) localStorage.setItem("reca_exam_date", v);
      else localStorage.removeItem("reca_exam_date");
      syncExamHint(daysFromExamValue(v));
      syncSettingsAccountUi();
      flashSave(saveEl, v ? "Exam date saved" : "Exam date cleared");
      if (!phone) return;
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, examDate: v || "" }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.daysToExam != null) syncExamHint(d.daysToExam);
        })
        .catch(() => flashSave(saveEl, "Couldn’t sync exam date", true));
    };
    profileExamDate.addEventListener("change", () => saveExam(profileExamDate.value));
    document.getElementById("settingsExamClear")?.addEventListener("click", () => {
      profileExamDate.value = "";
      saveExam("");
    });
  }

  (function syncProfileAccount() {
    const authLink = document.getElementById("profileAuthLink");
    syncSettingsAccountUi();
    if (authLink) {
      authLink.addEventListener("click", (e) => {
        const signedIn = localStorage.getItem("reca_signed_in") === "1";
        const phoneSaved = (localStorage.getItem("reca_phone") || "").trim();
        const linked = /^\+\d{10,15}$/.test(phoneSaved);
        if (signedIn || (linked && !isGuestSession())) {
          e.preventDefault();
          localStorage.removeItem("reca_signed_in");
          localStorage.removeItem("reca_email");
          localStorage.setItem("reca_guest", "1");
          location.assign("/signup.html?mode=signin&force=1");
        }
      });
    }
  })();

  function showLinkBanner() {
    const banner = document.getElementById("linkBanner");
    if (!banner) return;
    if (!isGuestSession()) return;
    if (localStorage.getItem("reca_link_prompt_dismissed") === "1") return;
    banner.hidden = false;
  }

  function hideLinkBanner(dismiss) {
    const banner = document.getElementById("linkBanner");
    if (banner) banner.hidden = true;
    if (dismiss) localStorage.setItem("reca_link_prompt_dismissed", "1");
  }

  document.getElementById("linkBannerDismiss")?.addEventListener("click", () => {
    hideLinkBanner(true);
  });

  function setStatus(text, online = true) {
    statusLine.replaceChildren();
    statusLine.append(
      iconEl(online ? "checkmark-circle-02" : "alert-circle", "status-ico"),
      document.createTextNode(` ${text}`)
    );
    statusLine.querySelector(".status-ico").style.color = online ? "#5ec27a" : "#fb735b";
  }

  function announce(text) {
    chatStatus.textContent = text;
  }

  function timeLabel(ts = Date.now()) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function closeMobileNav() {
    app.classList.remove("is-nav-open");
    if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMobileNav() {
    const open = !app.classList.contains("is-nav-open");
    app.classList.toggle("is-nav-open", open);
    if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", String(open));
  }

  function scrollThread() {
    thread.scrollTop = thread.scrollHeight;
  }

  function syncSendEnabled() {
    if (!sendBtn || !input) return;
    const hasText = Boolean(input.value.trim());
    const canSend = hasText && !busy;
    sendBtn.disabled = !canSend;
    sendBtn.setAttribute("aria-disabled", canSend ? "false" : "true");
  }

  function setComposerBusy(isBusy) {
    busy = isBusy;
    app.dataset.busy = isBusy ? "true" : "false";
    input.disabled = isBusy;
    sendBtn.setAttribute("aria-busy", isBusy ? "true" : "false");
    sendBtn.replaceChildren(iconEl(isBusy ? "rotate-clockwise" : "sent", "composer__send-ico"));
    syncSendEnabled();
  }

  function setNavActive(name) {
    document.querySelectorAll(".nav-item, .mobile-tab").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.nav === name);
    });
  }

  function showOnly(...els) {
    [learnWelcome, reviseWelcome, quizPanel, progressPanel, thread].forEach((el) => {
      if (!el) return;
      const on = els.includes(el);
      el.hidden = !on;
      el.style.display = on ? "" : "none";
      if (on) {
        el.setAttribute("data-panel", "true");
        // Retrigger panel entrance
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
      } else {
        el.removeAttribute("data-panel");
      }
    });
  }

  function generatingLabel(kind, topicHint) {
    const topic = String(topicHint || "").trim();
    switch (kind) {
      case "explain":
        return topic ? `Reca is explaining ${topic}…` : "Reca is explaining…";
      case "answer":
        return "Reca is answering…";
      case "photo":
        return "Reading your photo…";
      case "quiz":
        return "Building 2 quick questions…";
      default:
        return "Reca’s AI is thinking…";
    }
  }

  function showThinking(labelOrOpts) {
    const opts =
      typeof labelOrOpts === "string" || labelOrOpts == null
        ? { label: labelOrOpts }
        : labelOrOpts;
    const label = opts.label || generatingLabel(opts.kind, opts.topic);
    hideThinking(true);
    thinkingTimer = setTimeout(() => {
      thinkingEl = document.createElement("div");
      thinkingEl.className = "turn turn--in turn--thinking";
      const avatar = document.createElement("div");
      avatar.className = "turn__avatar";
      avatar.appendChild(recaAvatarEl());
      const bubble = document.createElement("div");
      bubble.className = "thinking";
      const pulse = document.createElement("span");
      pulse.className = "thinking__pulse";
      pulse.setAttribute("aria-hidden", "true");
      const copy = document.createElement("div");
      copy.className = "thinking__copy";
      const lab = document.createElement("span");
      lab.className = "thinking__label";
      lab.textContent = label;
      const secondary = document.createElement("span");
      secondary.className = "thinking__secondary";
      secondary.textContent = "Still working — exam Wi‑Fi is fine";
      copy.append(lab, secondary);
      bubble.append(pulse, copy);
      thinkingEl.append(avatar, bubble);
      thread.appendChild(thinkingEl);
      scrollThread();
      thinkingSecondaryTimer = setTimeout(() => {
        secondary.classList.add("is-visible");
      }, 1200);
    }, 80);
  }

  function hideThinking(immediate) {
    if (thinkingTimer) clearTimeout(thinkingTimer);
    thinkingTimer = null;
    if (thinkingSecondaryTimer) clearTimeout(thinkingSecondaryTimer);
    thinkingSecondaryTimer = null;
    if (!thinkingEl) return;
    const el = thinkingEl;
    thinkingEl = null;
    if (immediate) {
      el.remove();
      return;
    }
    el.classList.add("is-exiting");
    setTimeout(() => el.remove(), 140);
  }

  function setFeature(name) {
    feature = name;
    app.dataset.feature = name;
    setNavActive(name);
    closeMobileNav();
    quizLocked = false;

    if (name === "learn") {
      sideTopicsLabel.replaceChildren(
        iconEl("bookmark-01"),
        document.createTextNode(" Quick topics")
      );
      mainEyebrow.textContent = "Learn";
      mainTitle.textContent = "Ask anything";
      app.dataset.mode = "welcome";
      showOnly(learnWelcome);
      mainDock.hidden = false;
      input.placeholder = "Ask anything — typos OK, Reca will correct…";
      renderSideTopics("learn");
      input.focus();
      syncSendEnabled();
      return;
    }

    if (name === "revise") {
      sideTopicsLabel.replaceChildren(
        iconEl("quiz-03"),
        document.createTextNode(" Topics to quiz")
      );
      mainEyebrow.textContent = "Revise";
      mainTitle.textContent = "Quiz what you learned";
      app.dataset.mode = "revise-hub";
      showOnly(reviseWelcome);
      mainDock.hidden = true;
      input.placeholder = "Answer Reca’s AI — type or pick above…";
      renderSideTopics("revise");
      return;
    }

    if (name === "progress") {
      sideTopicsLabel.replaceChildren(
        iconEl("analytics-01"),
        document.createTextNode(" AI memory")
      );
      clearUnreadNudges();
      hideNudge();
      mainEyebrow.textContent = "Progress · AI memory";
      mainTitle.textContent = "What Reca remembers";
      app.dataset.mode = "progress";
      showOnly(progressPanel);
      mainDock.hidden = true;
      renderSideTopics("progress");
      loadProgress();
      return;
    }
  }

  function formatBody(text) {
    const body = document.createElement("div");
    body.className = "msg__body";
    String(text)
      .split(/\n{2,}/)
      .forEach((block) => {
        const trimmed = block.trim();
        if (!trimmed) return;
        const p = document.createElement("p");
        p.textContent = trimmed;
        body.appendChild(p);
      });
    if (!body.childNodes.length) {
      const p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
    }
    return body;
  }

  /** Structure Learn replies: spelling note → explanation → quick-check callout */
  function formatTeachBody(text) {
    const raw = String(text || "").trim();
    const wrap = document.createElement("div");
    wrap.className = "msg__teach";

    let rest = raw;
    const spellingMatch = rest.match(/^Spelling check:\s*([\s\S]+?)(?:\n\n|$)/i);
    if (spellingMatch) {
      const note = document.createElement("p");
      note.className = "msg__spell";
      note.textContent = spellingMatch[1].replace(/\s*;\s*/g, " · ").replace(/\.\s*$/, "");
      wrap.appendChild(note);
      rest = rest.slice(spellingMatch[0].length).trim();
    }

    const checkSplit = rest.split(/\n\n(?=Quick check\b)/i);
    const explain = (checkSplit[0] || "").trim();
    const check = (checkSplit[1] || "").trim();

    if (explain) {
      const body = formatBody(explain);
      wrap.appendChild(body);
    }

    if (check) {
      const callout = document.createElement("div");
      callout.className = "msg__check";
      const label = document.createElement("span");
      label.className = "msg__check-label";
      label.textContent = "Quick check";
      const bodyText = check.replace(/^Quick check\s*[—–-]?\s*/i, "").trim();
      const p = document.createElement("p");
      p.className = "msg__check-text";
      p.textContent = bodyText;
      callout.append(label, p);
      wrap.appendChild(callout);
    }

    if (!wrap.childNodes.length) wrap.appendChild(formatBody(raw));
    return wrap;
  }

  function normalizeReply(reply) {
    if (reply && typeof reply === "object") {
      return {
        text: String(reply.text != null ? reply.text : ""),
        image: reply.image || null,
      };
    }
    return { text: String(reply || ""), image: null };
  }

  function appendMedia(el, image) {
    if (!image?.src || !el) return;
    const figure = document.createElement("figure");
    figure.className = "msg__media";
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt || image.caption || "Teaching diagram";
    img.loading = "lazy";
    figure.appendChild(img);
    if (image.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = image.caption;
      figure.appendChild(cap);
    }
    el.appendChild(figure);
  }

  function addBubble(raw, role = "in", meta = {}) {
    if (meta.id && seen.has(meta.id)) return;
    if (meta.id) seen.add(meta.id);

    const { text, image } = normalizeReply(raw);
    const turn = document.createElement("div");
    turn.className = role === "out" ? "turn turn--out" : "turn turn--in";

    if (role === "in") {
      const avatar = document.createElement("div");
      avatar.className = "turn__avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.appendChild(recaAvatarEl());
      turn.appendChild(avatar);
    }

    const stack = document.createElement("div");
    stack.className = "turn__stack";
    const el = document.createElement("div");
    const isTeach = role === "in" && (feature === "learn" || meta.teach);
    el.className =
      role === "out" ? "msg msg--out" : isTeach ? "msg msg--in msg--teach" : "msg msg--in";

    if (role === "in") {
      if (isTeach) {
        const badge = document.createElement("div");
        badge.className = "msg__badge";
        badge.append(iconEl("book-open-01"), document.createTextNode(" Explanation"));
        el.appendChild(badge);
        el.appendChild(formatTeachBody(text));
      } else {
        el.appendChild(formatBody(text));
      }
      appendMedia(el, image || meta.image);
    } else {
      const body = document.createElement("div");
      body.className = "msg__body";
      const p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
      el.appendChild(body);
      appendMedia(el, image || meta.image);
    }

    const metaRow = document.createElement("div");
    metaRow.className = "msg__meta";
    const t = document.createElement("span");
    t.className = "msg__time";
    t.textContent = timeLabel(meta.at);
    metaRow.appendChild(t);
    el.appendChild(metaRow);
    stack.appendChild(el);
    turn.appendChild(stack);
    thread.appendChild(turn);
    scrollThread();
  }

  function addErrorBubble(message, onRetry) {
    const turn = document.createElement("div");
    turn.className = "turn turn--error";
    const el = document.createElement("div");
    el.className = "msg msg--error";
    const body = document.createElement("div");
    body.className = "msg__body";
    const p = document.createElement("p");
    p.textContent = message;
    body.appendChild(p);
    el.appendChild(body);
    if (typeof onRetry === "function") {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "msg__retry";
      retry.textContent = "Try again";
      retry.addEventListener("click", () => {
        turn.remove();
        onRetry();
      });
      el.appendChild(retry);
    }
    turn.appendChild(el);
    thread.appendChild(turn);
    scrollThread();
  }

  function filtered(filter, query) {
    let list = filter === "All" ? TOPICS.slice() : TOPICS.filter((t) => t.subject === filter);
    const q = String(query || "").trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.aliases || []).some((a) => String(a).toLowerCase().includes(q))
      );
    }
    return list;
  }

  function renderSubjectBar(container, filter, onPick) {
    if (!container) return;
    container.innerHTML = "";
    ["All", ...new Set(TOPICS.map((t) => t.subject))].forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "revise-subject" + (filter === name ? " is-active" : "");
      btn.textContent = name === "All" ? "All topics" : name;
      btn.addEventListener("click", () => onPick(name));
      container.appendChild(btn);
    });
  }

  function renderTopicCards(container, filter, query, onStart, verb) {
    if (!container) return;
    container.innerHTML = "";
    const list = filtered(filter, query);
    if (!list.length) {
      const empty = document.createElement("p");
      empty.className = "empty__desc";
      empty.textContent = "No topics match that search.";
      empty.style.gridColumn = "1 / -1";
      container.appendChild(empty);
      return;
    }
    list.slice(0, 24).forEach((item) => {
      const starter = document.createElement("button");
      starter.type = "button";
      starter.className = "empty-topic";
      starter.setAttribute("aria-label", `${verb} ${item.label}`);

      const icoWrap = document.createElement("span");
      icoWrap.className = "empty-topic__ico";
      icoWrap.appendChild(iconEl(item.icon || "book-01"));

      const label = document.createElement("span");
      label.className = "empty-topic__label";
      label.textContent = item.label;

      const meta = document.createElement("span");
      meta.className = "empty-topic__meta";
      meta.textContent =
        verb === "Revise" ? `${item.subject} · AI quiz` : `${item.subject} · AI explain`;

      starter.append(icoWrap, label, meta);
      starter.addEventListener("click", () => onStart(item));
      container.appendChild(starter);
    });
  }

  const EXPAND_KEY = "reca.side.expanded";

  function loadExpandedSubjects() {
    try {
      return JSON.parse(localStorage.getItem(EXPAND_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveExpandedSubjects(map) {
    localStorage.setItem(EXPAND_KEY, JSON.stringify(map));
  }

  function topicsForSidebar(mode) {
    const query = mode === "revise" ? reviseQuery : learnQuery;
    const filter = mode === "revise" ? reviseFilter : learnFilter;
    if (mode === "progress") {
      let list = (window.__progressWeak || []).map((t) => {
        const match = TOPICS.find((x) => x.id === t.topicId);
        return (
          match || {
            id: t.topicId,
            label: t.label,
            subject: t.subject,
            icon: "quiz-03",
          }
        );
      });
      if (!list.length) {
        // Show a sample across every subject so Progress empty still teaches the syllabus map
        list = balancedTopicSample(filtered("All", ""), 2);
      }
      return list;
    }
    const list = filtered(filter, query);
    // No search/filter: sample per subject so English/Agric/languages aren't buried under Biology
    if (!query && filter === "All") return balancedTopicSample(list, 8);
    return list;
  }

  /** Keep every subject visible — take up to `perSubject` topics from each. */
  function balancedTopicSample(list, perSubject) {
    const by = {};
    list.forEach((t) => {
      (by[t.subject] ||= []).push(t);
    });
    const out = [];
    Object.keys(by)
      .sort()
      .forEach((subject) => {
        out.push(...by[subject].slice(0, perSubject));
      });
    return out;
  }

  function renderSideTopics(mode) {
    sideTopics.innerHTML = "";
    const list = topicsForSidebar(mode);
    const query = mode === "revise" ? reviseQuery : learnQuery;
    const searching = Boolean(String(query || "").trim());

    const bySubject = {};
    list.forEach((t) => {
      (bySubject[t.subject] ||= []).push(t);
    });
    const expanded = loadExpandedSubjects();
    Object.keys(bySubject)
      .sort()
      .forEach((subject) => {
        const group = document.createElement("div");
        group.className = "side-group";
        // Default closed. Search opens matching subjects so results aren't hidden.
        const isCollapsed = searching ? false : !expanded[subject];
        if (isCollapsed) group.classList.add("is-collapsed");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "side-group__toggle";
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
        toggle.innerHTML = `<span class="side-group__label">${subject}</span>`;
        const chev = iconEl("arrow-down-01", "side-group__chev");
        toggle.appendChild(chev);
        toggle.addEventListener("click", () => {
          const willCollapse = !group.classList.contains("is-collapsed");
          group.classList.toggle("is-collapsed", willCollapse);
          toggle.setAttribute("aria-expanded", String(!willCollapse));
          const map = loadExpandedSubjects();
          if (willCollapse) delete map[subject];
          else map[subject] = true;
          saveExpandedSubjects(map);
        });
        group.appendChild(toggle);

        const listEl = document.createElement("div");
        listEl.className = "side-group__list";
        bySubject[subject].forEach((item) => {
          const side = document.createElement("button");
          side.type = "button";
          side.className = "side-topic";
          side.append(iconEl(item.icon || "book-01", "side-topic__ico"), document.createTextNode(item.label));
          side.addEventListener("click", () => {
            closeMobileNav();
            if (mode === "learn") startLearn(item);
            else startRevise(item);
          });
          listEl.appendChild(side);
        });
        group.appendChild(listEl);
        sideTopics.appendChild(group);
      });
  }

  function topicRow(item, ctaLabel) {
    const row = document.createElement("div");
    row.className = "progress__row";
    const meta = document.createElement("div");
    meta.className = "progress__row-meta";
    const title = document.createElement("p");
    title.className = "progress__row-title";
    title.textContent = item.label;
    const sub = document.createElement("p");
    sub.className = "progress__row-sub";
    sub.textContent = `${item.subject} · ${item.correct}/${item.answered} correct · ${item.accuracy}%`;
    meta.append(title, sub);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "progress__row-btn";
    btn.textContent = ctaLabel;
    btn.addEventListener("click", () => {
      const match = TOPICS.find((t) => t.id === item.topicId) || {
        id: item.topicId,
        label: item.label,
        subject: item.subject,
      };
      startRevise(match);
    });
    row.append(meta, btn);
    return row;
  }

  function renderProgress(progress) {
    progressLoading.hidden = true;
    progressError.hidden = true;

    if (!progress || !progress.answered) {
      progressEmpty.hidden = false;
      progressBody.hidden = true;
      window.__progressWeak = [];
      renderSideTopics("progress");
      syncProgressBadge();
      return;
    }

    progressEmpty.hidden = true;
    progressBody.hidden = false;

    const due = progress.dueForRecall || [];
    if (progressDue && progressDueList) {
      if (!due.length) {
        progressDue.hidden = true;
        progressDueList.replaceChildren();
      } else {
        progressDue.hidden = false;
        const dueNow = due.filter((d) => d.isDue).length;
        if (progressDueLead) {
          progressDueLead.textContent =
            dueNow > 0
              ? `${dueNow} ready for recall — same nudge Reca sends on WhatsApp.`
              : "Reca is holding these misses — revise to clear them before they resurface.";
        }
        progressDueList.replaceChildren();
        due.forEach((d) => {
          const row = document.createElement("div");
          row.className = "progress__row";
          const meta = document.createElement("div");
          meta.className = "progress__row-meta";
          const title = document.createElement("p");
          title.className = "progress__row-title";
          title.textContent = d.label;
          const sub = document.createElement("p");
          sub.className = "progress__row-sub";
          sub.textContent = d.isDue
            ? `${d.subject} · ready for recall`
            : `${d.subject} · Reca is holding this`;
          meta.append(title, sub);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "progress__row-btn";
          btn.textContent = d.isDue ? "Recall now" : "Revise";
          btn.addEventListener("click", () => {
            const match = TOPICS.find((t) => t.id === d.topicId) || {
              id: d.topicId,
              label: d.label,
              subject: d.subject,
            };
            startRevise(match);
          });
          row.append(meta, btn);
          progressDueList.appendChild(row);
        });
        syncProgressBadge(dueNow);
      }
    } else {
      syncProgressBadge();
    }

    progressStats.replaceChildren();
    [
      { label: "Answered", value: String(progress.answered) },
      { label: "Correct", value: String(progress.correct) },
      { label: "Accuracy", value: `${progress.accuracy}%` },
    ].forEach((stat) => {
      const card = document.createElement("div");
      card.className = "progress__stat";
      const val = document.createElement("p");
      val.className = "progress__stat-value";
      val.textContent = stat.value;
      const lab = document.createElement("p");
      lab.className = "progress__stat-label";
      lab.textContent = stat.label;
      card.append(val, lab);
      progressStats.appendChild(card);
    });

    const subjectNames = ["All", ...(progress.subjects || []).map((s) => s.subject)];
    progressFilters.replaceChildren();
    subjectNames.forEach((name) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "progress__chip" + (progressFilter === name ? " is-active" : "");
      chip.textContent = name;
      chip.addEventListener("click", () => {
        progressFilter = name;
        loadProgress();
      });
      progressFilters.appendChild(chip);
    });

    const topics = progress.topics || [];
    const needs = topics.filter((t) => t.status === "needsWork");
    const strong = topics.filter((t) => t.status !== "needsWork");
    window.__progressWeak = needs;

    progressNeeds.replaceChildren();
    if (!needs.length) {
      const p = document.createElement("p");
      p.className = "progress__hint";
      p.textContent = "Nothing flagged — keep AI quizzing to stay sharp.";
      progressNeeds.appendChild(p);
    } else {
      needs.forEach((t) => progressNeeds.appendChild(topicRow(t, "Revise")));
    }

    progressStrong.replaceChildren();
    if (!strong.length) {
      const p = document.createElement("p");
      p.className = "progress__hint";
      p.textContent = "No strong topics yet — a few correct AI-quiz answers land here.";
      progressStrong.appendChild(p);
    } else {
      strong.forEach((t) => progressStrong.appendChild(topicRow(t, "Practice")));
    }

    renderSideTopics("progress");
  }

  async function loadProgress() {
    if (!progressPanel) return;
    progressLoading.hidden = false;
    progressEmpty.hidden = true;
    progressBody.hidden = true;
    progressError.hidden = true;

    try {
      if (!phone) await startSession(false);
      const subject =
        progressFilter && progressFilter !== "All"
          ? `&subject=${encodeURIComponent(progressFilter)}`
          : "";
      const res = await fetch(`/api/progress?phone=${encodeURIComponent(phone)}${subject}`);
      const data = await res.json();
      if (!res.ok || !data.progress) throw new Error(data.error || "Failed");
      renderProgress(data.progress);
      announce(
        data.progress.answered
          ? `${data.progress.correct} of ${data.progress.answered} correct`
          : "No progress yet"
      );
    } catch (err) {
      console.error("loadProgress", err);
      progressLoading.hidden = true;
      progressError.hidden = false;
      progressError.replaceChildren();
      const msg = document.createElement("p");
      msg.textContent = "Couldn’t load progress — check your connection, then retry.";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "progress__cta";
      retry.textContent = "Retry";
      retry.addEventListener("click", () => loadProgress());
      progressError.append(msg, retry);
    }
  }

  function renderHubs() {
    syncRecommend();
    renderSubjectBar(reviseSubjects, reviseFilter, (name) => {
      reviseFilter = name;
      renderHubs();
    });
    renderTopicCards(reviseTopics, reviseFilter, reviseQuery, startRevise, "Revise");
    renderSideTopics(feature === "revise" ? "revise" : feature === "progress" ? "progress" : "learn");
  }

  async function startLearn(item) {
    setNavActive("learn");
    feature = "learn";
    app.dataset.feature = "learn";
    app.dataset.mode = "chat";
    lastLearnTopic = item;
    mainEyebrow.textContent = "Learn · AI explaining";
    mainTitle.textContent = item.label;
    showOnly(thread);
    thread.innerHTML = "";
    mainDock.hidden = false;
    input.placeholder = `Ask a follow-up about ${item.label}…`;
    markValue();
    await sendMessage(item.send || `explain ${item.label}`, {
      mode: "learn",
      learnTopic: item,
      topicId: item.id,
      fresh: true,
      hideOutgoing: true,
    });
  }

  function appendLearnQuizNudge(topic) {
    thread.querySelectorAll(".learn-cta").forEach((el) => el.remove());
    const cta = document.createElement("div");
    cta.className = "learn-cta";

    const row = document.createElement("div");
    row.className = "learn-cta__row";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "learn-cta__btn learn-cta__btn--primary";
    btn.append(iconEl("quiz-03"), document.createTextNode(" Try 2 quick questions"));
    btn.addEventListener("click", () => topic && startRevise(topic, { limit: 2 }));

    const wa = makeContinueWaButton(topic?.label || topic?.id || "genetics-basics");
    wa.className = "learn-cta__link";
    wa.textContent = "Continue on WhatsApp";

    row.append(btn, wa);

    const hint = document.createElement("p");
    hint.className = "learn-cta__hint";
    hint.textContent = "Short check on this topic — End anytime. Misses go to Progress.";

    cta.append(row, hint);
    thread.appendChild(cta);
    scrollThread();
  }

  async function sendMessage(text, opts = {}) {
    if (!text || busy) return;
    const mode = opts.mode || (feature === "learn" ? "learn" : "chat");

    if (feature === "revise" && app.dataset.mode === "quiz") {
      await submitQuizAnswer(text);
      return;
    }

    setComposerBusy(true);
    setStatus("Thinking…", true);
    app.dataset.mode = "chat";
    showOnly(thread);
    if (!thread.childNodes.length || opts.freshThread) thread.innerHTML = "";

    if (!opts.hideOutgoing) addBubble(text, "out");
    input.value = "";
    const topicHint = opts.learnTopic?.label || lastLearnTopic?.label || "";
    showThinking({
      kind: mode === "learn" ? (opts.fresh ? "explain" : "answer") : "chat",
      topic: opts.fresh ? topicHint : "",
    });

    try {
      // Soft focus only — server resolves typos + topic switches
      const topicId = opts.topicId || lastLearnTopic?.id || undefined;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          body: text,
          mode,
          topicId,
          fresh: Boolean(opts.fresh),
        }),
      });
      const data = await res.json();
      hideThinking();
      (data.replies || []).forEach((r) => addBubble(r, "in"));
      if (mode === "learn" && data.replies?.length) {
        // Prefer server focus (handles "osimosis" → Osmosis) over stale lastLearnTopic
        const topic =
          TOPICS.find((t) => t.id === data.learnFocusId) ||
          opts.learnTopic ||
          lastLearnTopic ||
          TOPICS.find((t) => t.send === text) ||
          TOPICS.find((t) =>
            text.toLowerCase().includes(String(t.label || "").toLowerCase())
          ) ||
          recommendedTopic();
        if (topic) {
          const switched = lastLearnTopic && lastLearnTopic.id !== topic.id;
          lastLearnTopic = topic;
          mainTitle.textContent = topic.label;
          mainEyebrow.textContent = "Learn · AI explaining";
          input.placeholder = `Ask a follow-up about ${topic.label}…`;
          if (switched) {
            // Keep history, but make the new topic unmistakable in the header
            mainTitle.textContent = topic.label;
          }
        }
        appendLearnQuizNudge(topic);
      }
      setStatus("Online", true);
      announce("Reca replied");
    } catch (_) {
      hideThinking();
      addErrorBubble("Couldn’t send that — check your connection, then try again.", () =>
        sendMessage(text, opts)
      );
      setStatus("Offline", false);
    } finally {
      setComposerBusy(false);
      syncSendEnabled();
      input.focus();
    }
  }

  async function startRevise(item, opts = {}) {
    if (!item?.id) return;
    if (!phone) await startSession(false);

    const limit = opts.limit != null ? Number(opts.limit) : 5;

    setNavActive("revise");
    feature = "revise";
    app.dataset.feature = "revise";
    app.dataset.mode = "quiz";
    activeQuizTopic = item;
    markValue();
    mainEyebrow.textContent = "Revise · AI is quizzing";
    mainTitle.textContent = item.label;
    showOnly(quizPanel);
    mainDock.hidden = false;
    input.placeholder = "Answer Reca’s AI — type or pick above…";
    quizFeedback.hidden = true;
    quizFeedback.replaceChildren();
    quizSummary.hidden = true;
    quizSummary.replaceChildren();
    quizOptions.innerHTML = "";
    quizQuestion.textContent =
      limit <= 2 ? "Building 2 quick questions…" : "Loading your quiz…";
    quizLocked = true;
    setStatus("Loading…", true);

    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, topicId: item.id, limit }),
      });
      const data = await res.json();
      if (!res.ok || !data.question) throw new Error(data.error || "Failed");
      renderQuestion(data.question);
      quizLocked = false;
      setStatus("Online", true);
      input.focus();
    } catch (err) {
      console.error("startRevise", err);
      quizQuestion.textContent = "Couldn’t start this quiz.";
      quizOptions.innerHTML = "";
      quizFeedback.hidden = false;
      quizFeedback.replaceChildren();
      const note = document.createElement("p");
      note.className = "quiz__error-msg";
      note.textContent = "Check your connection, then retry — or pick another topic.";
      const row = document.createElement("div");
      row.className = "quiz__error-actions";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "quiz__again";
      retry.textContent = "Retry";
      retry.addEventListener("click", () => startRevise(item, opts));
      const back = document.createElement("button");
      back.type = "button";
      back.className = "quiz__to-learn";
      back.textContent = "Back to topics";
      back.addEventListener("click", () => setFeature("revise"));
      row.append(retry, back);
      quizFeedback.append(note, row);
      quizLocked = false;
      mainDock.hidden = true;
      setStatus("Online", true);
    }
  }

  function renderQuestion(q) {
    if (!q) return;
    const quizLabel = document.getElementById("quizLabel");
    const quizComposerHint = document.getElementById("quizComposerHint");
    quizSummary.hidden = true;
    quizFeedback.hidden = true;
    if (quizMemory) {
      quizMemory.hidden = true;
      quizMemory.textContent = "";
    }
    if (quizEndBtn) quizEndBtn.hidden = false;
    if (quizComposerHint) quizComposerHint.hidden = false;
    quizTopic.textContent = `${q.subject} · ${q.topicLabel}`;
    quizCount.textContent = `${q.index} of ${q.total}`;
    if (quizLabel) quizLabel.textContent = `Question ${q.index}`;
    if (quizBar) {
      const pct = Math.max(4, Math.round((q.index / Math.max(q.total, 1)) * 100));
      quizBar.style.width = `${pct}%`;
    }
    if (quizDiagram && quizDiagramImg) {
      if (q.diagram?.src) {
        quizDiagram.hidden = false;
        quizDiagramImg.src = q.diagram.src;
        quizDiagramImg.alt = q.diagram.alt || q.diagram.caption || "Topic diagram";
        if (quizDiagramCap) quizDiagramCap.textContent = q.diagram.caption || "";
        quizDiagram.style.animation = "none";
        void quizDiagram.offsetWidth;
        quizDiagram.style.animation = "";
      } else {
        quizDiagram.hidden = true;
        quizDiagramImg.removeAttribute("src");
        if (quizDiagramCap) quizDiagramCap.textContent = "";
      }
    }
    quizQuestion.textContent = q.text;
    quizOptions.innerHTML = "";
    const letters = "ABCDEFGH";
    (q.options || []).forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz__option";
      btn.dataset.answer = opt;
      const letter = document.createElement("span");
      letter.className = "quiz__option-letter";
      letter.textContent = letters[i] || String(i + 1);
      const label = document.createElement("span");
      label.className = "quiz__option-text";
      label.textContent = opt;
      btn.append(letter, label);
      btn.addEventListener("click", () => submitQuizAnswer(opt));
      quizOptions.appendChild(btn);
    });
    const body = document.querySelector(".main__body");
    if (body) body.scrollTop = 0;
    announce(`Question ${q.index} of ${q.total}`);
  }

  function showQuizSummary(summary) {
    quizSummary.hidden = false;
    quizSummary.replaceChildren();
    if (quizEndBtn) quizEndBtn.hidden = true;
    if (quizMemory) quizMemory.hidden = true;
    const quizComposerHint = document.getElementById("quizComposerHint");
    if (quizComposerHint) quizComposerHint.hidden = true;

    const badge = document.createElement("p");
    badge.className = "quiz__summary-badge";
    badge.textContent = "Session complete";

    const h = document.createElement("p");
    h.className = "quiz__summary-title";
    h.textContent = summary.message;

    const actions = document.createElement("div");
    actions.className = "quiz__summary-actions";

    const toProgress = document.createElement("button");
    toProgress.type = "button";
    toProgress.className = "quiz__again";
    toProgress.append(iconEl("analytics-01"), document.createTextNode(" See Progress"));
    toProgress.addEventListener("click", () => setFeature("progress"));

    const again = document.createElement("button");
    again.type = "button";
    again.className = "quiz__to-learn";
    again.append(iconEl("quiz-03"), document.createTextNode(" Quiz again"));
    again.addEventListener("click", () => {
      const match =
        TOPICS.find((t) => t.id === summary.topicId) ||
        TOPICS.find((t) => t.label === summary.topicLabel) ||
        activeQuizTopic ||
        TOPICS[0];
      startRevise(match);
    });

    const links = document.createElement("div");
    links.className = "quiz__summary-links";

    const toLearn = document.createElement("button");
    toLearn.type = "button";
    toLearn.className = "learn-cta__link quiz__summary-link";
    toLearn.textContent = "Back to Learn";
    toLearn.addEventListener("click", () => setFeature("learn"));

    const onWa = makeContinueWaButton(summary.topicLabel || summary.topicId || "genetics-basics");
    onWa.className = "learn-cta__link";
    onWa.textContent = "Continue on WhatsApp";

    links.append(toLearn, onWa);
    actions.append(toProgress, again, links);
    quizSummary.append(badge, h, actions);
    mainDock.hidden = true;
    announce(summary.message);

    const name = (localStorage.getItem("reca_display_name") || "Student").trim();
    const topic = summary.topicLabel || "your topic";
    const score =
      typeof summary.score === "number" && typeof summary.total === "number"
        ? `${summary.score}/${summary.total}`
        : null;
    sendWhatsAppAlert(
      score
        ? `Great job, ${name}! You finished a Reca web quiz on ${topic} (${score}). Keep going — message Reca anytime.`
        : `Nice work, ${name}! You finished studying ${topic} on the Reca web app. Keep going on WhatsApp!`
    );
  }

  async function endQuizSession() {
    if (busy) return;
    setComposerBusy(true);
    try {
      const res = await fetch("/api/quiz/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.summary) showQuizSummary(data.summary);
      else setFeature("revise");
    } catch (_) {
      setFeature("revise");
    } finally {
      setComposerBusy(false);
      quizLocked = false;
    }
  }

  async function submitQuizAnswer(answer) {
    if (!answer || quizLocked || busy) return;
    quizLocked = true;
    setComposerBusy(true);

    quizOptions.querySelectorAll("button").forEach((b) => {
      b.disabled = true;
      if (b.dataset.answer === answer) b.classList.add("is-picked");
    });

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      quizFeedback.hidden = false;
      quizFeedback.className =
        "quiz__feedback " + (data.feedback.correct ? "is-correct" : "is-wrong");
      quizFeedback.replaceChildren();

      const head = document.createElement("div");
      head.className = "quiz__feedback-head";
      head.append(
        iconEl(data.feedback.correct ? "checkmark-circle-02" : "alert-circle"),
        document.createTextNode(data.feedback.correct ? " Correct" : " Not quite")
      );
      const msg = document.createElement("p");
      msg.className = "quiz__feedback-msg";
      msg.textContent = data.feedback.message || "";
      quizFeedback.append(head, msg);
      quizFeedback.style.animation = "none";
      void quizFeedback.offsetWidth;
      quizFeedback.style.animation = "";

      if (quizMemory) {
        if (data.feedback.memoryPromise) {
          quizMemory.hidden = false;
          quizMemory.textContent = data.feedback.memoryPromise;
        } else {
          quizMemory.hidden = true;
        }
      }

      if (!data.feedback.correct) {
        showLinkBanner();
      }

      quizOptions.querySelectorAll("button").forEach((b) => {
        const opt = b.dataset.answer || "";
        if (
          normalize(opt) === normalize(data.feedback.correctAnswer) ||
          String(data.feedback.correctAnswer || "")
            .toLowerCase()
            .includes(opt.toLowerCase()) ||
          opt
            .toLowerCase()
            .includes(
              String(data.feedback.correctAnswer || "")
                .toLowerCase()
                .split("(")[0]
                .trim()
            )
        ) {
          b.classList.add("is-correct");
        }
        if (b.classList.contains("is-picked") && !data.feedback.correct) {
          b.classList.add("is-wrong");
        }
      });

      input.value = "";

      if (data.done) {
        showQuizSummary(data.summary);
      } else if (data.question) {
        setTimeout(() => {
          renderQuestion(data.question);
          quizLocked = false;
          input.focus();
        }, data.feedback.correct ? 700 : 1400);
        return;
      }
    } catch (_) {
      quizFeedback.hidden = false;
      quizFeedback.className = "quiz__feedback is-wrong";
      quizFeedback.textContent = "Couldn’t grade that. Try again.";
      quizOptions.querySelectorAll("button").forEach((b) => {
        b.disabled = false;
      });
    } finally {
      setComposerBusy(false);
      if (quizSummary.hidden) quizLocked = false;
    }
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function loadTopics() {
    try {
      const res = await fetch("/api/topics?limit=1000");
      const data = await res.json();
      if (data.topics?.length) TOPICS = data.topics;
    } catch (_) {
      /* fallback */
    }
    renderHubs();
  }

  async function startSession(fresh = false) {
    if (fresh) {
      localStorage.removeItem("reca_phone");
      phone = "";
      lastEventId = "";
      seen.clear();
    }
    // Drop invalid / shared-bucket leftovers so the server can mint guest_*
    const saved = String(phone || localStorage.getItem("reca_phone") || "").trim();
    const validSaved =
      /^\+\d{10,15}$/.test(saved) || /^guest_[a-zA-Z0-9_-]{8,64}$/.test(saved);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: validSaved ? saved : undefined,
        name: localStorage.getItem("reca_display_name") || undefined,
        examDate: localStorage.getItem("reca_exam_date") || undefined,
      }),
    });
    const data = await res.json();
    phone = data.phone;
    localStorage.setItem("reca_phone", phone);
    if (data.guest) localStorage.setItem("reca_guest", "1");
    if (data.examDate) {
      localStorage.setItem("reca_exam_date", data.examDate);
      if (profileExamDate) profileExamDate.value = data.examDate;
    }
    syncExamHint(data.daysToExam);
    if (data.displayName) {
      localStorage.setItem("reca_display_name", data.displayName);
      if (profileName) profileName.value = data.displayName;
      syncDisplayName();
    }
    setStatus("Online", true);
  }

  async function pollEvents() {
    if (!phone) return;
    try {
      const res = await fetch(
        `/api/events?phone=${encodeURIComponent(phone)}&after=${encodeURIComponent(lastEventId)}`
      );
      const data = await res.json();
      const msgs = data.messages || [];
      if (!msgs.length) return;
      for (const m of msgs) {
        if (!m?.id || seen.has(m.id)) continue;
        seen.add(m.id);
        lastEventId = m.id;
        const proactive = m.type === "resurface" || m.type === "briefing";
        if (proactive) {
          enqueueNudge(m);
        } else {
          // Non-proactive bot pushes stay in thread if already chatting
          if (app.dataset.mode === "chat" && !thread.hidden) {
            addBubble(m.text, "in", { id: m.id, at: m.at });
          } else {
            enqueueNudge({ ...m, type: m.type || "bot", title: m.title || "Reca" });
          }
        }
      }
      setStatus("Online", true);
    } catch (_) {
      /* ignore transient poll errors */
    }
  }

  setInterval(pollEvents, 4000);

  const nudgeCta = document.getElementById("nudgeCta");
  const nudgeDismiss = document.getElementById("nudgeDismiss");
  const recallForm = document.getElementById("recallForm");
  const recallDone = document.getElementById("recallDone");
  const recallBackdrop = document.getElementById("recallBackdrop");

  if (nudgeCta) {
    nudgeCta.addEventListener("click", () => {
      const nudge = activeNudge;
      if (!nudge) return;
      hideNudge();
      if (nudge.type === "briefing") {
        if (nudge.id) {
          saveUnreadNudges(loadUnreadNudges().filter((n) => n.id !== nudge.id));
          syncProgressBadge();
        }
        const topic = topicFromNudge(nudge);
        if (topic) startRevise(topic);
        else setFeature("revise");
        return;
      }
      // Resurface: answer THIS miss — not a full quiz session
      openRecallModal(nudge);
    });
  }
  if (nudgeDismiss) {
    nudgeDismiss.addEventListener("click", () => {
      if (activeNudge?.id) {
        saveUnreadNudges(loadUnreadNudges().filter((n) => n.id !== activeNudge.id));
        syncProgressBadge();
      }
      hideNudge();
    });
  }
  if (recallForm) {
    recallForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputEl = document.getElementById("recallInput");
      const answer = inputEl?.value.trim();
      if (!answer) return;
      submitRecallAnswer(answer);
    });
  }
  if (recallDone) {
    recallDone.addEventListener("click", () => {
      closeRecallModal();
      setFeature("progress");
    });
  }
  if (recallBackdrop) {
    recallBackdrop.addEventListener("click", () => closeRecallModal());
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const panel = document.getElementById("recallPanel");
    if (panel && !panel.hidden) closeRecallModal();
  });

  // Restore last unread nudge after refresh
  const existingUnread = loadUnreadNudges();
  if (existingUnread.length) {
    showNudge(existingUnread[existingUnread.length - 1]);
    syncProgressBadge();
  }

  document.querySelectorAll(".nav-item, .mobile-tab").forEach((btn) => {
    btn.addEventListener("click", () => setFeature(btn.dataset.nav));
  });

  const learnSearch = document.getElementById("learnSearch");
  const reviseSearch = document.getElementById("reviseSearch");
  if (learnSearch) {
    learnSearch.addEventListener("input", () => {
      learnQuery = learnSearch.value;
      renderHubs();
    });
  }
  if (reviseSearch) {
    reviseSearch.addEventListener("input", () => {
      reviseQuery = reviseSearch.value;
      renderHubs();
    });
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  const sideCloseBtn = document.getElementById("sideCloseBtn");
  if (sideCloseBtn) {
    sideCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  document.addEventListener("click", (e) => {
    if (!app.classList.contains("is-nav-open")) return;
    if (e.target.closest(".side") || e.target.closest("#mobileMenuBtn")) return;
    closeMobileNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileNav();
  });

  if (progressEmptyCta) {
    progressEmptyCta.addEventListener("click", () => setFeature("revise"));
  }

  if (learnRecommend) {
    learnRecommend.addEventListener("click", () => {
      const rec = recommendedTopic();
      if (rec) startLearn(rec);
    });
  }
  if (reviseRecommend) {
    reviseRecommend.addEventListener("click", () => {
      const rec = recommendedTopic();
      if (rec) startRevise(rec);
    });
  }
  if (quizEndBtn) {
    quizEndBtn.addEventListener("click", () => endQuizSession());
  }

  async function refreshWhatsAppStatus() {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      const cfg = await fetch("/api/config").then((r) => r.json()).catch(() => ({}));
      if (cfg.whatsappNumber) recaConfig.whatsappNumber = cfg.whatsappNumber;
      if (!waHint) return;
      const num = data.from || (cfg.whatsappNumber ? `+${cfg.whatsappNumber}` : null);
      if (num) {
        waHint.textContent = `Continue on WhatsApp: message ${num}. Same phone number = same Progress.`;
      } else {
        waHint.textContent = "Add your WhatsApp number so web and phone stay in sync.";
      }
      const link = document.getElementById("waContinueLink");
      if (link) {
        link.href = continueOnWhatsAppUrl(
          lastLearnTopic?.label || activeQuizTopic?.label || "genetics-basics"
        );
        link.hidden = false;
      }
    } catch (_) {
      /* ignore */
    }
  }

  if (waForm && waPhone) {
    const saved = localStorage.getItem("reca_phone") || "";
    if (/^\+\d{10,15}$/.test(saved)) {
      waPhone.value = saved;
    }
    const waLinkBtn = document.getElementById("waLinkBtn");
    waForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const raw = waPhone.value.trim();
      waStatus.hidden = false;
      waStatus.classList.remove("is-error");
      waStatus.textContent = "Linking…";
      if (waLinkBtn) {
        waLinkBtn.disabled = true;
        waLinkBtn.textContent = "…";
      }
      try {
        const res = await fetch("/api/whatsapp/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: raw }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Link failed");
        phone = data.phone;
        localStorage.setItem("reca_phone", phone);
        localStorage.setItem("reca_signed_in", "1");
        localStorage.removeItem("reca_guest");
        syncDisplayName();
        syncSettingsAccountUi();
        waStatus.textContent = data.joinHint || `Linked ${phone}`;
        setStatus("Online", true);
        if (feature === "progress") loadProgress();
        document.getElementById("linkBanner") && (document.getElementById("linkBanner").hidden = true);
      } catch (err) {
        waStatus.classList.add("is-error");
        waStatus.textContent = err.message || "Couldn’t link number";
      } finally {
        if (waLinkBtn) {
          waLinkBtn.disabled = false;
          waLinkBtn.textContent = "Link";
        }
      }
    });
  }

  document.querySelectorAll("[data-settings-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.getAttribute("data-settings-go");
      closeSettingsModal();
      if (dest === "learn" || dest === "revise" || dest === "progress") setFeature(dest);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy || sendBtn.disabled) return;
    if (feature === "revise" && app.dataset.mode === "quiz") {
      submitQuizAnswer(text);
      return;
    }
    if (feature === "revise" && app.dataset.mode === "revise-hub") {
      const q = text.toLowerCase();
      const match = TOPICS.find(
        (t) =>
          q.includes(String(t.label || "").toLowerCase()) ||
          t.aliases?.some((a) => q.includes(String(a).toLowerCase()))
      );
      input.value = "";
      syncSendEnabled();
      if (match) {
        startRevise(match);
        return;
      }
      const search = document.getElementById("reviseSearch");
      if (search) {
        search.value = text;
        search.dispatchEvent(new Event("input", { bubbles: true }));
        search.focus();
      }
      announce("No matching topic — pick one below or refine search.");
      return;
    }
    // Learn: freeform ask — server resolves topic (including typos); don't pin UI topic
    sendMessage(text, {
      mode: "learn",
      topicId: lastLearnTopic?.id,
      fresh: false,
    });
  });

  function clearPendingUpload() {
    pendingUpload = null;
    if (imageUpload) imageUpload.value = "";
    if (composerPreview) composerPreview.classList.remove("is-visible");
    if (composerPreviewImg) composerPreviewImg.removeAttribute("src");
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result || "");
        const base64 = raw.includes(",") ? raw.split(",")[1] : raw;
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error || new Error("Read failed"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadPastQuestion(file) {
    if (!file || busy) return;
    if (!phone) await startSession(false);

    setFeature("learn");
    setComposerBusy(true);
    setStatus("Reading photo…", true);
    app.dataset.mode = "chat";
    showOnly(thread);
    addBubble("📷 Past question photo", "out", {
      image: pendingUpload?.previewSrc
        ? { src: pendingUpload.previewSrc, alt: "Uploaded past question", caption: file.name }
        : null,
    });
    showThinking({ kind: "photo" });

    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/learn/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          imageBase64,
          mimeType: file.type || "image/jpeg",
          note: input.value.trim() || undefined,
        }),
      });
      const data = await res.json();
      hideThinking();
      if (!res.ok) {
        addErrorBubble(data.error || "Couldn’t read that image. Try a clearer photo.", () =>
          uploadPastQuestion(file)
        );
        setStatus("Online", true);
        return;
      }
      (data.replies || []).forEach((r) => addBubble(r, "in"));
      if (data.topic) {
        lastLearnTopic = {
          id: data.topic.id,
          label: data.topic.label,
          subject: data.topic.subject,
          send: `explain ${data.topic.label}`,
        };
        mainTitle.textContent = data.topic.label;
        mainEyebrow.textContent = "Learn · From your photo";
        input.placeholder = `Ask a follow-up about ${data.topic.label}…`;
        appendLearnQuizNudge(lastLearnTopic);
      }
      clearPendingUpload();
      input.value = "";
      setStatus("Online", true);
      announce("Reca explained your photo");
    } catch (_) {
      hideThinking();
      addErrorBubble("Couldn’t upload that — check your connection, then try again.", () =>
        uploadPastQuestion(file)
      );
      setStatus("Offline", false);
    } finally {
      setComposerBusy(false);
      syncSendEnabled();
      input.focus();
    }
  }

  if (attachBtn && imageUpload) {
    attachBtn.addEventListener("click", () => {
      if (busy) return;
      imageUpload.click();
    });
    imageUpload.addEventListener("change", () => {
      const file = imageUpload.files && imageUpload.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        addBubble("Please upload a photo (JPG or PNG).", "in");
        clearPendingUpload();
        return;
      }
      if (file.size > 6 * 1024 * 1024) {
        addBubble("That photo is too large — try one under 6MB.", "in");
        clearPendingUpload();
        return;
      }
      const previewSrc = URL.createObjectURL(file);
      pendingUpload = { file, previewSrc };
      if (composerPreviewImg) {
        composerPreviewImg.src = previewSrc;
        composerPreviewImg.alt = file.name;
      }
      if (composerPreviewLabel) composerPreviewLabel.textContent = file.name;
      if (composerPreview) composerPreview.classList.add("is-visible");
      // Auto-send for fest demo — one tap from camera roll to explain
      uploadPastQuestion(file);
    });
  }

  if (composerPreviewClear) {
    composerPreviewClear.addEventListener("click", () => {
      if (pendingUpload?.previewSrc) URL.revokeObjectURL(pendingUpload.previewSrc);
      clearPendingUpload();
    });
  }

  document.querySelectorAll("[data-ask]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-ask");
      if (!q || busy) return;
      setFeature("learn");
      sendMessage(q, { mode: "learn", fresh: true });
    });
  });

  input.addEventListener("input", syncSendEnabled);
  input.addEventListener("change", syncSendEnabled);
  syncSendEnabled();

  loadConfig()
    .then(() => loadTopics())
    .then(() => startSession(false))
    .then(() => {
      refreshWhatsAppStatus();
      setFeature("learn");
      syncSendEnabled();
    });
})();
