/* ============================================================
   ANIRUDDH — PORTFOLIO MAIN SCRIPT
   Loading screen · Theme toggle · Navbar · Scroll reveal
   Counters · Ripple · Cursor glow · Process line · Active nav
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------------
  // 1. LOADING SCREEN — hide once page has loaded
  // ----------------------------------------------------------
  const loader = document.getElementById('loader');
  const hideLoader = () => {
    loader.classList.add('hidden');
    document.body.classList.remove('is-loading');
  };
  document.body.classList.add('is-loading');
  // Fallback timer in case 'load' is delayed (e.g. fonts)
  const loaderTimeout = setTimeout(hideLoader, 2200);
  window.addEventListener('load', () => {
    clearTimeout(loaderTimeout);
    setTimeout(hideLoader, 300);
  });

  // ----------------------------------------------------------
  // 2. DARK MODE TOGGLE (persisted in localStorage)
  // ----------------------------------------------------------
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  // Restore saved theme, else respect OS preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ----------------------------------------------------------
  // 3. NAVBAR — glass background on scroll + mobile menu
  // ----------------------------------------------------------
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile hamburger
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ----------------------------------------------------------
  // 4. ACTIVE NAV LINK — highlight section in view
  // ----------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach((a) => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => spy.observe(s));

  // ----------------------------------------------------------
  // 5. FADE-UP ON SCROLL + PROCESS LINE ANIMATION
  // ----------------------------------------------------------
  const revealEls = document.querySelectorAll('.fade-up');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Animate the process timeline line when it scrolls into view
  const processTrack = document.querySelector('.process-track');
  if (processTrack) {
    const processObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            processTrack.classList.add('in-view');
            obs.unobserve(processTrack);
          }
        });
      },
      { threshold: 0.3 }
    );
    processObserver.observe(processTrack);
  }

  // ----------------------------------------------------------
  // 6. NUMBER COUNTERS — count up when visible
  // ----------------------------------------------------------
  const counters = document.querySelectorAll('.stat-num[data-count]');
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);

        const target = parseInt(el.dataset.count, 10);
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out curve for a premium feel
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  // ----------------------------------------------------------
  // 7. BUTTON RIPPLE EFFECT
  // ----------------------------------------------------------
  document.querySelectorAll('.ripple').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);
      const ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = `${diameter}px`;
      ink.style.left = `${e.clientX - rect.left - diameter / 2}px`;
      ink.style.top = `${e.clientY - rect.top - diameter / 2}px`;
      btn.appendChild(ink);
      ink.addEventListener('animationend', () => ink.remove());
    });
  });

  // ----------------------------------------------------------
  // 8. CURSOR GLOW (desktop / fine pointers only)
  // ----------------------------------------------------------
  const glow = document.getElementById('cursorGlow');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover) {
    let gx = 0;   // target (raw cursor)
    let gy = 0;
    let tx = 0;   // current (smoothed)
    let ty = 0;
    const HALF = 210; // half of glow size (420px)

    window.addEventListener('mousemove', (e) => {
      gx = e.clientX;
      gy = e.clientY;
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });

    // Lerp toward the cursor each frame for a soft trailing glow
    (function follow() {
      tx += (gx - tx) * 0.08;
      ty += (gy - ty) * 0.08;
      glow.style.transform = `translate(${tx - HALF}px, ${ty - HALF}px)`;
      requestAnimationFrame(follow);
    })();
  }
});
