(() => {
  const TOPICS = [
    { label: "Photosynthesis", send: "explain photosynthesis" },
    { label: "Osmosis", send: "explain osmosis" },
    { label: "Respiration", send: "explain aerobic respiration" },
    { label: "Acids & bases", send: "explain acids and bases simply" },
    { label: "How am I doing?", send: "how am I doing in Biology?" },
  ];

  const ABOUT =
    "I’m Reca — your WAEC & JAMB study companion. Send a topic, I’ll explain it simply and ask two quick questions. If you miss one, I remember it and bring it back later so it sticks.";

  const app = document.getElementById("app");
  const thread = document.getElementById("thread");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const statusLine = document.getElementById("statusLine");
  const topicChips = document.getElementById("topicChips");
  const menuBtn = document.getElementById("menuBtn");
  const menuPanel = document.getElementById("menuPanel");
  const suggestRow = document.getElementById("suggestRow");

  const seen = new Set();
  let phone = localStorage.getItem("reca_phone") || "";
  let lastEventId = "";
  let busy = false;

  function timeLabel(ts = Date.now()) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function setMenuOpen(open) {
    menuPanel.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function enterChatMode() {
    app.dataset.mode = "chat";
    thread.hidden = false;
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

  function renderTopics() {
    topicChips.innerHTML = "";
    TOPICS.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        setMenuOpen(false);
        sendMessage(item.send);
      });
      topicChips.appendChild(btn);
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
    }

    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone || undefined }),
    });
    const data = await res.json();
    phone = data.phone;
    localStorage.setItem("reca_phone", phone);
    statusLine.innerHTML = '<span class="pill__dot" aria-hidden="true"></span>Online';
  }

  async function sendMessage(text) {
    if (!text || busy) return;
    busy = true;
    enterChatMode();
    addBubble(text, "out");
    input.value = "";
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

  function onMenuAction(action) {
    setMenuOpen(false);
    if (action === "progress") {
      sendMessage("how am I doing in Biology?");
      return;
    }
    if (action === "topics") {
      suggestRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
      input.focus();
      return;
    }
    if (action === "about") {
      enterChatMode();
      addBubble(ABOUT, "in");
      return;
    }
    if (action === "new") {
      startSession(true).then(() => input.focus());
    }
  }

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(menuPanel.hidden);
  });

  menuPanel.addEventListener("click", (e) => {
    const item = e.target.closest("[data-action]");
    if (!item) return;
    onMenuAction(item.dataset.action);
  });

  document.addEventListener("click", (e) => {
    if (!menuPanel.hidden && !e.target.closest(".menu")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value.trim());
  });

  renderTopics();
  startSession(false).then(() => setInterval(pollEvents, 1500));
  input.focus();
})();
