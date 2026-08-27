(() => {
  const SESSION_KEY = "reca_signed_in";
  const form = document.getElementById("authForm");
  const otpForm = document.getElementById("otpForm");
  const nameField = document.getElementById("nameField");
  const nameInput = document.getElementById("authName");
  const phoneInput = document.getElementById("authPhone");
  const submitBtn = document.getElementById("authSubmit");
  const errorEl = document.getElementById("authError");
  const otpCode = document.getElementById("otpCode");
  const otpSubmit = document.getElementById("otpSubmit");
  const otpResend = document.getElementById("otpResend");
  const otpBack = document.getElementById("otpBack");
  const otpError = document.getElementById("otpError");
  const otpDev = document.getElementById("otpDev");
  const otpLead = document.getElementById("otpLead");
  const syncCard = document.getElementById("syncCard");
  const syncWaLink = document.getElementById("syncWaLink");
  const syncWaNote = document.getElementById("syncWaNote");
  const syncContinue = document.getElementById("syncContinue");
  const titleEl = document.getElementById("authTitle");
  const introEl = document.getElementById("authIntro");
  const modeSignup = document.getElementById("modeSignup");
  const modeSignin = document.getElementById("modeSignin");
  const modesEl = document.querySelector(".auth__modes");
  const guestLink = document.getElementById("authGuest");
  const guestNote = document.getElementById("authGuestNote");
  const authDivider = document.getElementById("authDivider");

  function setGuestPromoVisible(show) {
    if (guestLink) guestLink.hidden = !show;
    if (guestNote) guestNote.hidden = !show;
    if (authDivider) authDivider.hidden = !show;
  }

  const params = new URLSearchParams(location.search);
  const showWaCta = params.get("wa") === "1";
  let mode = params.get("mode") === "signin" ? "signin" : "signup";
  let pendingPhone = null;
  let pendingName = null;

  function hasActiveSession() {
    const signed = localStorage.getItem(SESSION_KEY) === "1";
    const phone = (localStorage.getItem("reca_phone") || "").trim();
    return signed && /^\+\d{10,15}$/.test(phone);
  }

  if (hasActiveSession() && params.get("force") !== "1") {
    location.replace("/chat.html");
    return;
  }

  if (params.get("force") === "1") mode = "signin";

  const savedName = (localStorage.getItem("reca_display_name") || "").trim();
  const savedPhone = (localStorage.getItem("reca_phone") || "").trim();
  if (savedName && nameInput) nameInput.value = savedName;
  if (savedPhone && phoneInput) {
    phoneInput.value = savedPhone.replace(/^\+234/, "").replace(/^\+/, "");
  }

  function showError(el, msg) {
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || "";
  }

  function setMode(next) {
    mode = next === "signin" ? "signin" : "signup";
    const isSignin = mode === "signin";

    modeSignup?.classList.toggle("is-active", !isSignin);
    modeSignin?.classList.toggle("is-active", isSignin);
    modeSignup?.setAttribute("aria-selected", String(!isSignin));
    modeSignin?.setAttribute("aria-selected", String(isSignin));

    if (nameField) nameField.hidden = isSignin;
    if (nameInput) nameInput.required = !isSignin;
    if (titleEl) {
      titleEl.hidden = false;
      titleEl.textContent = isSignin ? "Welcome back" : "Start studying";
    }
    if (introEl) {
      introEl.hidden = false;
      introEl.textContent = isSignin
        ? "Enter your phone to get a code and open Reca on the web."
        : "Use the web app now. WhatsApp reminders work on demo numbers only.";
    }
    if (submitBtn) submitBtn.textContent = "Send code";

    const url = new URL(location.href);
    if (isSignin) url.searchParams.set("mode", "signin");
    else url.searchParams.delete("mode");
    if (params.get("force") === "1") url.searchParams.set("force", "1");
    history.replaceState({}, "", url);
  }

  modeSignup?.addEventListener("click", () => setMode("signup"));
  modeSignin?.addEventListener("click", () => setMode("signin"));
  setMode(mode);

  function toE164(raw) {
    let s = String(raw || "")
      .trim()
      .replace(/[\s\-().]/g, "");
    if (!s) return null;
    if (s.startsWith("+")) return /^\+\d{10,15}$/.test(s) ? s : null;
    if (s.startsWith("00")) s = s.slice(2);
    if (s.startsWith("234") && s.length >= 12) return `+${s}`;
    if (s.startsWith("0") && s.length === 11) return `+234${s.slice(1)}`;
    if (/^\d{10}$/.test(s)) return `+234${s}`;
    if (/^\d{10,14}$/.test(s)) return `+${s}`;
    return null;
  }

  function persistSession({ phone, name }) {
    localStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem("reca_phone", phone);
    if (name) localStorage.setItem("reca_display_name", name);
    localStorage.removeItem("reca_guest");
    localStorage.removeItem("reca_email");
    localStorage.removeItem("reca_link_prompt_dismissed");
  }

  function showOtpStep({ phone, devCode }) {
    form.hidden = true;
    if (modesEl) modesEl.hidden = true;
    if (titleEl) titleEl.hidden = true;
    if (introEl) introEl.hidden = true;
    otpForm.hidden = false;
    syncCard.hidden = true;
    setGuestPromoVisible(false);
    pendingPhone = phone;
    if (otpLead) {
      otpLead.textContent = phone
        ? `Code for ${phone}. If WhatsApp doesn’t arrive, use the demo code below.`
        : "Enter the code shown below.";
    }
    if (otpDev) {
      if (devCode) {
        otpDev.hidden = false;
        otpDev.textContent = `Your code: ${devCode}`;
      } else {
        otpDev.hidden = true;
      }
    }
    otpCode.value = "";
    otpCode.focus();
  }

  function showPhoneStep() {
    form.hidden = false;
    if (modesEl) modesEl.hidden = false;
    if (titleEl) titleEl.hidden = false;
    if (introEl) introEl.hidden = false;
    otpForm.hidden = true;
    syncCard.hidden = true;
    setGuestPromoVisible(true);
    pendingPhone = null;
    showError(otpError, "");
    setMode(mode);
  }

  function showSyncStep({ continueUrl, whatsappFrom }) {
    form.hidden = true;
    otpForm.hidden = true;
    if (modesEl) modesEl.hidden = true;
    if (titleEl) titleEl.hidden = true;
    if (introEl) introEl.hidden = true;
    syncCard.hidden = false;
    setGuestPromoVisible(false);

    const biz =
      (whatsappFrom || "").replace(/\D/g, "") ||
      (continueUrl || "").match(/wa\.me\/(\d+)/)?.[1] ||
      "";

    // WhatsApp CTA is opt-in only (?wa=1) — Meta allow-list blocks most numbers
    if (syncWaLink) {
      if (showWaCta && biz) {
        syncWaLink.hidden = false;
        syncWaLink.href =
          continueUrl ||
          `https://wa.me/${biz}?text=${encodeURIComponent("Hey Reca, let's start studying!")}`;
        syncWaLink.textContent = "Open WhatsApp (demo)";
      } else {
        syncWaLink.hidden = true;
        syncWaLink.removeAttribute("href");
      }
    }
    if (syncWaNote) {
      syncWaNote.hidden = false;
      syncWaNote.textContent = showWaCta
        ? "Only works if this number is allow-listed in Meta Business Suite."
        : "WhatsApp reminders need an allow-listed demo number in Meta — judges use the web app.";
    }
    syncContinue?.focus();
  }

  async function requestCode() {
    const name = (nameInput?.value || "").trim().slice(0, 40);
    const phone = toE164(phoneInput?.value);

    if (mode === "signup" && !name) {
      showError(errorEl, "Enter your name.");
      nameInput?.focus();
      return;
    }
    if (!phone) {
      showError(errorEl, "Enter a valid WhatsApp number.");
      phoneInput?.focus();
      return;
    }

    if (
      localStorage.getItem(SESSION_KEY) === "1" &&
      (localStorage.getItem("reca_phone") || "").trim() === phone
    ) {
      location.assign("/chat.html");
      return;
    }

    pendingName = name || localStorage.getItem("reca_display_name") || null;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    showError(errorEl, "");

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: pendingName || undefined,
          purpose: mode === "signin" ? "signin" : "signup",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn’t send code");

      showOtpStep({
        phone: data.phone || phone,
        devCode: data.devCode,
      });
    } catch (err) {
      showError(errorEl, err.message || "Couldn’t send code.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send code";
    }
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    requestCode();
  });

  otpResend?.addEventListener("click", () => requestCode());
  otpBack?.addEventListener("click", showPhoneStep);

  otpForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError(otpError, "");
    const code = (otpCode?.value || "").trim();
    if (!/^\d{4,6}$/.test(code)) {
      showError(otpError, "Enter the code from WhatsApp.");
      otpCode?.focus();
      return;
    }

    otpSubmit.disabled = true;
    otpSubmit.textContent = "Checking…";

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: pendingPhone,
          code,
          name: pendingName || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn’t verify");

      const linked = data.phone || pendingPhone;
      persistSession({ phone: linked, name: data.name || pendingName });

      await fetch("/api/whatsapp/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: linked }),
      }).catch(() => {});

      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: linked, name: data.name || pendingName }),
      }).catch(() => {});

      if (data.purpose === "signin" || mode === "signin") {
        location.assign("/chat.html");
        return;
      }

      showSyncStep({
        whatsappFrom: data.whatsappFrom,
        continueUrl: data.continueOnWhatsApp,
      });
    } catch (err) {
      showError(otpError, err.message || "Invalid code.");
    } finally {
      otpSubmit.disabled = false;
      otpSubmit.textContent = "Continue";
    }
  });

  syncContinue?.addEventListener("click", () => {
    location.assign("/chat.html");
  });

  guestLink?.addEventListener("click", () => {
    localStorage.setItem("reca_guest", "1");
    localStorage.removeItem("reca_phone");
    localStorage.removeItem("reca_signed_in");
    localStorage.removeItem(SESSION_KEY);
  });
})();
