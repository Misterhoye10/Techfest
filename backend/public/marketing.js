(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  if (nav && toggle && menu) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  const tabStudents = document.getElementById("tabStudents");
  const tabSchools = document.getElementById("tabSchools");
  const plansStudents = document.getElementById("plansStudents");
  const plansSchools = document.getElementById("plansSchools");

  const showPricing = (mode) => {
    const students = mode === "students";
    if (tabStudents && tabSchools) {
      tabStudents.classList.toggle("is-active", students);
      tabSchools.classList.toggle("is-active", !students);
      tabStudents.setAttribute("aria-selected", students ? "true" : "false");
      tabSchools.setAttribute("aria-selected", students ? "false" : "true");
    }
    if (plansStudents) plansStudents.hidden = !students;
    if (plansSchools) plansSchools.hidden = students;
  };

  tabStudents?.addEventListener("click", () => showPricing("students"));
  tabSchools?.addEventListener("click", () => showPricing("schools"));

  /* Hero product walkthrough (Claude-style motion, not a still) */
  const demo = document.getElementById("heroDemo");
  const caption = document.getElementById("heroDemoCaption");
  const thread = document.getElementById("heroDemoThread");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (demo && caption && thread) {
    const steps = [
      { show: [], caption: "Student asks Reca", rail: 0, wait: 700 },
      { show: [1], caption: "Student asks Reca", rail: 0, wait: 900 },
      { show: [1, 2], caption: "Reca explains simply", rail: 0, wait: 1400 },
      { show: [1, 2, 3], caption: "Quick check", rail: 1, wait: 1200 },
      { show: [1, 2, 3, 4], caption: "Student misses it", rail: 1, wait: 1000 },
      { show: [1, 2, 3, 4, 5], caption: "Reca remembers the miss", rail: 1, wait: 1600 },
      { show: [1, 2, 3, 4, 5, 6], caption: "Time passes", rail: 2, wait: 1100 },
      { show: [6, 7], caption: "Reca messages first", rail: 2, wait: 1500, clearBefore: true },
      { show: [6, 7, 8], caption: "Student answers again", rail: 3, wait: 1000 },
      { show: [6, 7, 8, 9], caption: "Topic cleared", rail: 3, wait: 2200 },
    ];

    const nodes = [...thread.querySelectorAll("[data-step]")];
    const dots = [...demo.querySelectorAll(".hero-demo__dot")];
    let timer = 0;
    let index = 0;
    let paused = false;

    const apply = (step) => {
      if (step.clearBefore) {
        nodes.forEach((node) => {
          node.classList.remove("is-in");
          if (node.hasAttribute("hidden") || node.classList.contains("hero-demo__skip")) {
            node.hidden = true;
          }
        });
      }

      nodes.forEach((node) => {
        const id = Number(node.getAttribute("data-step"));
        const on = step.show.includes(id);
        if (node.classList.contains("hero-demo__skip")) {
          node.hidden = !on;
          node.classList.toggle("is-in", on);
        } else {
          node.classList.toggle("is-in", on);
        }
      });

      caption.textContent = step.caption;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === step.rail);
      });

      thread.scrollTop = thread.scrollHeight;
    };

    const tick = () => {
      if (paused) {
        timer = window.setTimeout(tick, 300);
        return;
      }
      const step = steps[index];
      apply(step);
      index = (index + 1) % steps.length;
      timer = window.setTimeout(tick, step.wait);
    };

    if (reduceMotion) {
      demo.classList.add("is-static");
      apply({ show: [6, 7, 8, 9], caption: "Topic cleared", rail: 3 });
      nodes.forEach((node) => {
        const id = Number(node.getAttribute("data-step"));
        if ([6, 7, 8, 9].includes(id)) {
          if (node.classList.contains("hero-demo__skip")) node.hidden = false;
          node.classList.add("is-in");
        }
      });
    } else {
      demo.addEventListener("mouseenter", () => {
        paused = true;
      });
      demo.addEventListener("mouseleave", () => {
        paused = false;
      });
      tick();
    }

    window.addEventListener(
      "beforeunload",
      () => {
        window.clearTimeout(timer);
      },
      { once: true }
    );
  }
})();
