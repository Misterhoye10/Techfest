(() => {
  const FALLBACK_TOPICS = [
    { id: "photosynthesis", label: "Photosynthesis", subject: "Biology", send: "explain photosynthesis", icon: "sun-03" },
    { id: "osmosis", label: "Osmosis", subject: "Biology", send: "explain osmosis", icon: "droplet" },
    { id: "genetics-basics", label: "Genetics basics", subject: "Biology", send: "explain genetics basics", icon: "bubble-chat-double" },
    { id: "aerobic-respiration", label: "Respiration", subject: "Biology", send: "explain aerobic respiration", icon: "lungs" },
    { id: "acids-bases", label: "Acids & bases", subject: "Chemistry", send: "explain acids and bases", icon: "chemistry-01" },
  ];

  const DEMO_TOPIC_IDS = ["photosynthesis", "osmosis", "genetics-basics"];
  const urlParams = new URLSearchParams(location.search);
  const wantsGuest = urlParams.get("guest") === "1";
  const showBrowseTopics = urlParams.get("browse") === "1";

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
  const profileTargetUniversity = document.getElementById("profileTargetUniversity");
  const profileTargetUniversityTrigger = document.getElementById("profileTargetUniversityTrigger");
  const profileTargetUniversityList = document.getElementById("profileTargetUniversityList");
  const profileTargetUniversityLabel = document.getElementById("profileTargetUniversityLabel");
  const profileUniUpdates = document.getElementById("profileUniUpdates");
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
  let reviseExamBody =
    String(localStorage.getItem("reca_exam_body") || "WAEC").toUpperCase() === "JAMB"
      ? "JAMB"
      : "WAEC";
  let progressFilter = "All";
  let thinkingEl = null;
  let thinkingTimer = null;
  let thinkingSecondaryTimer = null;
  let thinkingStageTimer = null;
  let streamTimers = [];
  let streamGeneration = 0;
  let pendingUpload = null;
  let quizLocked = false;
  let recaConfig = {
    whatsappNumber: "15556777893",
    version: "1.0.0",
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
      if (data.version) recaConfig.version = data.version;
      const versionEl = document.getElementById("settingsAppVersion");
      if (versionEl && data.version) versionEl.textContent = `v${data.version}`;
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
      /* best-effort - Render may be cold */
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
    return raw.replace(/^quick recall\s*[-\--:]\s*/i, "").trim() || raw;
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
    const isUniUpdate = nudge.type === "uni-update";
    const kind = isUniUpdate ? "uni" : isBriefing ? "briefing" : "revise";
    bar.dataset.kind = kind;

    if (eyeEl) {
      eyeEl.textContent = isUniUpdate
        ? "University update"
        : isBriefing
          ? "Today’s plan"
          : "Time to revise";
    }
    if (titleEl) {
      titleEl.textContent = isBriefing || isUniUpdate
        ? nudge.title || (isUniUpdate ? "Admin update" : "Today’s focus")
        : nudge.topicLabel
          ? nudge.topicLabel
          : nudge.title || "Quick check";
    }
    if (textEl) {
      textEl.textContent = isBriefing || isUniUpdate
        ? String(nudge.text || "").split("\n").filter(Boolean)[0] || nudge.text
        : questionFromNudge(nudge);
    }
    if (metaEl) {
      metaEl.textContent = isUniUpdate
        ? nudge.sourceUrl
          ? `Summary from ${nudge.universityName || "the official page"}. Check the portal before you act.`
          : `For ${nudge.universityName || "your school"}. Confirm on the official portal.`
        : isBriefing
          ? "Picked from your weak spots. Also on WhatsApp when linked."
          : "You missed this earlier. Answer to clear it.";
    }
    if (cta) {
      cta.textContent = isUniUpdate
        ? nudge.sourceUrl
          ? "View source"
          : "Got it"
        : isBriefing
          ? "Start focus"
          : "Answer now";
    }
    bar.hidden = false;
    announce(
      isUniUpdate
        ? "University update from Reca"
        : isBriefing
          ? "Daily briefing from Reca"
          : "Reminder from Reca"
    );
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
        ? nudge.topicLabel
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
    if (!answer || !phone) {
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "recall__feedback is-wrong";
        feedback.textContent = "Type a short answer, then tap Check.";
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (inputEl) inputEl.disabled = true;
    if (feedback) {
      feedback.hidden = false;
      feedback.className = "recall__feedback";
      feedback.textContent = "Checking…";
    }

    try {
      const nudge = activeNudge || {};
      const res = await fetch("/api/recall/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          answer,
          topicId: nudge.topicId || null,
          topicLabel: nudge.topicLabel || null,
          questionText: questionFromNudge(nudge) || nudge.questionText || null,
          correctAnswer: nudge.correctAnswer || null,
          accept: Array.isArray(nudge.accept) ? nudge.accept : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Couldn’t check that answer.");
      }

      const replyRaw = data.message || data.replies?.[0];
      const reply =
        typeof replyRaw === "string"
          ? replyRaw
          : String(replyRaw?.text || "");
      const ok = Boolean(data.correct) || /correct|cleared/i.test(reply);
      const line =
        (ok
          ? reply.split("\n")[0]
          : data.correctAnswer
            ? `Not quite. The answer is ${data.correctAnswer}.`
            : reply.split("\n")[0]) ||
        (ok ? "Correct. Cleared." : "Not quite. Try again later from Progress.");

      if (feedback) {
        feedback.hidden = false;
        feedback.className =
          "recall__feedback " + (ok ? "is-correct" : "is-wrong");
        feedback.textContent = cleanDisplay(line).replace(/\s+/g, " ").trim();
      }
      if (form) form.hidden = true;
      if (doneBtn) doneBtn.hidden = false;
      if (activeNudge?.id) {
        saveUnreadNudges(loadUnreadNudges().filter((n) => n.id !== activeNudge.id));
        syncProgressBadge();
      }
      softLoadProgressCache();
      announce(ok ? "Recall cleared" : "Recall checked");
    } catch (err) {
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "recall__feedback is-wrong";
        feedback.textContent =
          err?.message && !/failed to fetch/i.test(err.message)
            ? err.message
            : "Couldn’t reach Reca. Check your connection, then tap Check again.";
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
      correctAnswer: msg.correctAnswer || null,
      accept: Array.isArray(msg.accept) ? msg.accept : null,
      updateId: msg.updateId || null,
      universityName: msg.universityName || null,
      category: msg.category || null,
      sourceUrl: msg.sourceUrl || null,
      source: msg.source || null,
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
    applyEmptyGreetCaptions();
  }

  function recommendedTopic() {
    return (
      TOPICS.find((t) => t.id === "photosynthesis") ||
      TOPICS.find((t) => /photosynthesis/i.test(t.label)) ||
      TOPICS.find((t) => t.id === "osmosis") ||
      TOPICS.find((t) => /genetics/i.test(t.label)) ||
      TOPICS[0]
    );
  }

  function syncRecommend() {
    const rec = recommendedTopic();
    if (!rec) return;
    const reviseTitle = document.getElementById("reviseRecommendTitle");
    if (reviseTitle) reviseTitle.textContent = rec.label;
    const reviseMeta =
      document.getElementById("reviseRecommendMeta") ||
      reviseRecommend?.querySelector(".recommend__meta");
    if (reviseMeta) {
      reviseMeta.textContent = `${reviseExamBody} · ${rec.subject || "Biology"} · 5`;
    }
    const browse = document.getElementById("reviseBrowse");
    if (browse) browse.hidden = !showBrowseTopics;
  }

  function syncExamSeg() {
    const seg = document.getElementById("reviseExamSeg");
    if (!seg) return;
    seg.querySelectorAll("[data-exam]").forEach((btn) => {
      const on = btn.getAttribute("data-exam") === reviseExamBody;
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncRecommend();
  }

  function setReviseExamBody(body) {
    reviseExamBody = body === "JAMB" ? "JAMB" : "WAEC";
    localStorage.setItem("reca_exam_body", reviseExamBody);
    syncExamSeg();
  }

  /** Inline SVGs - no icon font (CDN glyphs were rendering as CJK tofu). */
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
    "more-vertical":
      '<circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none"/>',
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

  /* First-run loop tip - no WhatsApp gate (#3). Dismiss once; skip forever. */
  const LOOP_TIP_KEY = "reca_loop_tip_seen";
  const learnLoopTip = document.getElementById("learnLoopTip");
  const learnLoopDismiss = document.getElementById("learnLoopDismiss");

  function loopTipSeen() {
    try {
      return localStorage.getItem(LOOP_TIP_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function dismissLoopTip() {
    if (learnLoopTip) learnLoopTip.hidden = true;
    try {
      localStorage.setItem(LOOP_TIP_KEY, "1");
    } catch (_) {
      /* ignore */
    }
  }

  function maybeShowLoopTip() {
    if (!learnLoopTip || loopTipSeen()) return;
    learnLoopTip.hidden = false;
  }

  if (learnLoopDismiss) {
    learnLoopDismiss.addEventListener("click", dismissLoopTip);
  }
  maybeShowLoopTip();

  const settingsModal = document.getElementById("settingsModal");
  const settingsBackdrop = document.getElementById("settingsBackdrop");
  const settingsClose = document.getElementById("settingsClose");
  const settingsTitle = document.getElementById("settingsTitle");
  const profileScrim = document.getElementById("profileScrim");
  const profilePopEmail = document.getElementById("profilePopEmail");
  const profilePopSub = document.getElementById("profilePopSub");
  const profileWaMeta = document.getElementById("profileWaMeta");

  const SETTINGS_TITLES = {
    general: "Profile",
    appearance: "Appearance",
    exam: "Exam & university",
    whatsapp: "WhatsApp",
    about: "About Reca",
    how: "How Reca works",
    help: "Get help",
    privacy: "Privacy",
    team: "Credits",
  };

  function isGuestPhoneToken(value) {
    return /^guest_[a-zA-Z0-9_-]{8,64}$/.test((value || "").trim());
  }

  function syncProfileMenuMeta() {
    const name = (localStorage.getItem("reca_display_name") || "").trim();
    const phoneSaved = (localStorage.getItem("reca_phone") || "").trim();
    const linked = /^\+\d{10,15}$/.test(phoneSaved);
    const guest = isGuestSession();

    if (profilePopEmail) {
      // Never surface guest_* session tokens - reads as debug, not account UI (#6, #9)
      if (name) profilePopEmail.textContent = name;
      else if (linked) profilePopEmail.textContent = phoneSaved;
      else profilePopEmail.textContent = "Student";
    }
    if (profilePopSub) {
      if (linked && !guest) {
        profilePopSub.textContent = name ? phoneSaved : "WhatsApp linked";
      } else if (guest || isGuestPhoneToken(phoneSaved)) {
        profilePopSub.textContent = "Guest session";
      } else {
        profilePopSub.textContent = "Signed in";
      }
    }
    if (profileWaMeta) {
      profileWaMeta.textContent = linked ? "Linked" : "Link";
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
    if (waLinkedValue) waLinkedValue.textContent = linked ? phoneSaved : "·";
    if (waPhone && linked && !waPhone.value) waPhone.value = phoneSaved;

    const link = document.getElementById("waContinueLink");
    if (link) {
      link.href = continueOnWhatsAppUrl(
        lastLearnTopic?.label || activeQuizTopic?.label || "photosynthesis"
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
    if (key === "exam") {
      closeUniSelect();
      loadUniversities();
    }
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
    closeUniSelect();
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
    if (sideTopics && !e.target.closest?.(".side-topic")) closeAllSideTopicMenus();
    if (!profileWrap || profilePopover?.hidden) return;
    if (!profileWrap.contains(e.target) && e.target !== profileScrim) closeProfile();
  });
  document.addEventListener(
    "scroll",
    (e) => {
      if (!sideTopics?.querySelector(".side-topic.is-menu-open")) return;
      if (e.target === document || e.target?.closest?.(".side__recent, .side")) {
        closeAllSideTopicMenus();
      }
    },
    true
  );
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (sideTopics?.querySelector(".side-topic.is-menu-open")) {
      closeAllSideTopicMenus();
      return;
    }
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

  let universitiesLoaded = false;
  const DEFAULT_UNI_LABEL = "JAMB & general only";
  let uniSelectFocusIndex = -1;

  function closeUniSelect() {
    if (!profileTargetUniversityTrigger || !profileTargetUniversityList) return;
    profileTargetUniversityTrigger.setAttribute("aria-expanded", "false");
    profileTargetUniversityList.hidden = true;
    uniSelectFocusIndex = -1;
    profileTargetUniversityList.querySelectorAll(".uni-select__option.is-focused").forEach((el) => {
      el.classList.remove("is-focused");
    });
  }

  function openUniSelect() {
    if (!profileTargetUniversityTrigger || !profileTargetUniversityList) return;
    profileTargetUniversityTrigger.setAttribute("aria-expanded", "true");
    profileTargetUniversityList.hidden = false;
    const selected = profileTargetUniversityList.querySelector(".uni-select__option.is-selected");
    uniSelectFocusIndex = selected
      ? Array.from(profileTargetUniversityList.children).indexOf(selected)
      : 0;
    focusUniOption(uniSelectFocusIndex);
  }

  function toggleUniSelect() {
    if (profileTargetUniversityList?.hidden) openUniSelect();
    else closeUniSelect();
  }

  function focusUniOption(index) {
    if (!profileTargetUniversityList) return;
    const items = profileTargetUniversityList.querySelectorAll(".uni-select__option");
    if (!items.length) return;
    const i = Math.max(0, Math.min(index, items.length - 1));
    uniSelectFocusIndex = i;
    items.forEach((el, idx) => el.classList.toggle("is-focused", idx === i));
    items[i].scrollIntoView({ block: "nearest" });
  }

  function selectUniversity(value, label, { save = true } = {}) {
    if (profileTargetUniversity) profileTargetUniversity.value = value || "";
    const displayLabel = label || DEFAULT_UNI_LABEL;
    if (profileTargetUniversityLabel) {
      profileTargetUniversityLabel.textContent = displayLabel;
    }
    if (value) {
      localStorage.setItem("reca_target_university", value);
      localStorage.setItem("reca_target_university_label", displayLabel);
    } else {
      localStorage.removeItem("reca_target_university");
      localStorage.removeItem("reca_target_university_label");
    }
    if (profileTargetUniversityList) {
      profileTargetUniversityList.querySelectorAll(".uni-select__option").forEach((el) => {
        el.classList.toggle("is-selected", el.dataset.value === (value || ""));
        el.setAttribute("aria-selected", el.dataset.value === (value || "") ? "true" : "false");
      });
    }
    closeUniSelect();
    if (save) saveUniProfile({ targetUniversity: value || "" });
  }

  function renderUniOptions(list) {
    if (!profileTargetUniversityList) return;
    const saved = localStorage.getItem("reca_target_university") || "";
    const options = [{ id: "", name: DEFAULT_UNI_LABEL }, ...list];
    profileTargetUniversityList.innerHTML = options
      .map(
        (u) =>
          `<li class="uni-select__option${saved === u.id ? " is-selected" : ""}" role="option" data-value="${u.id}" aria-selected="${saved === u.id ? "true" : "false"}" tabindex="-1">${u.name}</li>`
      )
      .join("");
    const current = options.find((u) => u.id === saved) || options[0];
    if (profileTargetUniversity) profileTargetUniversity.value = current.id;
    if (profileTargetUniversityLabel) profileTargetUniversityLabel.textContent = current.name;
  }

  async function loadUniversities() {
    if (!profileTargetUniversityList || universitiesLoaded) return;
    try {
      const res = await fetch("/api/universities");
      const data = await res.json();
      renderUniOptions(data.universities || []);
      universitiesLoaded = true;
    } catch (_) {
      renderUniOptions([]);
      universitiesLoaded = true;
    }
  }

  function syncUniSettingsUi() {
    const saved = localStorage.getItem("reca_target_university") || "";
    const savedLabel = localStorage.getItem("reca_target_university_label") || DEFAULT_UNI_LABEL;
    if (profileTargetUniversity) profileTargetUniversity.value = saved;
    if (profileTargetUniversityList?.children.length) {
      profileTargetUniversityList.querySelectorAll(".uni-select__option").forEach((el) => {
        const on = el.dataset.value === saved;
        el.classList.toggle("is-selected", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
      });
      const selected = profileTargetUniversityList.querySelector(
        `.uni-select__option[data-value="${CSS.escape(saved)}"]`
      );
      if (profileTargetUniversityLabel) {
        profileTargetUniversityLabel.textContent =
          selected?.textContent?.trim() || savedLabel;
      }
    } else if (profileTargetUniversityLabel) {
      profileTargetUniversityLabel.textContent = saved ? savedLabel : DEFAULT_UNI_LABEL;
    }
    if (profileUniUpdates) {
      profileUniUpdates.checked = localStorage.getItem("reca_uni_updates") !== "0";
    }
  }

  async function saveUniProfile(partial = {}) {
    const saveEl = document.getElementById("settingsExamSave");
    const targetUniversity =
      partial.targetUniversity !== undefined
        ? partial.targetUniversity
        : profileTargetUniversity?.value || "";
    const uniUpdatesEnabled =
      partial.uniUpdatesEnabled !== undefined
        ? partial.uniUpdatesEnabled
        : profileUniUpdates?.checked !== false;

    if (targetUniversity) localStorage.setItem("reca_target_university", targetUniversity);
    else localStorage.removeItem("reca_target_university");
    localStorage.setItem("reca_uni_updates", uniUpdatesEnabled ? "1" : "0");

    flashSave(saveEl, "University settings saved");
    if (!phone) return;
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, targetUniversity, uniUpdatesEnabled }),
      });
    } catch (_) {
      flashSave(saveEl, "Couldn’t sync university settings", true);
    }
  }

  if (profileTargetUniversityTrigger && profileTargetUniversityList) {
    syncUniSettingsUi();
    loadUniversities();
    profileTargetUniversityTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleUniSelect();
    });
    profileTargetUniversityList.addEventListener("click", (e) => {
      const opt = e.target.closest(".uni-select__option");
      if (!opt) return;
      selectUniversity(opt.dataset.value || "", opt.textContent.trim());
    });
    profileTargetUniversityList.addEventListener("keydown", (e) => {
      const items = profileTargetUniversityList.querySelectorAll(".uni-select__option");
      if (!items.length) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeUniSelect();
        profileTargetUniversityTrigger.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusUniOption(uniSelectFocusIndex + 1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusUniOption(uniSelectFocusIndex - 1);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const focused = items[uniSelectFocusIndex];
        if (focused) selectUniversity(focused.dataset.value || "", focused.textContent.trim());
      }
    });
    profileTargetUniversityTrigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openUniSelect();
        profileTargetUniversityList.focus();
      }
      if (e.key === "Escape") closeUniSelect();
    });
    document.addEventListener("click", (e) => {
      if (profileTargetUniversityList?.hidden) return;
      if (e.target.closest("#profileTargetUniversityWrap")) return;
      closeUniSelect();
    });
  }
  if (profileUniUpdates) {
    profileUniUpdates.addEventListener("change", () =>
      saveUniProfile({ uniUpdatesEnabled: profileUniUpdates.checked })
    );
  }

  const settingsTestNudge = document.getElementById("settingsTestNudge");
  if (settingsTestNudge) {
    settingsTestNudge.addEventListener("click", async () => {
      const saveEl = document.getElementById("settingsExamSave");
      if (!phone) {
        try {
          await startSession(false);
        } catch (_) {
          flashSave(saveEl, "Start a session first, then try again.", true);
          return;
        }
      }
      settingsTestNudge.disabled = true;
      flashSave(saveEl, "Sending test nudge…");
      try {
        const res = await fetch("/api/nudge/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            kind: settingsTestNudge.dataset.nudgeKind || "auto",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          flashSave(
            saveEl,
            data.error || "Couldn’t send a nudge. Miss a quiz question, then try again.",
            true
          );
          return;
        }
        const label =
          data.kind === "resurface"
            ? "Time to revise"
            : data.kind === "briefing"
              ? "Today’s plan"
              : data.kind === "uni-update"
                ? "University update"
                : "Nudge";
        flashSave(
          saveEl,
          `${label} queued. Watch for the popup. WhatsApp: ${
            data.channel?.whatsapp === "sent" ? "sent" : "web only"
          }.`
        );
        closeSettingsModal();
        await pollEvents();
      } catch (_) {
        flashSave(saveEl, "Network error. Try again.", true);
      } finally {
        settingsTestNudge.disabled = false;
      }
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

  let pendingLinkPrompt = false;

  function showLinkBanner() {
    const banner = document.getElementById("linkBanner");
    if (!banner) return;
    if (!isGuestSession()) return;
    if (localStorage.getItem("reca_link_prompt_dismissed") === "1") return;
    // Never cover an active quiz - answer is the only job (#2)
    const quizActive =
      app.dataset.mode === "quiz" && quizSummary && quizSummary.hidden !== false;
    if (quizActive) {
      pendingLinkPrompt = true;
      return;
    }
    pendingLinkPrompt = false;
    banner.hidden = false;
  }

  function flushLinkBanner() {
    if (!pendingLinkPrompt) return;
    pendingLinkPrompt = false;
    showLinkBanner();
  }

  function hideLinkBanner(dismiss) {
    const banner = document.getElementById("linkBanner");
    if (banner) banner.hidden = true;
    if (dismiss) {
      pendingLinkPrompt = false;
      localStorage.setItem("reca_link_prompt_dismissed", "1");
    }
  }

  document.getElementById("linkBannerDismiss")?.addEventListener("click", () => {
    hideLinkBanner(true);
  });

  function setStatus(text, online = true) {
    const label = text === "Online" ? (isGuestSession() ? "Guest" : "Signed in") : text;
    statusLine.replaceChildren();
    if (!online) {
      statusLine.append(iconEl("alert-circle", "status-ico"), document.createTextNode(` ${label}`));
      statusLine.querySelector(".status-ico").style.color = "#fb735b";
      return;
    }
    // Quiet meta - no Discord-green “Online” (#1, anti AI-wrapper)
    statusLine.textContent = label;
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

  function getThreadScroller() {
    // `.main__body` is the overflow scroller; `#thread` grows with content
    return document.querySelector(".main__body") || thread?.parentElement || thread;
  }

  function scrollThread(opts = {}) {
    const scroller = getThreadScroller();
    if (!scroller) return;

    const run = () => {
      const last =
        opts.el ||
        thread?.querySelector(".turn:last-child, .learn-cta:last-child");
      if (last && typeof last.scrollIntoView === "function") {
        last.scrollIntoView({
          block: "end",
          inline: "nearest",
          behavior: opts.smooth ? "smooth" : "auto",
        });
      } else {
        scroller.scrollTop = scroller.scrollHeight;
      }
    };

    // Wait for layout (teach bubbles / images) before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
      if (opts.settle !== false) {
        setTimeout(run, 80);
        setTimeout(run, 220);
      }
    });
  }

  function syncSendEnabled() {
    if (!sendBtn || !input) return;
    const hasText = Boolean(input.value.trim());
    const canSend = hasText && !busy;
    sendBtn.disabled = !canSend;
    sendBtn.setAttribute("aria-disabled", canSend ? "false" : "true");
  }

  function setComposerBusy(isBusy) {
    if (isBusy) {
      streamGeneration += 1;
      clearStreamTimers();
    }
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
        return topic ? `Reading ${topic}…` : "Reading your question…";
      case "answer":
        return "Reading your question…";
      case "photo":
        return "Opening your photo…";
      case "quiz":
        return "Picking exam-style questions…";
      default:
        return "Thinking…";
    }
  }

  function thinkingStages(kind, topicHint) {
    const topic = String(topicHint || "").trim();
    switch (kind) {
      case "explain":
        return [
          topic ? `Reading ${topic}…` : "Reading your question…",
          "Checking syllabus notes…",
          "Writing a clear explanation…",
        ];
      case "answer":
        return [
          "Reading your question…",
          "Matching what you asked…",
          "Writing an answer…",
        ];
      case "photo":
        return [
          "Opening your photo…",
          "Reading the past question…",
          "Drafting an explanation…",
        ];
      case "quiz":
        return [
          "Picking exam-style questions…",
          "Checking the answer key…",
          "Almost ready…",
        ];
      default:
        return ["Thinking…", "Putting this together…", "Writing a reply…"];
    }
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  function clearStreamTimers() {
    streamTimers.forEach((id) => clearTimeout(id));
    streamTimers = [];
  }

  function wait(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      streamTimers.push(id);
    });
  }

  function minThinkMs(replies) {
    const text = (replies || [])
      .map((r) => (typeof r === "string" ? r : r?.text || ""))
      .join(" ");
    const len = text.length;
    // Preset replies are instant - still feel generative
    return Math.min(1600, Math.max(900, 700 + Math.floor(len / 12)));
  }

  async function holdThinking(startedAt, replies) {
    const need = minThinkMs(replies);
    const left = need - (Date.now() - startedAt);
    if (left > 0) await wait(left);
  }

  function showThinking(labelOrOpts) {
    const opts =
      typeof labelOrOpts === "string" || labelOrOpts == null
        ? { label: labelOrOpts, kind: "chat" }
        : labelOrOpts;
    const stages = thinkingStages(opts.kind || "chat", opts.topic);
    const label = opts.label || stages[0];
    hideThinking(true);
    thinkingTimer = setTimeout(() => {
      thinkingEl = document.createElement("div");
      thinkingEl.className = "turn turn--in turn--thinking";
      thinkingEl.setAttribute("aria-live", "polite");
      thinkingEl.setAttribute("aria-busy", "true");
      const avatar = document.createElement("div");
      avatar.className = "turn__avatar";
      avatar.appendChild(recaAvatarEl());
      const bubble = document.createElement("div");
      bubble.className = "thinking";
      const dots = document.createElement("span");
      dots.className = "thinking__dots";
      dots.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 3; i++) dots.appendChild(document.createElement("span"));
      const copy = document.createElement("div");
      copy.className = "thinking__copy";
      const lab = document.createElement("span");
      lab.className = "thinking__label";
      lab.textContent = label;
      const secondary = document.createElement("span");
      secondary.className = "thinking__secondary";
      secondary.textContent = "Working on your answer";
      copy.append(lab, secondary);
      bubble.append(dots, copy);
      thinkingEl.append(avatar, bubble);
      thread.appendChild(thinkingEl);
      scrollThread({ el: thinkingEl, settle: false });
      thinkingSecondaryTimer = setTimeout(() => {
        secondary.classList.add("is-visible");
      }, 1100);

      let stage = 0;
      if (!prefersReducedMotion() && stages.length > 1) {
        thinkingStageTimer = setInterval(() => {
          stage = (stage + 1) % stages.length;
          lab.textContent = stages[stage];
        }, 850);
      }
    }, 60);
  }

  function hideThinking(immediate) {
    if (thinkingTimer) clearTimeout(thinkingTimer);
    thinkingTimer = null;
    if (thinkingSecondaryTimer) clearTimeout(thinkingSecondaryTimer);
    thinkingSecondaryTimer = null;
    if (thinkingStageTimer) {
      clearInterval(thinkingStageTimer);
      thinkingStageTimer = null;
    }
    if (!thinkingEl) return;
    const el = thinkingEl;
    thinkingEl = null;
    el.removeAttribute("aria-busy");
    if (immediate) {
      el.remove();
      return;
    }
    el.classList.add("is-exiting");
    setTimeout(() => el.remove(), 160);
  }

  function typingPlan(text) {
    const len = String(text || "").length;
    const targetMs = Math.min(3200, Math.max(700, Math.floor(len * 11)));
    const steps = Math.max(12, Math.ceil(targetMs / 26));
    const chunk = Math.max(1, Math.ceil(len / steps));
    return { chunk, interval: 26 };
  }

  function typeText(targetEl, fullText, caretEl, generation) {
    return new Promise((resolve) => {
      const text = String(fullText || "");
      if (!text || prefersReducedMotion()) {
        targetEl.textContent = text;
        if (caretEl) caretEl.remove();
        resolve();
        return;
      }
      const { chunk, interval } = typingPlan(text);
      let i = 0;
      const tick = () => {
        if (generation !== streamGeneration) {
          resolve();
          return;
        }
        i = Math.min(text.length, i + chunk);
        // Keep caret as last child while streaming
        targetEl.textContent = text.slice(0, i);
        if (caretEl) targetEl.appendChild(caretEl);
        scrollThread({ settle: false });
        if (i >= text.length) {
          if (caretEl) caretEl.remove();
          resolve();
          return;
        }
        const id = setTimeout(tick, interval);
        streamTimers.push(id);
      };
      tick();
    });
  }

  async function addBubbleStreamed(raw, meta = {}) {
    if (meta.id && seen.has(meta.id)) return;
    if (meta.id) seen.add(meta.id);

    const { text, image } = normalizeReply(raw);
    const role = "in";
    const generation = streamGeneration;

    const turn = document.createElement("div");
    turn.className = "turn turn--in";
    const avatar = document.createElement("div");
    avatar.className = "turn__avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.appendChild(recaAvatarEl());
    turn.appendChild(avatar);

    const stack = document.createElement("div");
    stack.className = "turn__stack";
    const el = document.createElement("div");
    const isTeach = feature === "learn" || meta.teach;
    el.className = isTeach ? "msg msg--in msg--teach is-streaming" : "msg msg--in is-streaming";

    const badge = document.createElement("div");
    badge.className = "msg__badge msg__badge--live";
    badge.textContent = "Reca";
    el.appendChild(badge);

    const streamHost = document.createElement("div");
    streamHost.className = "msg__body msg__stream";
    const p = document.createElement("p");
    p.className = "msg__stream-text";
    const caret = document.createElement("span");
    caret.className = "msg__caret";
    caret.setAttribute("aria-hidden", "true");
    p.appendChild(caret);
    streamHost.appendChild(p);
    el.appendChild(streamHost);

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
    scrollThread({ el: turn, smooth: true });

    await typeText(p, text, caret, generation);
    if (generation !== streamGeneration) return;

    // Morph to structured teach layout once the “typing” finishes
    if (isTeach && text.trim()) {
      streamHost.replaceWith(formatTeachBody(text));
    } else if (text.trim()) {
      streamHost.replaceWith(formatBody(text));
    }
    appendMedia(el, image || meta.image);
    el.classList.remove("is-streaming");
    el.classList.add("is-ready");
    scrollThread({ el: turn, smooth: true });
  }

  async function addInboundReplies(replies, meta = {}) {
    const list = (replies || []).filter((r) => {
      const n = normalizeReply(r);
      return Boolean(n.text.trim() || n.image);
    });
    for (let i = 0; i < list.length; i++) {
      if (i > 0) await wait(prefersReducedMotion() ? 80 : 320);
      await addBubbleStreamed(list[i], meta);
    }
  }

  function dayPart() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "morning";
    if (h >= 12 && h < 17) return "afternoon";
    if (h >= 17 && h < 22) return "evening";
    return "late";
  }

  function dayPartLabel() {
    switch (dayPart()) {
      case "morning":
        return "Morning";
      case "afternoon":
        return "Afternoon";
      case "evening":
        return "Evening";
      default:
        return "Late night";
    }
  }

  /** Real name only - never greet as “Student” (#6, #9) */
  function realDisplayName() {
    const name = (localStorage.getItem("reca_display_name") || "").trim();
    if (!name || /^student$/i.test(name)) return "";
    return name;
  }

  /** Quiet caption when named; job title stays the hero (#2, #12) */
  function emptyGreetCaption() {
    const name = realDisplayName();
    if (!name) return "";
    return `${dayPartLabel()} · ${name}`;
  }

  function applyEmptyGreetCaptions() {
    const text = emptyGreetCaption();
    ["learnGreet", "reviseGreet"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!text) {
        el.hidden = true;
        el.textContent = "";
        return;
      }
      el.hidden = false;
      el.textContent = text;
    });
  }

  /** Empty hubs: job label + topic list - greeting is caption only */
  function learnGreeting() {
    return {
      title: "Start with a topic",
      desc: "Or type a question in the box below.",
    };
  }

  function reviseGreeting() {
    return {
      title: "Past questions",
      desc: "WAEC or JAMB · five questions · stop anytime.",
    };
  }

  function applyLearnEmptyCopy() {
    const g = learnGreeting();
    const titleEl = document.getElementById("learnTitle");
    const descEl = document.getElementById("learnDesc");
    if (titleEl) titleEl.textContent = g.title;
    if (descEl) descEl.textContent = g.desc;
    applyEmptyGreetCaptions();
  }

  function applyReviseEmptyCopy() {
    const g = reviseGreeting();
    const titleEl = document.getElementById("reviseTitle");
    const descEl = document.getElementById("reviseDesc");
    if (titleEl) titleEl.textContent = g.title;
    if (descEl) descEl.textContent = g.desc;
    applyEmptyGreetCaptions();
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
      if (mainEyebrow) {
        mainEyebrow.hidden = true;
        mainEyebrow.textContent = "Learn";
      }
      mainTitle.textContent = "Learn";
      app.dataset.mode = "welcome";
      applyLearnEmptyCopy();
      showOnly(learnWelcome);
      mainDock.hidden = false;
      input.placeholder = "Ask a syllabus question…";
      renderSideTopics("learn");
      syncComposerCtx();
      input.focus();
      syncSendEnabled();
      return;
    }

    if (name === "revise") {
      sideTopicsLabel.replaceChildren(
        iconEl("quiz-03"),
        document.createTextNode(" Topics to quiz")
      );
      if (mainEyebrow) {
        mainEyebrow.hidden = true;
        mainEyebrow.textContent = "Revise";
      }
      mainTitle.textContent = "Revise";
      app.dataset.mode = "revise-hub";
      applyReviseEmptyCopy();
      showOnly(reviseWelcome);
      mainDock.hidden = false;
      input.placeholder = "Name a topic to quiz…";
      renderSideTopics("revise");
      syncComposerCtx();
      clearReviseTip();
      input.focus();
      syncSendEnabled();
      return;
    }

    if (name === "progress") {
      sideTopicsLabel.replaceChildren(
        iconEl("analytics-01"),
        document.createTextNode(" Your progress")
      );
      clearUnreadNudges();
      hideNudge();
      if (mainEyebrow) {
        mainEyebrow.hidden = true;
        mainEyebrow.textContent = "Progress";
      }
      mainTitle.textContent = "Progress";
      app.dataset.mode = "progress";
      showOnly(progressPanel);
      mainDock.hidden = true;
      renderSideTopics("progress");
      syncComposerCtx();
      loadProgress();
      return;
    }
  }

  function cleanDisplay(text) {
    return String(text || "")
      .replace(/\u2014/g, "-")
      .replace(/\u2013/g, "-")
      .replace(/\u2015/g, "-")
      .replace(/\u2212/g, "-");
  }

  function formatBody(text) {
    const body = document.createElement("div");
    body.className = "msg__body";
    String(cleanDisplay(text))
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
      p.textContent = cleanDisplay(text);
      body.appendChild(p);
    }
    return body;
  }

  /** Structure Learn replies: spelling note → explanation → quick-check callout */
  function formatTeachBody(text) {
    let raw = cleanDisplay(text).trim();
    raw = raw
      .replace(
        /\n\nYou['’]re on [\s\S]+?Reca will answer\.?\s*$/i,
        ""
      )
      .trim();
    const wrap = document.createElement("div");
    wrap.className = "msg__teach";

    let rest = raw;
    const spellingMatch = rest.match(/^Spelling check:\s*([\s\S]+?)(?:\n\n|$)/i);
    if (spellingMatch) {
      const note = document.createElement("p");
      note.className = "msg__spell";
      note.setAttribute("role", "status");
      const rawBits = spellingMatch[1].replace(/\.\s*$/, "");
      // Prefer crisp “typed → correct” chips (period or dash between clauses)
      const pairs = [
        ...rawBits.matchAll(
          /[“"]([^”"]+)[”"](?:\s*[-–—]\s*|\.\s*)it['’]?s\s*spelled\s*[“"]([^”"]+)[”"]/gi
        ),
      ];
      if (pairs.length) {
        note.appendChild(document.createTextNode("Spelling · "));
        pairs.forEach((m, i) => {
          if (i) note.appendChild(document.createTextNode(" · "));
          const strike = document.createElement("span");
          strike.className = "msg__spell-was";
          strike.textContent = m[1];
          const arrow = document.createElement("span");
          arrow.className = "msg__spell-arrow";
          arrow.textContent = " → ";
          const ok = document.createElement("span");
          ok.className = "msg__spell-now";
          ok.textContent = m[2];
          note.append(strike, arrow, ok);
        });
      } else {
        note.textContent = `Spelling · ${rawBits.replace(/\s*;\s*/g, " · ")}`;
      }
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
      const bodyText = check.replace(/^Quick check\s*[---]?\s*/i, "").trim();
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

  function assetUrl(src) {
    const raw = String(src || "").trim();
    if (!raw) return "";
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    try {
      return new URL(raw, window.location.origin).href;
    } catch (_) {
      return raw;
    }
  }

  function appendMedia(el, image) {
    if (!image?.src || !el) return;
    const figure = document.createElement("figure");
    figure.className = "msg__media";
    if (image.labelled) figure.classList.add("msg__media--labelled");
    const img = document.createElement("img");
    img.src = assetUrl(image.src);
    img.alt = image.alt || image.caption || "Teaching diagram";
    img.decoding = "async";
    img.loading = "eager";
    img.width = 640;
    img.height = 360;
    img.addEventListener("error", () => {
      figure.classList.add("is-broken");
      if (!figure.querySelector(".msg__media-fallback")) {
        const fb = document.createElement("p");
        fb.className = "msg__media-fallback";
        fb.textContent = image.caption
          ? `Diagram: ${image.caption}`
          : "Diagram couldn’t load - refresh and try again.";
        figure.appendChild(fb);
      }
    });
    figure.appendChild(img);
    if (image.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = image.caption;
      figure.appendChild(cap);
    }
    // Diagram above the timestamp; for labelled packs, above the teach text
    const teach = el.querySelector(".msg__teach, .msg__body");
    const meta = el.querySelector(".msg__meta");
    if (image.labelled && teach) {
      el.insertBefore(figure, teach);
    } else if (meta) {
      el.insertBefore(figure, meta);
    } else {
      el.appendChild(figure);
    }
  }

  function outgoingLabel(text, meta = {}) {
    const custom = String(meta.displayText || "").trim();
    if (custom) return custom;
    const raw = String(text || "").trim();
    const explain = raw.match(/^explain\s+(.+)$/i);
    if (explain) {
      const topic = explain[1].replace(/\s+simply$/i, "").trim();
      return topic ? `Explain ${topic.charAt(0).toUpperCase()}${topic.slice(1)}` : raw;
    }
    return raw;
  }

  function addBubble(raw, role = "in", meta = {}) {
    if (meta.id && seen.has(meta.id)) return;
    if (meta.id) seen.add(meta.id);

    const { text, image } = normalizeReply(raw);
    if (role === "out" && !String(meta.displayText || text || "").trim()) return;

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
        badge.className = "msg__badge msg__badge--live";
        badge.textContent = "Reca";
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
      p.textContent = outgoingLabel(text, meta);
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
    scrollThread({ el: turn, smooth: role === "in" });
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
        verb === "Revise" ? `${item.subject} · Quiz` : `${item.subject} · Explain`;

      starter.append(icoWrap, label, meta);
      starter.addEventListener("click", () => onStart(item));
      container.appendChild(starter);
    });
  }

  const EXPAND_KEY = "reca.side.expanded";
  const TOUCH_KEY = "reca.topic.touched";
  let progressByTopic = Object.create(null);

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

  function loadTopicTouches() {
    try {
      return JSON.parse(localStorage.getItem(TOUCH_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function touchTopic(id) {
    if (!id) return;
    const map = loadTopicTouches();
    map[id] = Date.now();
    // Cap map size so localStorage stays light
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 80);
    localStorage.setItem(TOUCH_KEY, JSON.stringify(Object.fromEntries(entries)));
  }

  function relativeTouchLabel(ts) {
    if (!ts) return "";
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.round(hrs / 24);
    if (days < 14) return `${days}d`;
    return "";
  }

  function topicMetaLabel(item) {
    const prog = progressByTopic[item.id];
    if (prog && prog.answered > 0) {
      return `${prog.correct}/${prog.answered}`;
    }
    const touched = loadTopicTouches()[item.id];
    const rel = relativeTouchLabel(touched);
    if (rel) return rel;
    return "";
  }

  function cacheProgressTopics(progress) {
    const next = Object.create(null);
    (progress?.topics || []).forEach((t) => {
      if (!t?.topicId) return;
      next[t.topicId] = {
        correct: Number(t.correct) || 0,
        answered: Number(t.answered) || 0,
        accuracy: Number(t.accuracy) || 0,
        status: t.status || "",
      };
    });
    progressByTopic = next;
  }

  async function softLoadProgressCache() {
    try {
      if (!phone) return;
      const res = await fetch(`/api/progress?phone=${encodeURIComponent(phone)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.progress) {
        cacheProgressTopics(data.progress);
        if (sideTopics?.childNodes.length) {
          renderSideTopics(
            feature === "revise" ? "revise" : feature === "progress" ? "progress" : "learn"
          );
        }
      }
    } catch {
      /* silent - meta is optional */
    }
  }

  function syncComposerCtx() {
    const ctx = document.getElementById("composerCtx");
    const focusLabel = document.getElementById("composerFocusLabel");
    const quizChip = document.getElementById("composerQuizChip");
    const focusChip = document.getElementById("composerFocusChip");
    const clearBtn = document.getElementById("composerCtxClear");
    if (!ctx) return;

    const topic =
      feature === "revise" || app.dataset.mode === "quiz"
        ? activeQuizTopic || lastLearnTopic
        : lastLearnTopic || activeQuizTopic;

    const show =
      Boolean(topic?.id) &&
      feature !== "progress" &&
      mainDock &&
      !mainDock.hidden;

    ctx.hidden = !show;
    if (!show || !topic) return;

    const subject = (topic.subject || "").trim();
    const name = focusDisplayLabel(topic);
    if (focusLabel) {
      focusLabel.textContent = subject ? `${subject} · ${name}` : name;
    }
    if (focusChip) {
      focusChip.title = subject ? `${subject}: ${name}` : name;
    }
    if (quizChip) {
      const showQuiz = feature === "learn" && Boolean(lastLearnTopic?.id) && app.dataset.mode !== "quiz";
      quizChip.hidden = !showQuiz;
    }
    if (clearBtn) {
      // Don't abandon an in-progress quiz via the chip clear (#18)
      clearBtn.hidden = app.dataset.mode === "quiz";
    }
  }

  function clearComposerFocus() {
    lastLearnTopic = null;
    activeQuizTopic = null;
    syncComposerCtx();
    syncActiveSideTopic();
    if (feature === "learn") {
      setFeature("learn");
    } else if (feature === "revise") {
      setFeature("revise");
    }
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
        // Quizable samples across subjects - Progress empty still maps the syllabus
        list = balancedTopicSample(quizableTopics(filtered("All", "")), 2);
      }
      return list;
    }
    const list = filtered(filter, query);
    // No search/filter: every subject must appear; Revise skips subject-intro cards
    if (!query && filter === "All") {
      if (mode === "learn") return promoteDemoTopics(balancedTopicSample(list, 3));
      if (mode === "revise") return promoteDemoTopics(quizableTopics(list));
    }
    if (mode === "revise") return quizableTopics(list);
    return list;
  }

  /** Subject intros (“What is Biology”) are Learn cards - Prefer concept topics for quiz */
  function isSubjectIntroTopic(t) {
    return /^what is\b/i.test(String(t?.label || t?.title || ""));
  }

  function quizableTopics(list) {
    const quiz = (list || []).filter((t) => !isSubjectIntroTopic(t));
    return quiz.length ? quiz : list || [];
  }

  /** Prefer demo starters inside their subject - never collapse other subjects away */
  function promoteDemoTopics(list) {
    const demoFirst = DEMO_TOPIC_IDS.map((id) => list.find((t) => t.id === id)).filter(Boolean);
    if (!demoFirst.length) return list;
    const rest = list.filter((t) => !DEMO_TOPIC_IDS.includes(t.id));
    return [...demoFirst, ...rest];
  }

  /** Keep every subject visible - take up to `perSubject` topics from each. */
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

  function closeAllSideTopicMenus(except) {
    sideTopics?.querySelectorAll(".side-topic.is-menu-open").forEach((row) => {
      if (except && row === except) return;
      row.classList.remove("is-menu-open");
      const more = row.querySelector(".side-topic__more");
      const menu = row.querySelector(".side-topic__menu");
      if (more) more.setAttribute("aria-expanded", "false");
      if (menu) menu.hidden = true;
    });
  }

  function syncActiveSideTopic() {
    const activeId =
      feature === "revise"
        ? activeQuizTopic?.id
        : lastLearnTopic?.id;
    sideTopics?.querySelectorAll(".side-topic").forEach((row) => {
      row.classList.toggle("is-active", Boolean(activeId) && row.dataset.topicId === activeId);
    });
  }

  function renderSideTopics(mode) {
    sideTopics.innerHTML = "";
    closeAllSideTopicMenus();
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
          closeAllSideTopicMenus();
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
          const row = document.createElement("div");
          row.className = "side-topic";
          row.dataset.topicId = item.id;

          const main = document.createElement("button");
          main.type = "button";
          main.className = "side-topic__main";
          main.title = item.label;
          const label = document.createElement("span");
          label.className = "side-topic__label";
          label.textContent = item.label;
          main.append(iconEl(item.icon || "book-01", "side-topic__ico"), label);

          const metaText = topicMetaLabel(item);
          if (metaText) {
            const meta = document.createElement("span");
            meta.className = "side-topic__meta";
            meta.textContent = metaText;
            meta.title =
              progressByTopic[item.id]?.answered > 0
                ? `${progressByTopic[item.id].correct} of ${progressByTopic[item.id].answered} correct`
                : "Last opened";
            main.appendChild(meta);
          }

          main.addEventListener("click", () => {
            closeAllSideTopicMenus();
            closeMobileNav();
            touchTopic(item.id);
            // Learn → explain. Revise / Progress → quiz starts immediately (#2)
            if (mode === "learn") startLearn(item);
            else startRevise(item);
          });

          const more = document.createElement("button");
          more.type = "button";
          more.className = "side-topic__more";
          more.setAttribute("aria-label", `Actions for ${item.label}`);
          more.setAttribute("aria-haspopup", "menu");
          more.setAttribute("aria-expanded", "false");
          more.appendChild(iconEl("more-vertical", "side-topic__more-ico"));

          const menu = document.createElement("div");
          menu.className = "side-topic__menu";
          menu.hidden = true;
          menu.setAttribute("role", "menu");
          menu.setAttribute("aria-label", item.label);

          const askBtn = document.createElement("button");
          askBtn.type = "button";
          askBtn.className = "side-topic__menu-item";
          askBtn.setAttribute("role", "menuitem");
          askBtn.textContent = "Ask about this";
          askBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllSideTopicMenus();
            closeMobileNav();
            startLearn(item);
          });

          const quizBtn = document.createElement("button");
          quizBtn.type = "button";
          quizBtn.className = "side-topic__menu-item";
          quizBtn.setAttribute("role", "menuitem");
          quizBtn.textContent = mode === "learn" ? "Quiz this" : "Start quiz";
          quizBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllSideTopicMenus();
            closeMobileNav();
            startRevise(item);
          });

          // On Revise/Progress the row already quizzes - lead with Start quiz in the menu
          if (mode === "learn") menu.append(askBtn, quizBtn);
          else menu.append(quizBtn, askBtn);

          more.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = row.classList.contains("is-menu-open");
            closeAllSideTopicMenus();
            if (!open) {
              row.classList.add("is-menu-open");
              more.setAttribute("aria-expanded", "true");
              menu.hidden = false;
              // Fixed so the menu escapes .side__recent overflow clip (Claude pattern)
              const r = more.getBoundingClientRect();
              const menuH = 96;
              const top =
                r.bottom + 4 + menuH > window.innerHeight
                  ? Math.max(8, r.top - menuH - 4)
                  : r.bottom + 4;
              menu.style.position = "fixed";
              menu.style.top = `${top}px`;
              menu.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
              menu.style.left = "auto";
              menu.style.bottom = "auto";
            }
          });

          row.append(main, more, menu);
          listEl.appendChild(row);
        });
        group.appendChild(listEl);
        sideTopics.appendChild(group);
      });
    syncActiveSideTopic();
  }

  function topicRow(item, ctaLabel, tone) {
    const row = document.createElement("div");
    row.className =
      "progress__row" +
      (tone === "weak" ? " progress__row--weak" : tone === "strong" ? " progress__row--strong" : "");
    const meta = document.createElement("div");
    meta.className = "progress__row-meta";
    const titleRow = document.createElement("div");
    titleRow.className = "progress__row-top";
    const title = document.createElement("p");
    title.className = "progress__row-title";
    title.textContent = item.label;
    const acc = document.createElement("span");
    acc.className =
      "progress__acc" +
      (Number(item.accuracy) >= 70
        ? " progress__acc--good"
        : Number(item.accuracy) < 50
          ? " progress__acc--low"
          : "");
    acc.textContent = `${item.accuracy}%`;
    titleRow.append(title, acc);
    const sub = document.createElement("p");
    sub.className = "progress__row-sub";
    sub.textContent = `${item.subject} · ${item.correct}/${item.answered} correct`;
    meta.append(titleRow, sub);
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
    const progressLead = document.getElementById("progressLead");
    const progressDuePill = document.getElementById("progressDuePill");

    if (!progress || !progress.answered) {
      progressEmpty.hidden = false;
      progressBody.hidden = true;
      if (progressLead) progressLead.hidden = true;
      window.__progressWeak = [];
      cacheProgressTopics(null);
      renderSideTopics("progress");
      syncProgressBadge();
      return;
    }

    progressEmpty.hidden = true;
    progressBody.hidden = false;

    if (progressLead) {
      const dueCount = (progress.dueForRecall || []).filter((d) => d.isDue).length;
      progressLead.hidden = false;
      progressLead.textContent =
        dueCount > 0
          ? `${dueCount} topic${dueCount === 1 ? "" : "s"} ready for recall. Quiz to clear them.`
          : `${progress.correct} of ${progress.answered} correct overall · ${progress.accuracy}% accuracy.`;
    }

    const due = progress.dueForRecall || [];
    if (progressDue && progressDueList) {
      if (!due.length) {
        progressDue.hidden = true;
        progressDueList.replaceChildren();
        if (progressDuePill) progressDuePill.hidden = true;
      } else {
        progressDue.hidden = false;
        const dueNow = due.filter((d) => d.isDue).length;
        if (progressDuePill) {
          progressDuePill.hidden = false;
          progressDuePill.textContent =
            dueNow > 0 ? `${dueNow} due now` : `${due.length} queued`;
          progressDuePill.className =
            "progress__due-pill" + (dueNow > 0 ? " is-hot" : "");
        }
        if (progressDueLead) {
          progressDueLead.textContent =
            dueNow > 0
              ? `${dueNow} ready now. Same weak spots Reca would resurface on WhatsApp.`
              : "Still need work. Quiz again when you’re ready.";
        }
        progressDueList.replaceChildren();
        due.forEach((d) => {
          const row = document.createElement("div");
          row.className =
            "progress__row progress__row--due" + (d.isDue ? " is-ready" : "");
          const meta = document.createElement("div");
          meta.className = "progress__row-meta";
          const titleRow = document.createElement("div");
          titleRow.className = "progress__row-top";
          const title = document.createElement("p");
          title.className = "progress__row-title";
          title.textContent = d.label;
          const status = document.createElement("span");
          status.className =
            "progress__acc" + (d.isDue ? " progress__acc--due" : "");
          status.textContent = d.isDue ? "Due" : "Soon";
          titleRow.append(title, status);
          const sub = document.createElement("p");
          sub.className = "progress__row-sub";
          sub.textContent = d.isDue
            ? `${d.subject} · ready for recall`
            : `${d.subject} · waiting for recall`;
          meta.append(titleRow, sub);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className =
            "progress__row-btn" + (d.isDue ? " progress__row-btn--primary" : "");
          btn.textContent = d.isDue ? "Quiz now" : "Quiz again";
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
      { label: "Answered", value: String(progress.answered), key: "answered" },
      { label: "Correct", value: String(progress.correct), key: "correct" },
      { label: "Accuracy", value: `${progress.accuracy}%`, key: "accuracy" },
    ].forEach((stat) => {
      const card = document.createElement("div");
      card.className =
        "progress__stat" + (stat.key === "accuracy" ? " progress__stat--accent" : "");
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
      chip.setAttribute("aria-pressed", progressFilter === name ? "true" : "false");
      chip.addEventListener("click", () => {
        progressFilter = name;
        loadProgress();
      });
      progressFilters.appendChild(chip);
    });

    const topics = progress.topics || [];
    cacheProgressTopics(progress);
    const needs = topics.filter((t) => t.status === "needsWork");
    const strong = topics.filter((t) => t.status !== "needsWork");
    window.__progressWeak = needs;

    progressNeeds.replaceChildren();
    if (!needs.length) {
      const p = document.createElement("p");
      p.className = "progress__hint";
      p.textContent = "Nothing flagged yet. Keep quizzing to stay sharp.";
      progressNeeds.appendChild(p);
    } else {
      needs.forEach((t) => progressNeeds.appendChild(topicRow(t, "Quiz again", "weak")));
    }

    progressStrong.replaceChildren();
    if (!strong.length) {
      const p = document.createElement("p");
      p.className = "progress__hint";
      p.textContent = "No strong topics yet. A few correct answers land here.";
      progressStrong.appendChild(p);
    } else {
      strong.forEach((t) => progressStrong.appendChild(topicRow(t, "Practice", "strong")));
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
      msg.textContent = "Couldn’t load progress. Check your connection, then retry.";
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
    renderTopicCards(reviseTopics, reviseFilter, reviseQuery, startRevise, "Revise");
    renderSideTopics(feature === "revise" ? "revise" : feature === "progress" ? "progress" : "learn");
  }

  function clearReviseTip() {
    const tip = document.getElementById("reviseTip");
    if (tip) {
      tip.hidden = true;
      tip.textContent = "";
    }
  }

  function showReviseTip(msg) {
    const tip = document.getElementById("reviseTip");
    if (!tip) return;
    tip.hidden = false;
    tip.textContent = msg;
  }

  function openReviseBrowse(filter, query) {
    const browse = document.getElementById("reviseBrowse");
    if (browse) browse.open = true;
    if (filter) reviseFilter = filter;
    if (query != null) {
      reviseQuery = query;
      const search = document.getElementById("reviseSearch");
      if (search) search.value = query;
    }
    renderHubs();
  }

  /** Resolve typed revise intent → topic, subject browse, or miss */
  function resolveReviseQuery(text) {
    const q = String(text || "").trim().toLowerCase();
    if (!q) return { kind: "empty" };

    const subjects = [...new Set(TOPICS.map((t) => t.subject).filter(Boolean))];
    const subjectHit = subjects.find((s) => {
      const sl = s.toLowerCase();
      return q === sl || q.includes(sl) || sl.includes(q);
    });

    const scored = TOPICS.map((t) => {
      const label = String(t.label || "").toLowerCase();
      const id = String(t.id || "").toLowerCase();
      let score = 0;
      if (label === q || id === q) score = 100;
      else if (label.startsWith(q) || id.startsWith(q)) score = 80;
      else if (label.includes(q) || id.includes(q)) score = 60;
      else if ((t.aliases || []).some((a) => String(a).toLowerCase() === q)) score = 95;
      else if ((t.aliases || []).some((a) => String(a).toLowerCase().includes(q))) score = 50;
      else if (q.includes(label) && label.length >= 4) score = 70;
      return { t, score };
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored[0]?.score >= 60) {
      return { kind: "topic", topic: scored[0].t };
    }

    if (subjectHit) {
      return { kind: "subject", subject: subjectHit };
    }

    if (scored[0]) {
      return { kind: "topic", topic: scored[0].t };
    }

    return { kind: "miss", query: text.trim() };
  }

  function handleReviseAsk(text) {
    const result = resolveReviseQuery(text);
    input.value = "";
    syncSendEnabled();

    if (result.kind === "topic" && result.topic) {
      clearReviseTip();
      startRevise(result.topic);
      return;
    }

    if (result.kind === "subject") {
      openReviseBrowse(result.subject, "");
      showReviseTip(`Pick a ${result.subject} topic below, or type a topic name.`);
      announce(`Choose a ${result.subject} topic to quiz`);
      return;
    }

    openReviseBrowse("All", result.query || text);
    showReviseTip("No exact match. Browse below, or pick a topic from the list.");
    announce("No matching topic");
  }

  async function startLearn(item) {
    dismissLoopTip();
    setNavActive("learn");
    feature = "learn";
    app.dataset.feature = "learn";
    app.dataset.mode = "chat";
    lastLearnTopic = item;
    touchTopic(item.id);
    syncActiveSideTopic();
    syncComposerCtx();
    if (mainEyebrow) {
      mainEyebrow.hidden = false;
      mainEyebrow.textContent = "Learn";
    }
    const display = focusDisplayLabel(item);
    mainTitle.textContent = display;
    showOnly(thread);
    thread.innerHTML = "";
    mainDock.hidden = false;
    input.placeholder = `Ask about ${display}…`;
    markValue();
    await sendMessage(item.send || `explain ${item.label}`, {
      mode: "learn",
      learnTopic: item,
      topicId: item.id,
      fresh: true,
      displayText: `Explain ${item.label}`,
    });
  }

  function appendLearnQuizNudge(topic) {
    thread.querySelectorAll(".learn-cta").forEach((el) => el.remove());
    const cta = document.createElement("div");
    cta.className = "learn-cta";

    const prompts = document.createElement("div");
    prompts.className = "learn-cta__prompts";
    prompts.setAttribute("role", "group");
    prompts.setAttribute("aria-label", "Go deeper");

    const followUps = [
      { label: "Explain further", ask: "Explain further in simpler words" },
      { label: "Give an example", ask: "Give a simple everyday example" },
      { label: "Key exam points", ask: "What key exam points should I remember?" },
    ];

    followUps.forEach(({ label, ask }) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "learn-cta__chip";
      chip.textContent = label;
      chip.addEventListener("click", () => {
        if (!topic) return;
        sendMessage(ask, {
          mode: "learn",
          learnTopic: topic,
          topicId: topic.id,
          fresh: false,
          displayText: label,
        });
      });
      prompts.appendChild(chip);
    });
    cta.appendChild(prompts);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "learn-cta__btn learn-cta__btn--primary";
    btn.append(iconEl("quiz-03"), document.createTextNode(" Try 2 quick questions"));
    btn.addEventListener("click", () => topic && startRevise(topic, { limit: 2 }));
    cta.appendChild(btn);

    const linked =
      !isGuestSession() && /^\+\d{10,15}$/.test(String(phone || localStorage.getItem("reca_phone") || ""));
    if (linked) {
      const wa = makeContinueWaButton(topic?.label || topic?.id || "photosynthesis");
      wa.className = "learn-cta__link";
      wa.textContent = "Continue on WhatsApp";
      cta.append(wa);
    }

    thread.appendChild(cta);
    scrollThread({ el: cta, smooth: true });
  }

  function focusDisplayLabel(topic) {
    if (!topic) return "";
    const label = cleanDisplay(topic.label || topic.title || "").trim();
    const subject = cleanDisplay(topic.subject || "").trim();
    // Intro cards: header shows the subject, not "What is …"
    if (subject && /^what is\b/i.test(label)) return subject;
    return label || subject;
  }

  function applyLearnFocus(data, opts = {}) {
    if (!data?.learnFocusId && !opts.topic) return null;
    const fromList = data?.learnFocusId
      ? TOPICS.find((t) => t.id === data.learnFocusId)
      : null;
    const topic =
      fromList ||
      opts.topic ||
      (data?.learnFocusId
        ? {
            id: data.learnFocusId,
            label: data.learnFocusLabel || data.learnFocusId,
            subject: data.learnFocusSubject || "",
            send: `explain ${data.learnFocusLabel || data.learnFocusId}`,
          }
        : null);
    if (!topic) return null;

    const switched = Boolean(lastLearnTopic && lastLearnTopic.id !== topic.id);
    lastLearnTopic = topic;
    touchTopic(topic.id);
    syncActiveSideTopic();
    syncComposerCtx();
    const display = focusDisplayLabel(topic);
    mainTitle.textContent = display;
    if (mainEyebrow) {
      mainEyebrow.hidden = false;
      mainEyebrow.textContent = "Learn";
    }
    input.placeholder = `Ask about ${display}…`;
    if (switched) {
      mainTitle.classList.remove("is-focus-flash");
      void mainTitle.offsetWidth;
      mainTitle.classList.add("is-focus-flash");
    }
    return topic;
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

    if (!opts.hideOutgoing) addBubble(text, "out", { displayText: opts.displayText });
    input.value = "";
    const topicHint = opts.learnTopic?.label || lastLearnTopic?.label || "";
    const thinkKind = mode === "learn" ? (opts.fresh ? "explain" : "answer") : "chat";
    showThinking({
      kind: thinkKind,
      topic: opts.fresh ? topicHint : "",
    });
    const thinkStarted = Date.now();

    try {
      // Soft focus only - server resolves typos + topic switches
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
      if (!res.ok) {
        hideThinking();
        addErrorBubble(data.error || "Couldn’t get a reply. Try again.", () =>
          sendMessage(text, opts)
        );
        setStatus("Online", true);
        return;
      }
      // Switch header as soon as we know the topic - before the answer types out
      let topic = null;
      if (mode === "learn") {
        topic = applyLearnFocus(data, { topic: opts.learnTopic });
      }
      await holdThinking(thinkStarted, data.replies);
      hideThinking();
      await addInboundReplies(data.replies || [], { teach: mode === "learn" });
      if (mode === "learn" && data.replies?.length) {
        topic =
          applyLearnFocus(data, { topic: opts.learnTopic }) ||
          topic ||
          lastLearnTopic ||
          recommendedTopic();
        appendLearnQuizNudge(topic);
      }
      setStatus("Online", true);
      announce("Reca replied");
    } catch (_) {
      hideThinking();
      addErrorBubble("Couldn’t send that. Check your connection, then try again.", () =>
        sendMessage(text, opts)
      );
      setStatus("Offline", false);
    } finally {
      setComposerBusy(false);
      syncSendEnabled();
      input.focus();
    }
  }

  function resetQuizChrome() {
    const shell = document.querySelector(".quiz__shell");
    if (shell) shell.classList.remove("quiz__shell--summary");
    const quizLabel = document.getElementById("quizLabel");
    if (quizLabel) quizLabel.hidden = false;
    if (quizQuestion) quizQuestion.hidden = false;
  }

  async function startRevise(item, opts = {}) {
    if (!item?.id) return;
    if (!phone) await startSession(false);
    clearReviseTip();

    const limit = opts.limit != null ? Number(opts.limit) : 5;

    setNavActive("revise");
    feature = "revise";
    app.dataset.feature = "revise";
    app.dataset.mode = "quiz";
    activeQuizTopic = item;
    touchTopic(item.id);
    syncActiveSideTopic();
    syncComposerCtx();
    markValue();
    if (mainEyebrow) {
      mainEyebrow.hidden = false;
      mainEyebrow.textContent = `${reviseExamBody}-style`;
    }
    mainTitle.textContent = item.label;
    showOnly(quizPanel);
    mainDock.hidden = false;
    input.placeholder = "Type your answer…";
    resetQuizChrome();
    quizFeedback.hidden = true;
    quizFeedback.replaceChildren();
    quizSummary.hidden = true;
    quizSummary.replaceChildren();
    hideLinkBanner(false);
    quizOptions.innerHTML = "";
    quizQuestion.textContent =
      limit <= 2 ? "Building 2 quick questions…" : "Loading your quiz…";
    quizLocked = true;
    setStatus("Loading…", true);
    const quizThinkStarted = Date.now();

    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          topicId: item.id,
          limit,
          examBody: reviseExamBody,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.question) throw new Error(data.error || "Failed");
      await holdThinking(quizThinkStarted, [{ text: data.question?.text || "" }]);
      await renderQuestion(data.question);
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
      note.textContent = "Check your connection, then retry, or pick another topic.";
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

  async function renderQuestion(q) {
    if (!q) return;
    const quizLabel = document.getElementById("quizLabel");
    const quizComposerHint = document.getElementById("quizComposerHint");
    resetQuizChrome();
    quizSummary.hidden = true;
    quizFeedback.hidden = true;
    if (quizMemory) {
      quizMemory.hidden = true;
      quizMemory.textContent = "";
    }
    if (quizEndBtn) quizEndBtn.hidden = false;
    if (quizComposerHint) {
      quizComposerHint.hidden = false;
      const style = q.examBody || reviseExamBody || "WAEC";
      quizComposerHint.textContent =
        q.total <= 2
          ? `${style}-style · ${q.total} quick checks · End anytime.`
          : `${style}-style · ${q.total} questions · End anytime. Tap or type.`;
    }
    quizTopic.textContent = `${q.examBody || reviseExamBody || "WAEC"} · ${q.subject} · ${q.topicLabel}`;
    quizCount.textContent = `${q.index} of ${q.total}`;
    if (quizLabel) quizLabel.textContent = `Question ${q.index}`;
    if (quizBar) {
      const pct = Math.max(4, Math.round((q.index / Math.max(q.total, 1)) * 100));
      quizBar.style.width = `${pct}%`;
    }
    if (quizDiagram && quizDiagramImg) {
      if (q.diagram?.src) {
        quizDiagram.hidden = false;
        quizDiagram.removeAttribute("hidden");
        quizDiagram.style.display = "block";
        quizDiagramImg.removeAttribute("hidden");
        quizDiagramImg.src = assetUrl(q.diagram.src);
        quizDiagramImg.alt = q.diagram.alt || q.diagram.caption || "Topic diagram";
        quizDiagramImg.decoding = "async";
        quizDiagramImg.loading = "eager";
        quizDiagramImg.width = 640;
        quizDiagramImg.height = 360;
        quizDiagramImg.onerror = () => {
          quizDiagram.hidden = true;
          quizDiagram.style.display = "";
        };
        if (quizDiagramCap) quizDiagramCap.textContent = q.diagram.caption || "";
        quizDiagram.style.animation = "none";
        void quizDiagram.offsetWidth;
        quizDiagram.style.animation = "";
      } else {
        quizDiagram.hidden = true;
        quizDiagram.style.display = "";
        quizDiagramImg.removeAttribute("src");
        quizDiagramImg.onerror = null;
        if (quizDiagramCap) quizDiagramCap.textContent = "";
      }
    }
    quizQuestion.textContent = "";
    quizQuestion.classList.add("is-streaming");
    quizOptions.innerHTML = "";
    quizOptions.classList.add("is-waiting");

    const generation = streamGeneration;
    const caret = document.createElement("span");
    caret.className = "msg__caret";
    caret.setAttribute("aria-hidden", "true");
    quizQuestion.appendChild(caret);
    await typeText(quizQuestion, q.text, caret, generation);
    quizQuestion.classList.remove("is-streaming");

    const letters = "ABCDEFGH";
    (q.options || []).forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz__option";
      btn.style.setProperty("--i", String(i));
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
    quizOptions.classList.remove("is-waiting");
    const body = document.querySelector(".main__body");
    if (body) body.scrollTop = 0;
    announce(`Question ${q.index} of ${q.total}`);
  }

  function showQuizSummary(summary) {
    quizSummary.hidden = false;
    quizSummary.replaceChildren();
    const shell = quizSummary.closest(".quiz__shell");
    if (shell) shell.classList.add("quiz__shell--summary");
    if (quizEndBtn) quizEndBtn.hidden = true;
    if (quizMemory) quizMemory.hidden = true;
    const quizComposerHint = document.getElementById("quizComposerHint");
    if (quizComposerHint) quizComposerHint.hidden = true;
    const quizLabel = document.getElementById("quizLabel");
    if (quizLabel) quizLabel.hidden = true;
    quizFeedback.hidden = true;
    quizOptions.innerHTML = "";
    quizQuestion.textContent = "";
    quizQuestion.hidden = true;

    const scoreNum =
      typeof summary.score === "number" && typeof summary.total === "number"
        ? summary.score
        : null;
    const totalNum = typeof summary.total === "number" ? summary.total : null;
    const missed =
      scoreNum != null && totalNum != null ? Math.max(0, totalNum - scoreNum) : null;
    const pct =
      scoreNum != null && totalNum != null && totalNum > 0
        ? Math.round((scoreNum / totalNum) * 100)
        : null;

    const badge = document.createElement("p");
    badge.className = "quiz__summary-badge";
    badge.textContent = "Quiz complete";
    quizSummary.appendChild(badge);

    if (scoreNum != null && totalNum != null) {
      const hero = document.createElement("div");
      hero.className = "quiz__summary-hero";
      const scoreEl = document.createElement("p");
      scoreEl.className = "quiz__summary-score";
      scoreEl.textContent = `${scoreNum}/${totalNum}`;
      hero.appendChild(scoreEl);
      if (pct != null) {
        const pctEl = document.createElement("p");
        pctEl.className =
          "quiz__summary-pct" +
          (pct >= 70 ? " is-good" : pct < 40 ? " is-low" : "");
        pctEl.textContent = `${pct}%`;
        hero.appendChild(pctEl);
      }
      quizSummary.appendChild(hero);
    }

    const h = document.createElement("p");
    h.className = "quiz__summary-title";
    h.textContent = summary.message || "Session finished.";
    quizSummary.appendChild(h);

    if (missed > 0) {
      const note = document.createElement("p");
      note.className = "quiz__summary-note";
      note.textContent =
        `${missed} miss${missed === 1 ? "" : "es"} saved to Progress. Reca can bring them back later.`;
      quizSummary.appendChild(note);
    } else if (scoreNum != null && totalNum != null && totalNum > 0) {
      const note = document.createElement("p");
      note.className = "quiz__summary-note quiz__summary-note--ok";
      note.textContent = "Clean run. Check Progress anytime to stay sharp.";
      quizSummary.appendChild(note);
    }

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

    links.append(toLearn);
    if (!isGuestSession() && /^\+\d{10,15}$/.test(String(phone || ""))) {
      const onWa = makeContinueWaButton(summary.topicLabel || summary.topicId || "photosynthesis");
      onWa.className = "learn-cta__link";
      onWa.textContent = "Continue on WhatsApp";
      links.append(onWa);
    }
    actions.append(toProgress, again, links);
    quizSummary.appendChild(actions);
    mainDock.hidden = true;
    announce(summary.message || "Quiz complete");
    softLoadProgressCache();
    flushLinkBanner();

    const name = (localStorage.getItem("reca_display_name") || "Student").trim();
    const topic = summary.topicLabel || "your topic";
    const score =
      scoreNum != null && totalNum != null ? `${scoreNum}/${totalNum}` : null;
    sendWhatsAppAlert(
      score
        ? `Great job, ${name}! You finished a Reca web quiz on ${topic} (${score}). Keep going. Message Reca anytime.`
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

      if (!data.feedback.correct && data.feedback.correctAnswer) {
        const fix = document.createElement("p");
        fix.className = "quiz__feedback-fix";
        const k = document.createElement("span");
        k.className = "quiz__feedback-fix-k";
        k.textContent = "Answer";
        fix.append(k, document.createTextNode(` ${data.feedback.correctAnswer}`));
        quizFeedback.appendChild(fix);
      }

      if (!data.done && data.question) {
        const next = document.createElement("p");
        next.className = "quiz__feedback-next";
        next.textContent = data.feedback.correct ? "Next question…" : "Next question in a moment…";
        quizFeedback.appendChild(next);
      }

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
        // Defer WhatsApp link prompt - never mid-question
        pendingLinkPrompt = true;
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
        setTimeout(async () => {
          await renderQuestion(data.question);
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
      const res = await fetch("/api/topics?limit=2000");
      const data = await res.json();
      if (data.topics?.length) TOPICS = data.topics;
    } catch (_) {
      /* fallback */
    }
    renderHubs();
  }

  async function startSession(fresh = false) {
    if (fresh || wantsGuest) {
      localStorage.removeItem("reca_phone");
      localStorage.removeItem("reca_signed_in");
      localStorage.removeItem("reca_email");
      if (wantsGuest) localStorage.setItem("reca_guest", "1");
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
        targetUniversity: localStorage.getItem("reca_target_university") || undefined,
        uniUpdatesEnabled: localStorage.getItem("reca_uni_updates") !== "0",
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
    if (data.targetUniversity) {
      localStorage.setItem("reca_target_university", data.targetUniversity);
    }
    if (data.uniUpdatesEnabled === false) {
      localStorage.setItem("reca_uni_updates", "0");
    } else if (data.uniUpdatesEnabled) {
      localStorage.setItem("reca_uni_updates", "1");
    }
    syncUniSettingsUi();
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
        const proactive = m.type === "resurface" || m.type === "briefing" || m.type === "uni-update";
        if (proactive) {
          enqueueNudge(m);
        } else {
          // Non-proactive bot pushes stay in thread if already chatting
          if (app.dataset.mode === "chat" && !thread.hidden) {
            addBubbleStreamed(m.text, { id: m.id, at: m.at }).catch(() => {
              addBubble(m.text, "in", { id: m.id, at: m.at });
            });
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
      if (nudge.type === "uni-update") {
        if (nudge.sourceUrl) {
          window.open(nudge.sourceUrl, "_blank", "noopener,noreferrer");
        }
        if (nudge.id) {
          saveUnreadNudges(loadUnreadNudges().filter((n) => n.id !== nudge.id));
          syncProgressBadge();
        }
        return;
      }
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
      // Resurface: answer THIS miss - not a full quiz session
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

  /* --- Nav coach tips (desktop hover / keyboard) --- */
  const NAV_TIPS = {
    learn: {
      eyebrow: "Learn",
      title: "Learn anything on the syllabus",
      text: "Ask in plain English. Reca explains in exam language, then you can take a quick check.",
      steps: ["Ask", "Explain", "Quick check"],
      icon: "book-open-01",
      cta: "Start asking",
      ctaAction: "focus",
    },
    revise: {
      eyebrow: "Revise",
      title: "Quiz yourself, one at a time",
      text: "Short exam-style questions. Miss one and Reca remembers. That’s the whole point.",
      steps: ["Pick a topic", "Answer", "Get scored"],
      icon: "quiz-03",
      cta: "Open Revise",
      ctaAction: "go",
    },
    progress: {
      eyebrow: "Progress",
      title: "What Reca remembers",
      text: "Weak topics and due recalls live here. Come back when you want to clear a miss.",
      steps: ["Misses", "Due recalls", "Strong topics"],
      icon: "analytics-01",
      cta: "See Progress",
      ctaAction: "go",
    },
  };

  const navTip = document.getElementById("navTip");
  const navTipHero = document.getElementById("navTipHero");
  const navTipGlyph = document.getElementById("navTipGlyph");
  const navTipEyebrow = document.getElementById("navTipEyebrow");
  const navTipTitle = document.getElementById("navTipTitle");
  const navTipText = document.getElementById("navTipText");
  const navTipSteps = document.getElementById("navTipSteps");
  const navTipCta = document.getElementById("navTipCta");
  const navTipDismiss = document.getElementById("navTipDismiss");

  let navTipKey = null;
  let navTipAnchor = null;
  let navTipOpenTimer = null;
  let navTipCloseTimer = null;
  const dismissedNavTips = new Set(
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("reca_nav_tips_dismissed") || "[]");
      } catch (_) {
        return [];
      }
    })()
  );

  function canShowNavTips() {
    if (!navTip) return false;
    if (prefersReducedMotion()) {
      /* still allow tips - just no fancy motion via CSS */
    }
    try {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    } catch (_) {
      return window.innerWidth >= 900;
    }
  }

  function persistDismissedTips() {
    try {
      sessionStorage.setItem(
        "reca_nav_tips_dismissed",
        JSON.stringify([...dismissedNavTips])
      );
    } catch (_) {
      /* ignore */
    }
  }

  function fillNavTip(key) {
    const tip = NAV_TIPS[key];
    if (!tip || !navTip) return;
    if (navTipHero) navTipHero.dataset.tip = key;
    if (navTipEyebrow) navTipEyebrow.textContent = tip.eyebrow;
    if (navTipTitle) navTipTitle.textContent = tip.title;
    if (navTipText) navTipText.textContent = tip.text;
    if (navTipCta) navTipCta.textContent = tip.cta;
    if (navTipSteps) {
      navTipSteps.replaceChildren();
      (tip.steps || []).forEach((label) => {
        const chip = document.createElement("span");
        chip.className = "nav-tip__step";
        chip.textContent = label;
        navTipSteps.appendChild(chip);
      });
    }
    if (navTipGlyph) {
      navTipGlyph.replaceChildren(iconEl(tip.icon || "book-01"));
    }
  }

  function positionNavTip(anchor) {
    if (!navTip || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const tipWidth = navTip.offsetWidth || 296;
    const tipHeight = navTip.offsetHeight || 320;
    const gap = 14;
    let left = rect.right + gap;
    let top = rect.top + rect.height / 2 - tipHeight / 2;

    // Keep on screen
    const pad = 12;
    if (left + tipWidth > window.innerWidth - pad) {
      left = Math.max(pad, rect.left - tipWidth - gap);
    }
    top = Math.max(pad, Math.min(top, window.innerHeight - tipHeight - pad));

    const arrowY = Math.min(
      tipHeight - 28,
      Math.max(22, rect.top + rect.height / 2 - top - 7)
    );
    navTip.style.setProperty("--tip-arrow-y", `${arrowY}px`);
    navTip.style.left = `${Math.round(left)}px`;
    navTip.style.top = `${Math.round(top)}px`;
  }

  function hideNavTip(immediate) {
    if (navTipOpenTimer) {
      clearTimeout(navTipOpenTimer);
      navTipOpenTimer = null;
    }
    if (navTipCloseTimer) {
      clearTimeout(navTipCloseTimer);
      navTipCloseTimer = null;
    }
    if (!navTip || navTip.hidden) {
      navTipKey = null;
      navTipAnchor = null;
      return;
    }
    const finish = () => {
      navTip.hidden = true;
      navTip.classList.remove("is-open");
      navTip.setAttribute("aria-hidden", "true");
      if (navTipAnchor) navTipAnchor.removeAttribute("aria-describedby");
      navTipKey = null;
      navTipAnchor = null;
    };
    if (immediate || prefersReducedMotion()) {
      finish();
      return;
    }
    navTip.classList.remove("is-open");
    navTipCloseTimer = setTimeout(finish, 180);
  }

  function showNavTip(key, anchor) {
    if (!canShowNavTips() || !navTip || !anchor) return;
    if (dismissedNavTips.has(key)) return;
    if (navTipKey === key && !navTip.hidden) {
      positionNavTip(anchor);
      return;
    }
    if (navTipCloseTimer) {
      clearTimeout(navTipCloseTimer);
      navTipCloseTimer = null;
    }
    if (navTipAnchor && navTipAnchor !== anchor) {
      navTipAnchor.removeAttribute("aria-describedby");
    }
    navTipKey = key;
    navTipAnchor = anchor;
    fillNavTip(key);
    navTip.hidden = false;
    navTip.setAttribute("aria-hidden", "false");
    anchor.setAttribute("aria-describedby", "navTip");
    // Measure then place, then animate in
    positionNavTip(anchor);
    requestAnimationFrame(() => {
      positionNavTip(anchor);
      navTip.classList.add("is-open");
    });
  }

  function scheduleNavTip(key, anchor) {
    if (!canShowNavTips()) return;
    if (dismissedNavTips.has(key)) return;
    if (navTipCloseTimer) {
      clearTimeout(navTipCloseTimer);
      navTipCloseTimer = null;
    }
    if (navTipOpenTimer) clearTimeout(navTipOpenTimer);
    // Intent delay - don’t flash on a quick mouse pass (#5)
    navTipOpenTimer = setTimeout(() => showNavTip(key, anchor), 360);
  }

  function scheduleHideNavTip() {
    if (navTipOpenTimer) {
      clearTimeout(navTipOpenTimer);
      navTipOpenTimer = null;
    }
    if (navTipCloseTimer) clearTimeout(navTipCloseTimer);
    navTipCloseTimer = setTimeout(() => hideNavTip(false), 220);
  }

  document.querySelectorAll(".side__nav .nav-item").forEach((btn) => {
    const key = btn.dataset.nav;
    if (!NAV_TIPS[key]) return;
    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      scheduleNavTip(key, btn);
    });
    btn.addEventListener("pointerleave", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      scheduleHideNavTip();
    });
    btn.addEventListener("focus", () => scheduleNavTip(key, btn));
    btn.addEventListener("blur", () => {
      // Don’t hide if focus moved into the tip
      requestAnimationFrame(() => {
        if (navTip && navTip.contains(document.activeElement)) return;
        scheduleHideNavTip();
      });
    });
    btn.addEventListener("click", () => hideNavTip(true));
  });

  if (navTip) {
    navTip.addEventListener("pointerenter", () => {
      if (navTipCloseTimer) {
        clearTimeout(navTipCloseTimer);
        navTipCloseTimer = null;
      }
    });
    navTip.addEventListener("pointerleave", () => scheduleHideNavTip());
  }

  if (navTipCta) {
    navTipCta.addEventListener("click", () => {
      const key = navTipKey;
      const tip = NAV_TIPS[key];
      hideNavTip(true);
      if (!tip) return;
      if (tip.ctaAction === "focus") {
        setFeature("learn");
        input.focus();
        return;
      }
      setFeature(key);
      if (key === "revise") {
        const reviseSearchEl = document.getElementById("reviseSearch");
        if (reviseSearchEl) reviseSearchEl.focus();
      }
    });
  }

  if (navTipDismiss) {
    navTipDismiss.addEventListener("click", () => {
      if (navTipKey) {
        dismissedNavTips.add(navTipKey);
        persistDismissedTips();
      }
      hideNavTip(true);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navTip && !navTip.hidden) {
      hideNavTip(true);
    }
  });

  window.addEventListener(
    "resize",
    () => {
      if (navTip && !navTip.hidden && navTipAnchor) positionNavTip(navTipAnchor);
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (navTip && !navTip.hidden) hideNavTip(true);
    },
    true
  );

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
    progressEmptyCta.addEventListener("click", () => {
      const rec = recommendedTopic();
      if (rec) startRevise(rec);
      else setFeature("revise");
    });
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

  const reviseExamSeg = document.getElementById("reviseExamSeg");
  if (reviseExamSeg) {
    reviseExamSeg.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-exam]");
      if (!btn) return;
      setReviseExamBody(btn.getAttribute("data-exam"));
    });
    reviseExamSeg.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setReviseExamBody(reviseExamBody === "WAEC" ? "JAMB" : "WAEC");
      const next = reviseExamSeg.querySelector(
        `[data-exam="${reviseExamBody}"]`
      );
      next?.focus();
    });
  }

  const reviseSnapBtn = document.getElementById("reviseSnapBtn");
  if (reviseSnapBtn && imageUpload) {
    hydrateIcons(reviseSnapBtn);
    reviseSnapBtn.addEventListener("click", () => {
      if (busy) return;
      setFeature("learn");
      imageUpload.click();
    });
  }

  syncExamSeg();

  document.querySelectorAll("[data-revise]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.getAttribute("data-revise");
      if (!label) return;
      handleReviseAsk(label);
    });
  });
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
      const linked = /^\+\d{10,15}$/.test((localStorage.getItem("reca_phone") || "").trim());
      if (linked) {
        waHint.textContent = num
          ? `Linked. Misses, daily plans, and uni alerts hit this chat and the web toast. Reca number: ${num}.`
          : "Linked. Misses, daily plans, and uni alerts hit WhatsApp and the web toast.";
      } else if (num) {
        waHint.textContent = `Link your number above for phone nudges. Web popups still work. Message Reca at ${num}.`;
      } else {
        waHint.textContent =
          "Link your number for WhatsApp nudges (practice, revise, uni updates). Web popups still work without it.";
      }
      const link = document.getElementById("waContinueLink");
      if (link) {
        link.href = continueOnWhatsAppUrl(
          lastLearnTopic?.label || activeQuizTopic?.label || "photosynthesis"
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
      handleReviseAsk(text);
      return;
    }
    // Learn: freeform ask - server resolves topic (including typos); don't pin UI topic
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
    const thinkStarted = Date.now();

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
      if (!res.ok) {
        hideThinking();
        addErrorBubble(data.error || "Couldn’t read that image. Try a clearer photo.", () =>
          uploadPastQuestion(file)
        );
        setStatus("Online", true);
        return;
      }
      await holdThinking(thinkStarted, data.replies);
      hideThinking();
      await addInboundReplies(data.replies || [], { teach: true });
      if (data.topic) {
        applyLearnFocus({
          learnFocusId: data.topic.id,
          learnFocusLabel: data.topic.label,
          learnFocusSubject: data.topic.subject,
        });
        appendLearnQuizNudge(lastLearnTopic);
      }
      clearPendingUpload();
      input.value = "";
      setStatus("Online", true);
      announce("Reca explained your photo");
    } catch (_) {
      hideThinking();
      addErrorBubble("Couldn’t upload that. Check your connection, then try again.", () =>
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
        addBubble("That photo is too large. Try one under 6MB.", "in");
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
      // Auto-send for fest demo - one tap from camera roll to explain
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

  const composerFocusChip = document.getElementById("composerFocusChip");
  const composerQuizChip = document.getElementById("composerQuizChip");
  const composerCtxClear = document.getElementById("composerCtxClear");
  if (composerFocusChip) {
    composerFocusChip.addEventListener("click", () => {
      const topic = lastLearnTopic || activeQuizTopic;
      if (!topic) return;
      input?.focus();
      if (feature === "learn" && app.dataset.mode === "welcome") {
        startLearn(topic);
      }
    });
  }
  if (composerQuizChip) {
    composerQuizChip.addEventListener("click", () => {
      if (lastLearnTopic?.id) startRevise(lastLearnTopic);
    });
  }
  if (composerCtxClear) {
    composerCtxClear.addEventListener("click", clearComposerFocus);
  }
  hydrateIcons(document.getElementById("composerCtx") || document);

  loadConfig()
    .then(() => loadTopics())
    .then(() => startSession(wantsGuest))
    .then(() => {
      if (wantsGuest) {
        const clean = new URL(location.href);
        clean.searchParams.delete("guest");
        history.replaceState({}, "", clean);
      }
      refreshWhatsAppStatus();
      setFeature("learn");
      syncSendEnabled();
      softLoadProgressCache();
    });
})();
