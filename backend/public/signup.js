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
  const signinLabel = document.getElementById("authSigninLabel");
  const signinDesc = document.getElementById("authSigninDesc");
  const authOr = document.getElementById("authOr");
  const guestBlock = document.getElementById("authGuestBlock");
  const signinBlock = document.getElementById("authSigninBlock");

  const params = new URLSearchParams(location.search);
  const showWaCta = params.get("wa") === "1";
  const forceLink = params.get("force") === "1";
  let mode = params.get("mode") === "signin" || forceLink ? "signin" : "signup";
  // Entry intent is fixed: landing shows guest+link; deep-link/force is phone-only (#2)
  const entryLinkOnly = forceLink || params.get("mode") === "signin";
  let pendingPhone = null;
  let pendingName = null;

  function isRealPhone(value) {
    return /^\+\d{10,15}$/.test(String(value || "").trim());
  }

  function isGuestToken(value) {
    return /^guest_[a-zA-Z0-9_-]{8,64}$/.test(String(value || "").trim());
  }

  function hasActiveSession() {
    const signed = localStorage.getItem(SESSION_KEY) === "1";
    const phone = (localStorage.getItem("reca_phone") || "").trim();
    return signed && isRealPhone(phone);
  }

  function afterAuthPath() {
    if (localStorage.getItem("reca_onboarding_done") === "1") return "/chat.html";
    return "/onboarding.html?restart=1";
  }

  if (hasActiveSession() && !forceLink) {
    location.replace(afterAuthPath());
    return;
  }

  const savedName = (localStorage.getItem("reca_display_name") || "").trim();
  const savedPhone = (localStorage.getItem("reca_phone") || "").trim();
  if (savedName && nameInput) nameInput.value = savedName;
  // Never put guest_* session tokens in the phone field (#6)
  if (phoneInput) {
    if (isRealPhone(savedPhone)) {
      phoneInput.value = savedPhone.replace(/^\+234/, "").replace(/^\+/, "");
    } else {
      phoneInput.value = "";
    }
  }

  function showError(el, msg) {
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || "";
  }

  function setLandingChrome(showGuestPath) {
    if (guestBlock) guestBlock.hidden = !showGuestPath;
    if (guestLink) guestLink.hidden = !showGuestPath;
    if (guestNote) guestNote.hidden = !showGuestPath;
    if (authOr) authOr.hidden = !showGuestPath;
    document.body.classList.toggle("is-link-only", !showGuestPath);
  }

  function syncSubmitStyle(isPrimary) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("auth__primary", isPrimary);
    submitBtn.classList.toggle("auth__primary--solid", isPrimary);
    submitBtn.classList.toggle("auth__secondary", !isPrimary);
  }

  function setMode(next) {
    mode = next === "signin" ? "signin" : "signup";
    const isSignin = mode === "signin";
    const linkOnly = entryLinkOnly;

    modeSignup?.classList.toggle("is-active", !isSignin);
    modeSignin?.classList.toggle("is-active", isSignin);
    modeSignup?.setAttribute("aria-selected", String(!isSignin));
    modeSignin?.setAttribute("aria-selected", String(isSignin));

    if (nameField) nameField.hidden = isSignin;
    if (nameInput) nameInput.required = !isSignin;

    // Landing: guest is primary. Link-only deep-link: phone is primary.
    setLandingChrome(!linkOnly);

    if (titleEl) {
      titleEl.hidden = false;
      if (forceLink) titleEl.textContent = "Link WhatsApp";
      else if (linkOnly) titleEl.textContent = "Welcome back";
      else titleEl.textContent = "Start studying";
    }
    if (introEl) {
      introEl.hidden = false;
      if (forceLink) {
        introEl.textContent = "Save Progress across web and phone with one code.";
      } else if (linkOnly) {
        introEl.textContent = "Enter the WhatsApp number you linked. We’ll send a code.";
      } else {
        introEl.textContent =
          "WAEC & JAMB explanations, quizzes, and Progress. Short and exam-ready.";
      }
    }

    if (signinLabel) {
      signinLabel.textContent = linkOnly
        ? isSignin
          ? "Sign in"
          : "Create link"
        : "Link WhatsApp";
    }
    if (signinDesc) {
      signinDesc.textContent = linkOnly
        ? "We’ll text a one-time code to this number."
        : "Optional: keep Progress across web and phone.";
    }

    if (submitBtn) submitBtn.textContent = "Send code";
    syncSubmitStyle(linkOnly);

    const url = new URL(location.href);
    if (linkOnly || isSignin) url.searchParams.set("mode", isSignin ? "signin" : "signup");
    else url.searchParams.delete("mode");
    if (forceLink) url.searchParams.set("force", "1");
    // Keep landing bookmark clean when guest path is showing
    if (!linkOnly) {
      url.searchParams.delete("mode");
    }
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
    if (isGuestToken(s)) return null;
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
    const authHead = document.getElementById("authHead");
    form.hidden = true;
    if (modesEl) modesEl.hidden = true;
    if (signinBlock) signinBlock.hidden = true;
    if (authHead) authHead.hidden = true;
    if (titleEl) titleEl.hidden = true;
    if (introEl) introEl.hidden = true;
    otpForm.hidden = false;
    syncCard.hidden = true;
    setLandingChrome(false);
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
    const authHead = document.getElementById("authHead");
    form.hidden = false;
    if (modesEl) modesEl.hidden = false;
    if (signinBlock) signinBlock.hidden = false;
    if (authHead) authHead.hidden = false;
    if (titleEl) titleEl.hidden = false;
    if (introEl) introEl.hidden = false;
    otpForm.hidden = true;
    syncCard.hidden = true;
    pendingPhone = null;
    showError(otpError, "");
    setMode(mode);
  }

  function showSyncStep({ continueUrl, whatsappFrom }) {
    const authHead = document.getElementById("authHead");
    form.hidden = true;
    otpForm.hidden = true;
    if (modesEl) modesEl.hidden = true;
    if (signinBlock) signinBlock.hidden = true;
    if (authHead) authHead.hidden = true;
    if (titleEl) titleEl.hidden = true;
    if (introEl) introEl.hidden = true;
    syncCard.hidden = false;
    setLandingChrome(false);

    const biz =
      (whatsappFrom || "").replace(/\D/g, "") ||
      (continueUrl || "").match(/wa\.me\/(\d+)/)?.[1] ||
      "";

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
        : "WhatsApp reminders need an allow-listed demo number in Meta. Judges use the web app.";
    }
    syncContinue?.focus();
  }

  async function requestCode() {
    const name = (nameInput?.value || "").trim().slice(0, 40);
    const phone = toE164(phoneInput?.value);

    if (mode === "signup" && !name) {
      showError(errorEl, "Enter your name so Reca can greet you.");
      nameInput?.focus();
      return;
    }
    if (!phone) {
      showError(errorEl, "Enter a valid WhatsApp number (e.g. 801 234 5678).");
      phoneInput?.focus();
      return;
    }

    if (
      localStorage.getItem(SESSION_KEY) === "1" &&
      (localStorage.getItem("reca_phone") || "").trim() === phone
    ) {
      location.assign(afterAuthPath());
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
      showError(otpError, "Enter the 4-6 digit code.");
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

      if (data.purpose === "signin" || mode === "signin" || forceLink) {
        location.assign(afterAuthPath());
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
    location.assign(afterAuthPath());
  });

  guestLink?.addEventListener("click", () => {
    localStorage.setItem("reca_guest", "1");
    localStorage.removeItem("reca_phone");
    localStorage.removeItem("reca_signed_in");
    localStorage.removeItem(SESSION_KEY);
  });
})();
