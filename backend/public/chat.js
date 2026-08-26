(() => {
  const TOPICS = [
    { label: "Photosynthesis", send: "explain photosynthesis" },
    { label: "Osmosis", send: "explain osmosis" },
    { label: "Respiration", send: "explain aerobic respiration" },
    { label: "Acids & bases", send: "explain acids and bases simply" },
  ];

  const ABOUT =
    "I’m Reca — your WAEC & JAMB study companion. Send a topic, I’ll explain it simply and ask two quick questions. If you miss one, I remember it and bring it back later so it sticks.";

  const app = document.getElementById("app");
  const thread = document.getElementById("thread");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const statusLine = document.getElementById("statusLine");
  const topicChips = document.getElementById("topicChips");
  const sideTopics = document.getElementById("sideTopics");
  const mainTitle = document.getElementById("mainTitle");
  const mainEyebrow = document.getElementById("mainEyebrow");
  const newSessionBtn = document.getElementById("newSessionBtn");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  const seen = new Set();
  let phone = localStorage.getItem("reca_phone") || "";
  let lastEventId = "";
  let busy = false;
  let activeTopic = "";

  function timeLabel(ts = Date.now()) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function closeMobileNav() {
    app.classList.remove("is-nav-open");
  }

  function enterChatMode(title) {
    app.dataset.mode = "chat";
    thread.hidden = false;
    if (title) {
      mainTitle.textContent = title;
      mainEyebrow.textContent = "Current topic";
    }
  }

  function topicTitleFromSend(send) {
    const found = TOPICS.find((t) => t.send === send);
    if (found) return found.label;
    if (/how am i doing/i.test(send)) return "Progress";
    if (/explain\s+(.+)/i.test(send)) {
      const m = send.match(/explain\s+(.+)/i);
      return m[1].replace(/\bsimply\b/i, "").trim().replace(/^\w/, (c) => c.toUpperCase());
    }
    return "Revision";
  }

  function addBubble(text, role = "in", meta = {}) {
    if (meta.id && seen.has(meta.id)) return;
    if (meta.id) seen.add(meta.id);

    const el = document.createElement("div");
    el.className =
      role === "out" ? "msg msg--out" : role === "system" ? "msg msg--system" : "msg msg--in";
    el.textContent = text;
    if (role !== "system") {
      const t = document.createElement("span");
      t.className = "msg__time";
      t.textContent = timeLabel(meta.at);
      el.appendChild(t);
    }
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
  }

  function setActiveSideTopic(label) {
    activeTopic = label;
    sideTopics.querySelectorAll(".side-topic").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.label === label);
    });
  }

  function renderTopics() {
    topicChips.innerHTML = "";
    sideTopics.innerHTML = "";

    TOPICS.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = item.label;
      chip.addEventListener("click", () => sendMessage(item.send));
      topicChips.appendChild(chip);

      const side = document.createElement("button");
      side.type = "button";
      side.className = "side-topic";
      side.dataset.label = item.label;
      side.textContent = item.label;
      side.addEventListener("click", () => {
        closeMobileNav();
        sendMessage(item.send);
      });
      sideTopics.appendChild(side);
    });
  }

  function setNavActive(name) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.nav === name);
    });
  }

  async function startSession(fresh = false) {
    if (fresh) {
      localStorage.removeItem("reca_phone");
      phone = "";
      lastEventId = "";
      seen.clear();
      thread.innerHTML = "";
      app.dataset.mode = "welcome";
      thread.hidden = true;
      mainTitle.textContent = "Ready to revise?";
      mainEyebrow.textContent = "WAEC & JAMB";
      setActiveSideTopic("");
      setNavActive("revise");
    }

    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone || undefined }),
    });
    const data = await res.json();
    phone = data.phone;
    localStorage.setItem("reca_phone", phone);
    statusLine.textContent = "Online";
  }

  async function sendMessage(text) {
    if (!text || busy) return;
    busy = true;
    const title = topicTitleFromSend(text);
    enterChatMode(title);
    setActiveSideTopic(TOPICS.find((t) => t.send === text)?.label || activeTopic);
    if (/how am i doing/i.test(text)) setNavActive("progress");
    else setNavActive("revise");

    addBubble(text, "out");
    input.value = "";
    closeMobileNav();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, body: text }),
      });
      const data = await res.json();
      (data.replies || []).forEach((r) => addBubble(r, "in"));
    } catch (_) {
      addBubble("Couldn’t send that. Try again in a moment.", "system");
    } finally {
      busy = false;
      input.focus();
    }
  }

  async function pollEvents() {
    if (!phone || app.dataset.mode !== "chat") return;
    try {
      const res = await fetch(
        `/api/events?phone=${encodeURIComponent(phone)}&after=${encodeURIComponent(lastEventId)}`
      );
      const data = await res.json();
      for (const m of data.messages || []) {
        addBubble(m.text, "in", m);
        lastEventId = m.id;
      }
    } catch (_) {
      /* ignore */
    }
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nav = btn.dataset.nav;
      closeMobileNav();
      if (nav === "revise") {
        setNavActive("revise");
        input.focus();
        return;
      }
      if (nav === "progress") {
        sendMessage("how am I doing in Biology?");
        return;
      }
      if (nav === "about") {
        enterChatMode("How Reca works");
        setNavActive("about");
        addBubble(ABOUT, "in");
      }
    });
  });

  newSessionBtn.addEventListener("click", () => {
    closeMobileNav();
    startSession(true).then(() => input.focus());
  });

  mobileMenuBtn.addEventListener("click", () => {
    app.classList.toggle("is-nav-open");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value.trim());
  });

  renderTopics();
  startSession(false).then(() => setInterval(pollEvents, 1500));
  input.focus();
})();
