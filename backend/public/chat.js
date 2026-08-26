(() => {
  const PRESETS = [
    { label: "Photosynthesis", send: "explain photosynthesis", demo: true },
    { label: "Osmosis", send: "explain osmosis" },
    { label: "Respiration", send: "explain aerobic respiration" },
    { label: "Acids & bases", send: "explain acids and bases simply" },
    { label: "How am I doing?", send: "how am I doing in Biology?" },
  ];

  const DEMO_ANSWERS = [
    { label: "Q1 wrong · mitochondria", send: "mitochondria", kind: "warn" },
    { label: "Q2 right · glucose and oxygen", send: "glucose and oxygen", kind: "ok" },
    { label: "Resurface answer · chloroplast", send: "chloroplast", kind: "accent" },
  ];

  const thread = document.getElementById("thread");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const resurfaceBtn = document.getElementById("resurfaceBtn");
  const resetBtn = document.getElementById("resetBtn");
  const statusLine = document.getElementById("statusLine");
  const topicChips = document.getElementById("topicChips");
  const answerChips = document.getElementById("answerChips");
  const quickRow = document.getElementById("quickRow");

  const seen = new Set();
  let phone = "";
  let lastEventId = "";
  let busy = false;

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

  function makeChip(item, target) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    if (item.kind === "warn") btn.classList.add("chip--warn");
    if (item.kind === "ok") btn.classList.add("chip--ok");
    if (item.kind === "accent" || item.demo) btn.classList.add("chip--accent");
    btn.textContent = item.label;
    btn.addEventListener("click", () => sendMessage(item.send));
    target.appendChild(btn);
    return btn;
  }

  function renderChips() {
    topicChips.innerHTML = "";
    answerChips.innerHTML = "";
    quickRow.innerHTML = "";
    PRESETS.forEach((p) => {
      makeChip(p, topicChips);
      if (p.demo || p.label.startsWith("How")) {
        const q = makeChip(p, quickRow);
        if (p.demo) q.textContent = "Start: photosynthesis";
      }
    });
    DEMO_ANSWERS.forEach((a) => makeChip(a, answerChips));
    quickRow.hidden = false;
  }

  async function startSession(fresh = false) {
    if (fresh) {
      localStorage.removeItem("reca_phone");
      phone = "";
      lastEventId = "";
      seen.clear();
      thread.innerHTML = "";
    }
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone || undefined }),
    });
    const data = await res.json();
    phone = data.phone;
    localStorage.setItem("reca_phone", phone);
    addBubble(data.welcome, "in");
    statusLine.textContent = "Online · preset curriculum";
  }

  async function sendMessage(text) {
    if (!text || busy) return;
    busy = true;
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
      addBubble("Couldn’t reach Reca. Is the server running on port 3000?", "system");
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

  async function fireResurface() {
    addBubble("Coming back with what you missed…", "system");
    try {
      const res = await fetch("/demo/resurface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        addBubble(data.error || "Nothing to resurface yet — miss a question first.", "system");
        return;
      }
      if (data.message) addBubble(data.message, "in");
    } catch (_) {
      addBubble("Resurface failed — check the server.", "system");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value.trim());
  });
  resurfaceBtn.addEventListener("click", fireResurface);
  resetBtn.addEventListener("click", () => startSession(true));

  renderChips();
  phone = localStorage.getItem("reca_phone") || "";
  startSession(false).then(() => setInterval(pollEvents, 1500));
})();
