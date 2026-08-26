(() => {
  const TOPICS = [
    { label: "Photosynthesis", send: "explain photosynthesis" },
    { label: "Osmosis", send: "explain osmosis" },
    { label: "Respiration", send: "explain aerobic respiration" },
    { label: "Acids & bases", send: "explain acids and bases simply" },
    { label: "How am I doing?", send: "how am I doing in Biology?" },
  ];

  const thread = document.getElementById("thread");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const statusLine = document.getElementById("statusLine");
  const topicChips = document.getElementById("topicChips");
  const suggestRow = document.getElementById("suggestRow");

  const seen = new Set();
  let phone = localStorage.getItem("reca_phone") || "";
  let lastEventId = "";
  let busy = false;
  let hasChatted = false;

  function timeLabel(ts = Date.now()) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      btn.addEventListener("click", () => sendMessage(item.send));
      topicChips.appendChild(btn);
    });
  }

  function hideSuggestions() {
    if (hasChatted) suggestRow.hidden = true;
  }

  async function startSession() {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone || undefined }),
    });
    const data = await res.json();
    phone = data.phone;
    localStorage.setItem("reca_phone", phone);
    addBubble(data.welcome, "in");
    statusLine.textContent = "Online";
  }

  async function sendMessage(text) {
    if (!text || busy) return;
    busy = true;
    hasChatted = true;
    hideSuggestions();
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
      addBubble("Something went wrong sending that. Try again in a moment.", "system");
    } finally {
      busy = false;
      input.focus();
    }
  }

  async function pollEvents() {
    if (!phone) return;
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value.trim());
  });

  renderTopics();
  startSession().then(() => setInterval(pollEvents, 1500));
})();
