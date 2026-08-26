(() => {
  const thread = document.getElementById("thread");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const resurfaceBtn = document.getElementById("resurfaceBtn");
  const statusLine = document.getElementById("statusLine");

  const seen = new Set();
  let phone = localStorage.getItem("reca_phone") || "";
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
    statusLine.textContent = "Online · demo chat (same memory engine)";
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
    } catch (err) {
      addBubble("Couldn’t reach Reca. Is the server running?", "system");
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
        if (seen.has(m.id)) {
          lastEventId = m.id;
          continue;
        }
        // Skip echoes already shown from /api/chat responses
        addBubble(m.text, "in", m);
        lastEventId = m.id;
      }
    } catch (_) {
      /* ignore transient poll errors */
    }
  }

  async function fireResurface() {
    addBubble("Firing resurface…", "system");
    try {
      const res = await fetch("/demo/resurface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        addBubble(data.error || "Nothing to resurface yet.", "system");
        return;
      }
      // Message also arrives via outbox poll; show immediately for demo certainty
      if (data.message) addBubble(data.message, "in");
    } catch (_) {
      addBubble("Resurface failed — is the server up?", "system");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value.trim());
  });

  resurfaceBtn.addEventListener("click", fireResurface);

  startSession().then(() => {
    setInterval(pollEvents, 1500);
  });
})();
