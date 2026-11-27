/* Eagle Driving Mantra — site behaviour. No third-party scripts, no tracking, no data leaves the page. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PHONE = "+61432435996", EMAIL = "hello@eaglemantra.com.au";

  /* intro (home page only) */
  const intro = $("#intro");
  if (intro && root.classList.contains("intro-on")) {
    const end = () => {
      try { sessionStorage.setItem("edm-intro", "1"); } catch (e) {}
      if (!root.classList.contains("intro-on")) return;
      intro.classList.add("skip");
      setTimeout(() => root.classList.remove("intro-on"), 900);
    };
    $("#skipb").addEventListener("click", end);
    document.addEventListener("keydown", e => { if (e.key === "Escape") end(); });
    setTimeout(() => { try { sessionStorage.setItem("edm-intro", "1"); } catch (e) {} }, 8000);
  }

  /* mobile menu */
  const nav = $("#nav"), menu = $("#menu");
  if (menu) {
    menu.addEventListener("click", () => { const o = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(o)); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); menu.focus(); } });
  }

  /* scroll progress */
  const bar = $("#progress");
  const onScroll = () => { const m = root.scrollHeight - root.clientHeight; bar.style.transform = `scaleX(${m > 0 ? root.scrollTop / m : 0})`; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ripple on press */
  if (!reduced) document.addEventListener("pointerdown", e => {
    const el = e.target.closest(".btn,.seg button");
    if (!el) return;
    const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, sp = document.createElement("span");
    sp.className = "rip";
    sp.style.width = sp.style.height = d + "px";
    sp.style.left = (e.clientX - r.left - d / 2) + "px";
    sp.style.top = (e.clientY - r.top - d / 2) + "px";
    el.appendChild(sp); setTimeout(() => sp.remove(), 1050);
  });

  /* counters count up when seen */
  const counters = $$("[data-count]");
  const run = el => {
    const to = Number(el.dataset.count), dec = Number(el.dataset.dec || 0), suf = el.dataset.suffix || "";
    if (reduced) { el.textContent = to.toLocaleString("en-AU", { minimumFractionDigits: dec }) + suf; return; }
    const t0 = performance.now(), dur = 2200;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3;
      el.textContent = (to * e).toLocaleString("en-AU", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: .6 });
    counters.forEach(c => io.observe(c));
  }

  /* lesson cost calculator */
  const calc = $("#calc");
  if (calc) {
    let rate = 75, mins = 60;
    const n = $("#n"), total = $("#total"), sum = $("#sum"), nOut = $("#nout");
    const book = $("#calcbook");
    const draw = () => {
      const k = Number(n.value);
      nOut.textContent = k + (k === 1 ? " lesson" : " lessons");
      total.textContent = "$" + (k * rate).toLocaleString("en-AU");
      const hrs = (k * mins / 60);
      sum.textContent = `${k} × ${mins}-minute lesson${k === 1 ? "" : "s"} at $${rate} = ${hrs % 1 ? hrs.toFixed(1) : hrs} hours behind the wheel with Sujan.`;
      const msg = `Hi Sujan, I'd like to book ${k} × ${mins}-minute driving lesson${k === 1 ? "" : "s"}. When are you available?`;
      book.href = "sms:" + PHONE + "?&body=" + encodeURIComponent(msg);
    };
    $$("#calc .seg button").forEach(b => b.addEventListener("click", () => {
      $$("#calc .seg button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      rate = Number(b.dataset.rate); mins = Number(b.dataset.min); draw();
    }));
    n.addEventListener("input", draw); draw();
  }

  /* "which lesson is right for me?" */
  const quiz = $("#quiz");
  if (quiz) {
    const ans = $("#qa");
    const A = {
      new: ["Beginner driving lessons", "Start from the very basics in a calm, patient way: controls, steering, observation and your first roads, at your pace.", "lessons.html#beginner"],
      overseas: ["Overseas licence conversion", "Learn Tasmanian road rules and what assessors expect, then practise the kind of driving you'll do in your conversion assessment.", "overseas-licence.html"],
      back: ["Returning to driving", "Rebuild confidence after a break, refresh the rules and get comfortable in today's Hobart traffic again.", "lessons.html#returning"],
      test: ["P1 test preparation", "Sharpen the skills assessors look for with a mock test and clear feedback on exactly what to improve.", "lessons.html#test"]
    };
    $$("#quiz .opts button").forEach(b => b.addEventListener("click", () => {
      $$("#quiz .opts button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      const [t, d, href] = A[b.dataset.k];
      ans.replaceChildren();
      const bt = document.createElement("b"); bt.textContent = t;
      const p = document.createElement("p"); p.textContent = d;
      const a = document.createElement("a"); a.href = href; a.className = "btn navy arw"; a.textContent = "See this lesson";
      ans.append(bt, p, a);
      if (!reduced) ans.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 800, easing: "cubic-bezier(.33,0,.2,1)" });
    }));
  }

  /* FAQ search */
  const fs = $("#faqsearch");
  if (fs) {
    const items = $$(".faq details"), none = $("#none");
    fs.addEventListener("input", () => {
      const q = fs.value.trim().toLowerCase(); let shown = 0;
      items.forEach(d => { const hit = !q || d.textContent.toLowerCase().includes(q); d.hidden = !hit; if (hit) shown++; if (q && hit) d.open = true; });
      none.style.display = shown ? "none" : "block";
    });
  }

  /* enquiry form: builds a message the visitor sends from their own phone or email app (nothing is stored online) */
  const form = $("#enquiry");
  if (form) {
    const st = $("#fstatus");
    const val = () => {
      const name = $("#e-name"), phone = $("#e-phone"), ok = { name: /^[\p{L}\p{M} .'-]{2,60}$/u.test(name.value.trim()), phone: /^\+?[\d\s()-]{8,16}$/.test(phone.value.trim()) };
      name.setAttribute("aria-invalid", String(!ok.name)); phone.setAttribute("aria-invalid", String(!ok.phone));
      return ok.name && ok.phone;
    };
    const message = () => {
      const clean = v => v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 400);
      const parts = [`Hi Sujan, my name is ${clean($("#e-name").value)}.`, `I'm interested in: ${$("#e-type").value}.`];
      const when = clean($("#e-when").value); if (when) parts.push(`Best times for me: ${when}.`);
      const sub = clean($("#e-suburb").value); if (sub) parts.push(`I'm in ${sub}.`);
      const msg = clean($("#e-msg").value); if (msg) parts.push(msg);
      parts.push(`My number: ${clean($("#e-phone").value)}`);
      return parts.join(" ");
    };
    $$("[data-send]").forEach(b => b.addEventListener("click", () => {
      if (!val()) { st.textContent = "Please add your name and a valid phone number."; st.className = "status err"; return; }
      const m = encodeURIComponent(message()), via = b.dataset.send;
      const url = via === "sms" ? `sms:${PHONE}?&body=${m}` : via === "wa" ? `https://wa.me/${PHONE.slice(1)}?text=${m}` : `mailto:${EMAIL}?subject=${encodeURIComponent("Driving lesson enquiry")}&body=${m}`;
      st.textContent = "Opening your app with the message ready to send. If nothing opens, call or text 0432 435 996."; st.className = "status ok";
      location.href = url;
    }));
  }

  /* the car drives with SVG animation; stop it for people who prefer less motion */
  if (reduced) $$("svg").forEach(s => s.pauseAnimations && s.pauseAnimations());

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
