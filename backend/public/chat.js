(() => {
  const FALLBACK_TOPICS = [
    { id: "photosynthesis", label: "Photosynthesis", subject: "Biology", send: "explain photosynthesis", icon: "sun-03" },
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
  let quizLocked = false;

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
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    lungs:
      '<path d="M6.081 22c-1.605 0-2.888-1.37-2.708-2.966l1.735-15.3A2.5 2.5 0 0 1 7.59 1.5h.82a2.5 2.5 0 0 1 2.482 2.234l.75 6.516"/><path d="M17.919 22c1.605 0 2.888-1.37 2.708-2.966l-1.735-15.3A2.5 2.5 0 0 0 16.41 1.5h-.82a2.5 2.5 0 0 0-2.482 2.234l-.75 6.516"/><path d="M12 10v12"/>',
  };

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
      if (el.classList.contains("brand__mark") || el.classList.contains("side__avatar")) {
        el.replaceChildren(svg);
        el.removeAttribute("data-icon");
        return;
      }
      el.replaceWith(svg);
    });
  }

  hydrateIcons();

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
  }

  function scrollThread() {
    thread.scrollTop = thread.scrollHeight;
  }

  function setComposerBusy(isBusy) {
    busy = isBusy;
    app.dataset.busy = isBusy ? "true" : "false";
    input.disabled = isBusy;
    sendBtn.disabled = isBusy;
    sendBtn.setAttribute("aria-busy", isBusy ? "true" : "false");
    sendBtn.replaceChildren(iconEl(isBusy ? "rotate-clockwise" : "sent", "composer__send-ico"));
  }

  function setNavActive(name) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.nav === name);
    });
  }

  function showOnly(...els) {
    [learnWelcome, reviseWelcome, quizPanel, progressPanel, thread].forEach((el) => {
      if (!el) return;
      const on = els.includes(el);
      el.hidden = !on;
      el.style.display = on ? "" : "none";
    });
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
        document.createTextNode(" Learn topics")
      );
      mainEyebrow.textContent = "Learn · WAEC & JAMB";
      mainTitle.textContent = "Ask Reca";
      app.dataset.mode = "welcome";
      showOnly(learnWelcome);
      mainDock.hidden = false;
      input.placeholder = "Ask Reca to explain a topic…";
      renderSideTopics("learn");
      input.focus();
      return;
    }

    if (name === "revise") {
      sideTopicsLabel.replaceChildren(
        iconEl("quiz-03"),
        document.createTextNode(" Revise topics")
      );
      mainEyebrow.textContent = "Revise · WAEC & JAMB";
      mainTitle.textContent = "Answer questions";
      app.dataset.mode = "revise-hub";
      showOnly(reviseWelcome);
      mainDock.hidden = false;
      input.placeholder = "Or type your answer here…";
      renderSideTopics("revise");
      input.focus();
      return;
    }

    if (name === "progress") {
      sideTopicsLabel.replaceChildren(
        iconEl("analytics-01"),
        document.createTextNode(" Weak topics")
      );
      mainEyebrow.textContent = "Progress · WAEC & JAMB";
      mainTitle.textContent = "How you're doing";
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

  function addBubble(text, role = "in", meta = {}) {
    if (meta.id && seen.has(meta.id)) return;
    if (meta.id) seen.add(meta.id);

    const turn = document.createElement("div");
    turn.className = role === "out" ? "turn turn--out" : "turn turn--in";

    if (role === "in") {
      const avatar = document.createElement("div");
      avatar.className = "turn__avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.appendChild(iconEl("mortarboard-01"));
      turn.appendChild(avatar);
    }

    const stack = document.createElement("div");
    stack.className = "turn__stack";
    const el = document.createElement("div");
    el.className = role === "out" ? "msg msg--out" : "msg msg--in";

    if (role === "in") el.appendChild(formatBody(text));
    else {
      const body = document.createElement("div");
      body.className = "msg__body";
      const p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
      el.appendChild(body);
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

  function showThinking(label) {
    hideThinking(true);
    thinkingTimer = setTimeout(() => {
      thinkingEl = document.createElement("div");
      thinkingEl.className = "turn turn--in turn--thinking";
      const avatar = document.createElement("div");
      avatar.className = "turn__avatar";
      avatar.appendChild(iconEl("mortarboard-01"));
      const bubble = document.createElement("div");
      bubble.className = "thinking";
      const dots = document.createElement("span");
      dots.className = "thinking__dots";
      for (let i = 0; i < 3; i++) dots.appendChild(document.createElement("span"));
      const lab = document.createElement("span");
      lab.className = "thinking__label";
      lab.textContent = label || "Reca is thinking…";
      bubble.append(dots, lab);
      thinkingEl.append(avatar, bubble);
      thread.appendChild(thinkingEl);
      scrollThread();
    }, 120);
  }

  function hideThinking() {
    if (thinkingTimer) clearTimeout(thinkingTimer);
    thinkingTimer = null;
    if (thinkingEl) thinkingEl.remove();
    thinkingEl = null;
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
    list.slice(0, 40).forEach((item, index) => {
      const starter = document.createElement("button");
      starter.type = "button";
      starter.className = "empty-topic" + (index === 0 ? " is-recommended" : "");
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
        verb === "Revise" ? `${item.subject} · Practice` : `${item.subject} · Explain`;

      starter.append(icoWrap, label, meta);
      starter.addEventListener("click", () => onStart(item));
      container.appendChild(starter);
    });
  }

  const COLLAPSE_KEY = "reca.side.collapsed";

  function loadCollapsedSubjects() {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveCollapsedSubjects(map) {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(map));
  }

  function renderSideTopics(mode) {
    sideTopics.innerHTML = "";
    const query = mode === "revise" ? reviseQuery : learnQuery;
    const filter = mode === "revise" ? reviseFilter : learnFilter;
    let list =
      mode === "progress"
        ? (window.__progressWeak || []).map((t) => {
            const match = TOPICS.find((x) => x.id === t.topicId);
            return (
              match || {
                id: t.topicId,
                label: t.label,
                subject: t.subject,
                icon: "quiz-03",
              }
            );
          })
        : filtered(filter, query);

    if (mode === "progress" && !list.length) {
      list = filtered("All", "").slice(0, 12);
    }

    const bySubject = {};
    list.forEach((t) => {
      (bySubject[t.subject] ||= []).push(t);
    });
    const collapsed = loadCollapsedSubjects();
    Object.keys(bySubject)
      .sort()
      .forEach((subject) => {
        const group = document.createElement("div");
        group.className = "side-group";
        const isCollapsed = Boolean(collapsed[subject]);
        if (isCollapsed) group.classList.add("is-collapsed");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "side-group__toggle";
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
        toggle.innerHTML = `<span class="side-group__label">${subject}</span><span class="side-group__meta">${bySubject[subject].length}</span>`;
        const chev = iconEl("arrow-down-01", "side-group__chev");
        toggle.appendChild(chev);
        toggle.addEventListener("click", () => {
          const next = !group.classList.contains("is-collapsed");
          group.classList.toggle("is-collapsed", next);
          toggle.setAttribute("aria-expanded", String(!next));
          const map = loadCollapsedSubjects();
          if (next) map[subject] = true;
          else delete map[subject];
          saveCollapsedSubjects(map);
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
      return;
    }

    progressEmpty.hidden = true;
    progressBody.hidden = false;

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
      p.textContent = "Nothing flagged — keep revising to stay sharp.";
      progressNeeds.appendChild(p);
    } else {
      needs.forEach((t) => progressNeeds.appendChild(topicRow(t, "Revise")));
    }

    progressStrong.replaceChildren();
    if (!strong.length) {
      const p = document.createElement("p");
      p.className = "progress__hint";
      p.textContent = "No strong topics yet — a few correct answers will land here.";
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
      progressError.textContent = "Couldn’t load progress. Try again.";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "progress__cta";
      retry.textContent = "Retry";
      retry.addEventListener("click", () => loadProgress());
      progressError.appendChild(document.createElement("br"));
      progressError.appendChild(retry);
    }
  }

  function renderHubs() {
    renderSubjectBar(learnSubjects, learnFilter, (name) => {
      learnFilter = name;
      renderHubs();
    });
    renderSubjectBar(reviseSubjects, reviseFilter, (name) => {
      reviseFilter = name;
      renderHubs();
    });
    renderTopicCards(learnTopics, learnFilter, learnQuery, startLearn, "Learn");
    renderTopicCards(reviseTopics, reviseFilter, reviseQuery, startRevise, "Revise");
    renderSideTopics(feature === "revise" ? "revise" : feature === "progress" ? "progress" : "learn");
  }

  async function startLearn(item) {
    setNavActive("learn");
    feature = "learn";
    app.dataset.feature = "learn";
    app.dataset.mode = "chat";
    mainEyebrow.textContent = "Learn · Current topic";
    mainTitle.textContent = item.label;
    showOnly(thread);
    thread.innerHTML = "";
    mainDock.hidden = false;
    await sendMessage(item.send, { mode: "learn" });
  }

  async function startRevise(item) {
    if (!item?.id) return;
    if (!phone) await startSession(false);

    setNavActive("revise");
    feature = "revise";
    app.dataset.feature = "revise";
    app.dataset.mode = "quiz";
    mainEyebrow.textContent = "Revise · Your turn";
    mainTitle.textContent = item.label;
    showOnly(quizPanel);
    mainDock.hidden = false;
    input.placeholder = "Type your answer, or pick one above…";
    quizFeedback.hidden = true;
    quizSummary.hidden = true;
    quizSummary.replaceChildren();
    quizOptions.innerHTML = "";
    quizQuestion.textContent = "Loading question…";
    quizLocked = true;
    setStatus("Loading…", true);

    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, topicId: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.question) throw new Error(data.error || "Failed");
      renderQuestion(data.question);
      quizLocked = false;
      setStatus("Online", true);
      input.focus();
    } catch (err) {
      console.error("startRevise", err);
      quizQuestion.textContent = "Couldn’t start revise. Try again.";
      quizLocked = false;
      setStatus("Online", true);
      // Fall back to hub so user isn't stuck
      setTimeout(() => setFeature("revise"), 1200);
    }
  }

  function renderQuestion(q) {
    if (!q) return;
    quizSummary.hidden = true;
    quizFeedback.hidden = true;
    quizTopic.textContent = `${q.subject} · ${q.topicLabel}`;
    quizCount.textContent = `${q.index} / ${q.total}`;
    quizQuestion.textContent = q.text;
    quizOptions.innerHTML = "";
    (q.options || []).forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz__option";
      btn.textContent = opt;
      btn.addEventListener("click", () => submitQuizAnswer(opt));
      quizOptions.appendChild(btn);
    });
    announce(`Question ${q.index} of ${q.total}`);
  }

  async function submitQuizAnswer(answer) {
    if (!answer || quizLocked || busy) return;
    quizLocked = true;
    setComposerBusy(true);

    quizOptions.querySelectorAll("button").forEach((b) => {
      b.disabled = true;
      if (b.textContent === answer) b.classList.add("is-picked");
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
      quizFeedback.append(
        iconEl(data.feedback.correct ? "checkmark-circle-02" : "alert-circle"),
        document.createTextNode(" " + data.feedback.message)
      );

      quizOptions.querySelectorAll("button").forEach((b) => {
        if (normalize(b.textContent) === normalize(data.feedback.correctAnswer) ||
            data.feedback.correctAnswer.toLowerCase().includes(b.textContent.toLowerCase()) ||
            b.textContent.toLowerCase().includes(data.feedback.correctAnswer.toLowerCase().split("(")[0].trim())) {
          b.classList.add("is-correct");
        }
        if (b.classList.contains("is-picked") && !data.feedback.correct) {
          b.classList.add("is-wrong");
        }
      });

      input.value = "";

      if (data.done) {
        quizSummary.hidden = false;
        quizSummary.replaceChildren();
        const h = document.createElement("p");
        h.className = "quiz__summary-title";
        h.textContent = data.summary.message;
        const actions = document.createElement("div");
        actions.className = "quiz__summary-actions";
        const again = document.createElement("button");
        again.type = "button";
        again.className = "quiz__again";
        again.textContent = "Revise again";
        again.addEventListener("click", () => {
          const match =
            TOPICS.find((t) => t.id === data.summary.topicId) ||
            TOPICS.find((t) => t.label === data.summary.topicLabel) ||
            TOPICS[0];
          startRevise(match);
        });
        const toLearn = document.createElement("button");
        toLearn.type = "button";
        toLearn.className = "quiz__to-learn";
        toLearn.textContent = "Learn a topic";
        toLearn.addEventListener("click", () => setFeature("learn"));
        actions.append(again, toLearn);
        quizSummary.append(h, actions);
        mainDock.hidden = true;
        announce(data.summary.message);
      } else if (data.question) {
        setTimeout(() => {
          renderQuestion(data.question);
          quizLocked = false;
          input.focus();
        }, 900);
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

    addBubble(text, "out");
    input.value = "";
    showThinking(mode === "learn" ? "Explaining…" : "Reca is thinking…");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, body: text, mode }),
      });
      const data = await res.json();
      hideThinking();
      (data.replies || []).forEach((r) => addBubble(r, "in"));
      if (mode === "learn" && data.replies?.length) {
        const cta = document.createElement("div");
        cta.className = "learn-cta";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "learn-cta__btn";
        btn.append(iconEl("quiz-03"), document.createTextNode(" Revise this topic"));
        const topic =
          TOPICS.find((t) => t.send === text) ||
          TOPICS.find((t) => text.toLowerCase().includes(t.label.toLowerCase()));
        btn.addEventListener("click", () => topic && startRevise(topic));
        cta.appendChild(btn);
        thread.appendChild(cta);
        scrollThread();
      }
      setStatus("Online", true);
      announce("Reca replied");
    } catch (_) {
      hideThinking();
      addBubble("Couldn’t send that. Try again.", "in");
      setStatus("Offline", false);
    } finally {
      setComposerBusy(false);
      input.focus();
    }
  }

  async function loadTopics() {
    try {
      const res = await fetch("/api/topics?limit=200");
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
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone || undefined }),
    });
    const data = await res.json();
    phone = data.phone;
    localStorage.setItem("reca_phone", phone);
    setStatus("Online", true);
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
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

  mobileMenuBtn.addEventListener("click", () => {
    app.classList.toggle("is-nav-open");
  });

  if (progressEmptyCta) {
    progressEmptyCta.addEventListener("click", () => setFeature("revise"));
  }

  async function refreshWhatsAppStatus() {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      if (!waHint) return;
      if (data.configured && data.from) {
        const num = String(data.from).replace(/^whatsapp:/, "");
        waHint.textContent = `Sandbox ready. Message ${num} after linking your number.`;
      } else {
        waHint.textContent = "WhatsApp not configured on the server yet.";
      }
    } catch (_) {
      /* ignore */
    }
  }

  if (waForm && waPhone) {
    const saved = localStorage.getItem("reca_phone") || "";
    if (/^\+\d{10,15}$/.test(saved)) {
      waPhone.value = saved;
      if (userDisplayName) userDisplayName.textContent = saved;
    }
    waForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const raw = waPhone.value.trim();
      waStatus.hidden = false;
      waStatus.classList.remove("is-error");
      waStatus.textContent = "Linking…";
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
        if (userDisplayName) userDisplayName.textContent = phone;
        waStatus.textContent = data.joinHint || `Linked ${phone}`;
        setStatus("Online", true);
        if (feature === "progress") loadProgress();
      } catch (err) {
        waStatus.classList.add("is-error");
        waStatus.textContent = err.message || "Couldn’t link number";
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    if (feature === "revise" && app.dataset.mode === "quiz") {
      submitQuizAnswer(text);
      return;
    }
    if (feature === "revise" && app.dataset.mode === "revise-hub") {
      // typed topic name on revise hub — try match and start quiz
      const match = TOPICS.find(
        (t) =>
          text.toLowerCase().includes(t.label.toLowerCase()) ||
          t.aliases?.some((a) => text.toLowerCase().includes(a))
      );
      if (match) startRevise(match);
      else startRevise(TOPICS[0]);
      input.value = "";
      return;
    }
    sendMessage(text, { mode: feature === "learn" ? "learn" : "chat" });
  });

  loadTopics()
    .then(() => startSession(false))
    .then(() => {
      refreshWhatsAppStatus();
      setFeature("learn");
    });
})();
