/*
  Three jobs, and nothing else:
    1. the light/dark switch,
    2. the EN/PL switch,
    3. the Ulam spiral in the hero.

  No framework and no network. The page must read with JavaScript switched off, so
  English lives in the HTML and Polish lives in data-pl attributes beside it. The two
  controls do nothing without JavaScript, so the markup hides them until this runs.
*/
(() => {
  'use strict';

  const THEME_KEY = 'bn.theme';
  const LANG_KEY = 'bn.lang';

  function readStored(key, allowed) {
    try {
      const value = localStorage.getItem(key);
      return allowed.includes(value) ? value : null;
    } catch (err) { return null; }     // private mode, or storage disabled
  }

  function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* nothing to do */ }
  }

  const controls = document.querySelector('.controls');
  if (controls) controls.removeAttribute('hidden');

  /* ── 1. theme ─────────────────────────────────────────────────────────── */

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeButton = document.getElementById('theme');

  const THEME_LABEL = {
    en: { light: 'Switch to dark mode', dark: 'Switch to light mode' },
    pl: { light: 'Przełącz na tryb ciemny', dark: 'Przełącz na tryb jasny' }
  };

  function activeTheme() {
    return readStored(THEME_KEY, ['light', 'dark']) || (prefersDark.matches ? 'dark' : 'light');
  }

  function paintTheme() {
    const theme = activeTheme();
    if (themeButton) {
      themeButton.dataset.effective = theme;
      themeButton.setAttribute('aria-label', THEME_LABEL[activeLanguage][theme]);
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0b0e14' : '#fbfbfd';
    redraw();
  }

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const next = activeTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      writeStored(THEME_KEY, next);
      paintTheme();
    });
  }

  // Only matters while no explicit choice is stored — then the system still leads.
  prefersDark.addEventListener('change', paintTheme);

  /* ── 2. language ──────────────────────────────────────────────────────── */

  const DESCRIPTION = {
    en: 'After-hours projects built with AI acceleration: Ulam (maths for children, ' +
        'heading for Google Play), Kvasir, Minerals, Harpa, DadQuest.',
    pl: 'Projekty hobbystyczne budowane po godzinach z akceleracją AI: Ulam ' +
        '(matematyka dla dzieci, w drodze do Google Play), Kvasir, Minerals, Harpa, DadQuest.'
  };

  // Capture the English, once, before anything replaces it.
  const texts = Array.from(document.querySelectorAll('[data-pl]'));
  texts.forEach((el) => { el.dataset.en = el.innerHTML; });

  const labels = Array.from(document.querySelectorAll('[data-pl-label]'));
  labels.forEach((el) => { el.dataset.enLabel = el.getAttribute('aria-label') || ''; });

  const languageButtons = Array.from(document.querySelectorAll('.lang-btn'));
  let activeLanguage = 'en';

  function applyLanguage(lang) {
    activeLanguage = lang;
    document.documentElement.lang = lang;

    texts.forEach((el) => {
      const value = el.dataset[lang];
      if (value !== undefined) el.innerHTML = value;
    });

    labels.forEach((el) => {
      const value = lang === 'pl' ? el.dataset.plLabel : el.dataset.enLabel;
      if (value) el.setAttribute('aria-label', value);
    });

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = DESCRIPTION[lang];

    languageButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    paintTheme();      // the theme button's label is language-dependent
  }

  languageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
      writeStored(LANG_KEY, btn.dataset.lang);
    });
  });

  /* ── the address, assembled only on demand ────────────────────────────── */

  const copyButton = document.querySelector('.copy');
  const DONE = { en: 'Copied ✓', pl: 'Skopiowano ✓' };

  if (copyButton && navigator.clipboard) {
    copyButton.removeAttribute('hidden');
    copyButton.addEventListener('click', () => {
      const address = 'krzysztof' + String.fromCharCode(64) + 'blinkneuron.eu';
      navigator.clipboard.writeText(address).then(() => {
        copyButton.textContent = DONE[activeLanguage];
        copyButton.classList.add('done');
        setTimeout(() => {
          copyButton.innerHTML = copyButton.dataset[activeLanguage];
          copyButton.classList.remove('done');
        }, 1600);
      }).catch(() => { /* the address is on the page anyway */ });
    });
  }

  /* ── 3. the Ulam spiral ───────────────────────────────────────────────── */

  const canvas = document.getElementById('spiral');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  const SIZE = 41;                       // odd, so 1 sits in the middle
  const HALF = (SIZE - 1) / 2;

  function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
    return true;
  }

  // Walk out from the centre: one step, one step, two steps, two steps, three...
  // turning left after each leg. That walk is the spiral.
  function spiral(size) {
    const out = [[1, 0, 0]];
    const directions = [[1, 0], [0, -1], [-1, 0], [0, 1]];
    const last = size * size;
    let x = 0, y = 0, n = 1, leg = 1, dir = 0;
    while (n < last) {
      for (let turn = 0; turn < 2 && n < last; turn += 1) {
        for (let step = 0; step < leg && n < last; step += 1) {
          x += directions[dir][0];
          y += directions[dir][1];
          n += 1;
          if (Math.abs(x) <= HALF && Math.abs(y) <= HALF) out.push([n, x, y]);
        }
        dir = (dir + 1) % 4;
      }
      leg += 1;
    }
    return out;
  }

  const CELLS = ctx ? spiral(SIZE) : [];

  function draw() {
    if (!ctx) return;
    const width = Math.round(canvas.getBoundingClientRect().width);
    if (!width) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * ratio);
    canvas.height = canvas.width;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, width);

    const style = getComputedStyle(document.documentElement);
    const prime = style.getPropertyValue('--cyan').trim() || '#12b394';
    const rest = style.getPropertyValue('--edge-2').trim() || '#cfd6e2';

    const step = width / SIZE;
    const centre = width / 2;

    for (const [n, x, y] of CELLS) {
      // Fade the outer ring so the field ends softly instead of at a hard square.
      const reach = Math.max(Math.abs(x), Math.abs(y)) / HALF;
      const alpha = reach < 0.62 ? 1 : Math.max(0.28, 1 - (reach - 0.62) / 0.38);
      const lit = isPrime(n);

      // The composites are the graph paper. Hold them well back, or the diagonals
      // the whole picture exists to show do not come through.
      ctx.globalAlpha = lit ? alpha : alpha * 0.5;
      ctx.fillStyle = lit ? prime : rest;
      ctx.beginPath();
      ctx.arc(centre + x * step, centre + y * step, step * (lit ? 0.29 : 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let queued = false;
  function redraw() {
    if (!ctx || queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; draw(); });
  }

  window.addEventListener('resize', redraw);

  /* ── start, once every declaration above exists ───────────────────────── */

  // applyLanguage paints the theme too. A document page (the privacy policy) has no
  // switch and no data-pl nodes, so it only needs the theme.
  if (languageButtons.length) applyLanguage(readStored(LANG_KEY, ['en', 'pl']) || 'en');
  else paintTheme();
  draw();
})();
