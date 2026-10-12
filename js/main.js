/* ============================================================
   Ahmad Ali — Portfolio 2026
   Preloader, cursor, magnetic buttons, scroll reveals,
   cursor-follow preview, counters, clock, form.
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const lerp = (a, b, n) => a + (b - a) * n;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Preloader ---------- */
  const loader = $('#loader');
  const loaderCount = $('#loaderCount');
  const loaderFill = $('#loaderFill');
  document.body.classList.add('is-loading');

  let progress = 0;
  const loaderStart = performance.now();
  const loaderDur = 1600;

  function tickLoader(now) {
    const t = Math.min((now - loaderStart) / loaderDur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    progress = Math.round(eased * 100);
    if (loaderCount) loaderCount.textContent = String(progress).padStart(2, '0');
    if (loaderFill) loaderFill.style.width = progress + '%';

    if (t < 1) {
      requestAnimationFrame(tickLoader);
    } else {
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        revealHero();
      }, 200);
    }
  }

  if (loader && !prefersReduced) {
    requestAnimationFrame(tickLoader);
  } else if (loader) {
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
  } else {
    document.body.classList.remove('is-loading');
  }

  /* ---------- 2. Custom cursor ---------- */
  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let px = mx, py = my;

  if (cursor && !prefersReduced) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    (function raf() {
      cx = lerp(cx, mx, 0.18);
      cy = lerp(cy, my, 0.18);
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(raf);
    })();

    // Hover states
    $$('a, button, summary, .work-row, .btn, details > summary').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- 3. Project preview (cursor follow) ---------- */
  const preview = $('#preview');
  const previewItems = $$('.preview-item');
  const workRows = $$('.work-row');
  let pvX = 0, pvY = 0;
  let pvTargetX = 0, pvTargetY = 0;
  let previewOn = false;

  if (preview && !prefersReduced) {
    (function raf() {
      pvX = lerp(pvX, pvTargetX, 0.12);
      pvY = lerp(pvY, pvTargetY, 0.12);
      preview.style.transform = `translate3d(${pvX - 170}px, ${pvY - 120}px, 0)`;
      requestAnimationFrame(raf);
    })();

    workRows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        const idx = parseInt(row.dataset.idx, 10);
        previewItems.forEach((it) => it.classList.toggle('is-active', parseInt(it.dataset.idx, 10) === idx));
        preview.classList.add('is-on');
        previewOn = true;
        if (cursor) {
          cursor.classList.add('is-view');
          if (cursorLabel) cursorLabel.textContent = 'View';
        }
      });

      row.addEventListener('mouseleave', () => {
        preview.classList.remove('is-on');
        previewOn = false;
        if (cursor) cursor.classList.remove('is-view');
      });

      row.addEventListener('mousemove', (e) => {
        pvTargetX = e.clientX;
        pvTargetY = e.clientY;
      });
    });
  }

  /* ---------- 4. Magnetic buttons ---------- */
  if (!prefersReduced) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${relX * 0.18}px, ${relY * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 5. Menu ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#menu');

  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 400);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu(); menuBtn.focus();
      }
    });
  }

  /* ---------- 6. Header + progress ---------- */
  const hdr = $('#hdr');
  const progressBar = $('#progress');
  const progressLine = $('.progress-line');

  function onScroll() {
    if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 10);
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressLine) progressLine.style.setProperty('--p', pct + '%');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 7. Scroll reveals ---------- */
  const revealEls = $$('.reveal-line, .reveal-block');
  if (!('IntersectionObserver' in window) || prefersReduced) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Hero reveal (after loader) ---------- */
  function revealHero() {
    $$('.hero .reveal-line, .hero .reveal-block').forEach((el, i) => {
      el.style.setProperty('--delay', (i * 0.06) + 's');
      el.classList.add('is-visible');
    });
  }
  if (prefersReduced) revealHero();

  /* ---------- 8. Counters ---------- */
  const statNums = $$('.stat-num');
  if ('IntersectionObserver' in window && statNums.length && !prefersReduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const dur = 1600;
        function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    statNums.forEach((el) => io.observe(el));
  } else {
    statNums.forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
  }

  /* ---------- 9. Clock ---------- */
  const clock = $('#clock');
  if (clock) {
    function updateClock() {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      clock.textContent = `${hh}:${mm}:${ss}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ---------- 10. Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 11. Form validation ---------- */
  const form = $('#contact-form');
  if (!form) return;

  const submitBtn = $('#submit-btn');
  const statusEl = $('#form-status');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  const rules = {
    name(v) {
      const t = v.trim();
      if (!t) return 'Please enter your name.';
      if (t.length < 2) return 'Name must be at least 2 characters.';
      if (t.length > 80) return 'Name must be under 80 characters.';
      return '';
    },
    email(v) {
      const t = v.trim();
      if (!t) return 'Please enter your email.';
      if (!EMAIL_RE.test(t)) return 'Please enter a valid email.';
      return '';
    },
    message(v) {
      const t = v.trim();
      if (!t) return 'Please write a message.';
      if (t.length < 10) return 'Message must be at least 10 characters.';
      if (t.length > 1200) return 'Message must be under 1200 characters.';
      return '';
    }
  };

  function setFieldState(input, err) {
    const field = input.closest('.field');
    const errEl = field ? $('.field-error', field) : null;
    if (errEl) errEl.textContent = err;
    if (field) {
      field.classList.toggle('is-invalid', Boolean(err));
      field.classList.toggle('is-valid', !err && input.value.trim() !== '');
    }
    input.setAttribute('aria-invalid', err ? 'true' : 'false');
  }

  function validate(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const err = rule(input.value);
    setFieldState(input, err);
    return !err;
  }

  Object.keys(rules).forEach((n) => {
    const input = form.elements[n];
    if (!input) return;
    input.addEventListener('blur', () => validate(input));
    input.addEventListener('input', () => {
      const f = input.closest('.field');
      if (f && f.classList.contains('is-invalid')) validate(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    let allValid = true;
    Object.keys(rules).forEach((n) => {
      const input = form.elements[n];
      if (!input) return;
      if (!validate(input)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });
    if (!allValid) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      statusEl.className = 'form-status is-error';
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    const labelEl = $('.btn-label', submitBtn);
    const original = labelEl ? labelEl.textContent : 'Send message';
    submitBtn.disabled = true;
    if (labelEl) labelEl.textContent = 'Sending…';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    setTimeout(() => {
      submitBtn.disabled = false;
      if (labelEl) labelEl.textContent = original;
      statusEl.textContent = 'Thank you. Your message is on its way — I usually reply within 24 hours.';
      statusEl.className = 'form-status is-success';
      form.reset();
      $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
    }, 1200);
  });
})();