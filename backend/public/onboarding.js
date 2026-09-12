(() => {
  const DONE_KEY = "reca_onboarding_done";
  const EXAM_KEY = "reca_exam_body";
  const SUBJECTS_KEY = "reca_subjects";
  const WA_SKIP_KEY = "reca_whatsapp_skipped";
  const params = new URLSearchParams(location.search);
  const restart = params.get("restart") === "1" || params.get("fresh") === "1";

  if (restart) {
    localStorage.removeItem(DONE_KEY);
  }

  // Already finished — go to app (use ?restart=1 to replay setup)
  if (localStorage.getItem(DONE_KEY) === "1") {
    location.replace("/chat.html");
    return;
  }

  const name = (localStorage.getItem("reca_display_name") || "").trim() || "there";
  const thread = document.getElementById("convoThread");
  const chooser = document.getElementById("convoChooser");
  const btnContinue = document.getElementById("btnContinue");
  const btnSkip = document.getElementById("btnSkip");
  const skipModal = document.getElementById("skipModal");
  const ticks = [...document.querySelectorAll(".convo__tick")];

  if (!thread || !chooser || !btnContinue || !btnSkip) {
    document.body.innerHTML =
      '<p style="font-family:system-ui;padding:2rem;color:#f3efe6;background:#0e0e0e">Reca setup failed to load. <a href="/onboarding.html?restart=1" style="color:#fb735b">Retry setup</a></p>';
    return;
  }

  if (params.get("guest") === "1") {
    localStorage.setItem("reca_guest", "1");
  }

  const state = {
    phase: "intro",
    exam: localStorage.getItem(EXAM_KEY) || "",
    subjects: [],
    ahaDone: false,
  };

  const SUBJECTS = ["Mathematics", "English", "Biology", "Chemistry", "Physics"];

  function isRealPhone(value) {
    return /^\+\d{10,15}$/.test(String(value || "").trim());
  }

  function linkedWhatsAppNumber() {
    const phone = (localStorage.getItem("reca_phone") || "").trim();
    // guest_* is a session id, not a WhatsApp number (#6) — never show as "Linked"
    return isRealPhone(phone) ? phone : "";
  }

  function setRail(i) {
    ticks.forEach((t, idx) => t.classList.toggle("is-on", idx === i));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function addReca(html) {
    const box = document.createElement("div");
    box.className = "msg msg--reca";
    box.innerHTML = html.trim();
    thread.appendChild(box);
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return box;
  }

  function addYou(label) {
    const box = document.createElement("div");
    box.className = "msg msg--you";
    const pill = document.createElement("span");
    pill.className = "msg__pill";
    pill.textContent = label;
    box.appendChild(pill);
    thread.appendChild(box);
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearChooser() {
    chooser.hidden = true;
    chooser.innerHTML = "";
    btnContinue.hidden = true;
    btnContinue.disabled = true;
    btnContinue.textContent = "Continue";
  }

  function toE164(raw) {
    let s = String(raw || "")
      .trim()
      .replace(/[\s\-().]/g, "");
    if (!s) return null;
    if (s.startsWith("+")) return /^\+\d{10,15}$/.test(s) ? s : null;
    if (s.startsWith("0") && s.length === 11) return `+234${s.slice(1)}`;
    if (/^\d{10}$/.test(s)) return `+234${s}`;
    return null;
  }

  function startIntro() {
    state.phase = "intro";
    setRail(0);
    btnSkip.hidden = false;
    addReca(`
      <p class="msg__hello">Hey, ${escapeHtml(name)}!</p>
      <p class="msg__text">Welcome to Reca. I will ask a few quick questions so study and WhatsApp recall fit how you prep.</p>
    `);
    window.setTimeout(askExam, 450);
  }

  function askExam() {
    state.phase = "exam";
    setRail(0);
    addReca(`<p class="msg__text">What are you prepping for?</p>`);
    chooser.hidden = false;
    chooser.innerHTML = `
      <div class="choice-grid choice-grid--exams" role="radiogroup" aria-label="Exam">
        ${examChoice("WAEC", "WASSCE school candidates")}
        ${examChoice("JAMB", "UTME and retakers")}
        ${examChoice("BOTH", "WAEC and JAMB this season")}
      </div>
    `;
    btnContinue.hidden = false;
    btnContinue.disabled = !state.exam;

    chooser.querySelectorAll("[data-exam]").forEach((btn) => {
      if (btn.dataset.exam === state.exam) btn.classList.add("is-on");
      btn.addEventListener("click", () => {
        state.exam = btn.dataset.exam;
        chooser.querySelectorAll("[data-exam]").forEach((b) => b.classList.toggle("is-on", b === btn));
        btnContinue.disabled = false;
      });
    });
  }

  function examChoice(id, desc) {
    return `
      <button type="button" class="choice" data-exam="${id}" role="radio" aria-checked="false">
        <span class="choice__radio" aria-hidden="true"></span>
        <span class="choice__label">
          <span class="choice__title">${id === "BOTH" ? "Both" : id}</span>
          <span class="choice__desc">${desc}</span>
        </span>
      </button>
    `;
  }

  function confirmExam() {
    const label = state.exam === "BOTH" ? "Both" : state.exam;
    clearChooser();
    addYou(label);
    localStorage.setItem(EXAM_KEY, state.exam);
    window.setTimeout(() => {
      const line =
        state.exam === "JAMB"
          ? "JAMB. Got it. I will lean UTME style practice."
          : state.exam === "BOTH"
            ? "WAEC and JAMB. Got it. I will keep both in mind."
            : "WAEC. Got it. I will keep WASSCE style practice close.";
      addReca(`<p class="msg__text">${line}</p>`);
      window.setTimeout(askSubjects, 500);
    }, 280);
  }

  function askSubjects() {
    state.phase = "subjects";
    setRail(1);
    if (state.subjects.length === 0 && (state.exam === "WAEC" || state.exam === "BOTH")) {
      state.subjects = ["Mathematics", "English"];
    }
    addReca(`<p class="msg__text">Which subjects first? Pick 3 to 5.</p>`);
    chooser.hidden = false;
    chooser.innerHTML = `
      <div class="choice-grid choice-grid--subjects" role="group" aria-label="Subjects">
        ${SUBJECTS.map(
          (s) => `
          <button type="button" class="choice ${state.subjects.includes(s) ? "is-on" : ""}" data-subject="${s}">
            <span class="choice__check" aria-hidden="true"></span>
            <span class="choice__label"><span class="choice__title">${s}</span></span>
          </button>`
        ).join("")}
      </div>
    `;
    btnContinue.hidden = false;
    btnContinue.disabled = state.subjects.length < 3;

    chooser.querySelectorAll("[data-subject]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = btn.dataset.subject;
        const on = state.subjects.includes(s);
        if (on) {
          state.subjects = state.subjects.filter((x) => x !== s);
          btn.classList.remove("is-on");
        } else if (state.subjects.length < 5) {
          state.subjects.push(s);
          btn.classList.add("is-on");
        }
        btnContinue.disabled = state.subjects.length < 3;
      });
    });
  }

  function confirmSubjects() {
    clearChooser();
    addYou(state.subjects.join(", "));
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(state.subjects));
    window.setTimeout(() => {
      addReca(
        `<p class="msg__text">${state.subjects.length} subjects locked. Learn will open with these first.</p>`
      );
      window.setTimeout(askWhatsApp, 500);
    }, 280);
  }

  function askWhatsApp() {
    state.phase = "whatsapp";
    setRail(2);
    const phone = linkedWhatsAppNumber();
    addReca(
      `<p class="msg__text">When you miss a topic, I message you on WhatsApp days later. Link your number so that works.</p>`
    );
    chooser.hidden = false;
    if (phone) {
      chooser.innerHTML = `<div class="wa-box"><p class="wa-box__linked">Linked: <strong>${escapeHtml(
        phone
      )}</strong></p></div>`;
      btnContinue.hidden = false;
      btnContinue.disabled = false;
      btnContinue.textContent = "Continue";
    } else {
      chooser.innerHTML = `
        <div class="wa-box">
          <label class="wa-phone">
            <span>+234</span>
            <input id="waPhone" type="tel" inputmode="numeric" placeholder="801 234 5678" maxlength="14" />
          </label>
          <p class="wa-hint" id="waHint" hidden></p>
        </div>
      `;
      btnContinue.hidden = false;
      btnContinue.disabled = false;
      btnContinue.textContent = "Link and continue";
    }
  }

  function confirmWhatsApp() {
    const existing = linkedWhatsAppNumber();
    if (!existing) {
      const input = document.getElementById("waPhone");
      const hint = document.getElementById("waHint");
      const e164 = toE164(input?.value);
      if (!e164) {
        if (hint) {
          hint.hidden = false;
          hint.textContent = "Enter a valid number, or tap Skip.";
        }
        return;
      }
      localStorage.setItem("reca_phone", e164);
      localStorage.removeItem(WA_SKIP_KEY);
      clearChooser();
      addYou(e164);
    } else {
      clearChooser();
      addYou("WhatsApp linked");
    }
    window.setTimeout(() => {
      addReca(`<p class="msg__text">Good. I can text you back when a weak topic needs another look.</p>`);
      window.setTimeout(askAha, 500);
    }, 280);
  }

  function askAha() {
    state.phase = "aha";
    setRail(3);
    btnSkip.hidden = true;
    addReca(`<p class="msg__text">One quick topic so you feel how Reca remembers. Photosynthesis.</p>`);
    chooser.hidden = false;
    chooser.innerHTML = `
      <div class="aha-card" id="ahaCard">
        <p class="aha-card__label">Explain</p>
        <p class="aha-card__body">
          Plants make food from sunlight, water, and CO₂. Chlorophyll in the leaf catches light so the plant can make glucose and release oxygen.
        </p>
        <button type="button" class="convo__continue" id="ahaQuizBtn" style="width:100%">Quick check</button>
      </div>
    `;
    document.getElementById("ahaQuizBtn")?.addEventListener("click", showAhaQuiz);
  }

  function showAhaQuiz() {
    const card = document.getElementById("ahaCard");
    if (!card) return;
    card.innerHTML = `
      <p class="aha-card__label">Quick check</p>
      <p class="aha-card__body">Which part of the plant cell captures sunlight?</p>
      <div class="aha-opts">
        <button type="button" class="aha-opt" data-answer="wrong">Mitochondria</button>
        <button type="button" class="aha-opt" data-answer="right">Chloroplast</button>
        <button type="button" class="aha-opt" data-answer="wrong">Nucleus</button>
      </div>
    `;
    card.querySelectorAll(".aha-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const right = btn.dataset.answer === "right";
        addYou(btn.textContent.trim());
        clearChooser();
        window.setTimeout(() => {
          if (right) {
            addReca(
              `<p class="msg__text">Correct. Chloroplast catches the light. I still come back on tough topics so they stick.</p>`
            );
          } else {
            addReca(
              `<p class="msg__text">Not quite. Mitochondria are for respiration. The answer is chloroplast. I will remember that. I will check again soon.</p>`
            );
          }
          state.ahaDone = true;
          localStorage.setItem("reca_aha_topic", "photosynthesis");
          btnContinue.hidden = false;
          btnContinue.disabled = false;
          btnContinue.textContent = "Start studying";
          state.phase = "done";
          setRail(3);
        }, 250);
      });
    });
  }

  function finish() {
    localStorage.setItem(DONE_KEY, "1");
    localStorage.setItem(EXAM_KEY, state.exam || "WAEC");
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(state.subjects));
    const topic = localStorage.getItem("reca_aha_topic") || "photosynthesis";
    location.assign(`/chat.html?onboard=1&topic=${encodeURIComponent(topic)}`);
  }

  btnContinue.addEventListener("click", () => {
    if (state.phase === "exam") confirmExam();
    else if (state.phase === "subjects") confirmSubjects();
    else if (state.phase === "whatsapp") confirmWhatsApp();
    else if (state.phase === "done") finish();
  });

  btnSkip.addEventListener("click", () => {
    if (skipModal) skipModal.hidden = false;
  });
  document.getElementById("skipClose")?.addEventListener("click", () => {
    if (skipModal) skipModal.hidden = true;
  });
  document.getElementById("skipKeep")?.addEventListener("click", () => {
    if (skipModal) skipModal.hidden = true;
  });
  document.getElementById("skipGo")?.addEventListener("click", () => {
    localStorage.setItem(WA_SKIP_KEY, "1");
    localStorage.setItem(DONE_KEY, "1");
    if (state.exam) localStorage.setItem(EXAM_KEY, state.exam);
    if (state.subjects.length) localStorage.setItem(SUBJECTS_KEY, JSON.stringify(state.subjects));
    location.assign("/chat.html");
  });

  startIntro();
})();
