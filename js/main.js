/* ============================================
   PYRAMIDS – Site interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- header scroll state ---- */
  const header  = document.getElementById('header');
  const siteTop = document.getElementById('siteTop');
  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    header?.classList.toggle('is-scrolled', scrolled);
    siteTop?.classList.toggle('is-scrolled', scrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile nav ---- */
  const burger = document.getElementById('hamburger');
  const nav    = document.getElementById('nav');

  const closeNav = () => {
    burger?.classList.remove('is-open');
    nav?.classList.remove('is-open');
  };
  const openNav = () => {
    burger?.classList.add('is-open');
    nav?.classList.add('is-open');
  };

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && nav.classList.contains('is-open')) closeNav();
    });
  }

  /* ---- reveal on scroll ---- */
  const revealTargets = document.querySelectorAll(
    '.section__head, .card-office, .stat, .adv, .about__visual, .about__content, ' +
    '.hero__card, .contact__list li, .partner, .cta-strip__inner > *'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => io.observe(el));

  /* ---- count up ---- */
  const counters = document.querySelectorAll('[data-count]');
  const countUp = el => {
    const target = +el.dataset.count;
    const duration = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };
  const ioCount = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { countUp(e.target); ioCount.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => ioCount.observe(c));

  /* ---- gallery swiper ---- */
  if (window.Swiper && document.querySelector('.gallery__swiper')) {
    new Swiper('.gallery__swiper', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      grabCursor: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      speed: 700,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        640:  { spaceBetween: 24 },
        1024: { spaceBetween: 30 }
      }
    });
  }

  /* ---- forms (demo) ---- */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> שולח...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> נשלח בהצלחה';
        btn.style.background = '#1f8a4d';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.background = '';
        }, 2400);
      }, 900);
    });
  });

  /* ---- accessibility widget ---- */
  const a11yBtn      = document.getElementById('a11yBtn');
  const a11yPanel    = document.getElementById('a11yPanel');
  const a11yBackdrop = document.getElementById('a11yBackdrop');
  const a11yClose    = document.getElementById('a11yClose');
  const a11yReset    = document.getElementById('a11yReset');
  const a11yTiles    = document.querySelectorAll('.a11y-tile');
  const STORAGE      = 'pyr_a11y_v1';

  const togglePanel = (open) => {
    const isOpen = open ?? !a11yPanel.classList.contains('is-open');
    a11yPanel.classList.toggle('is-open', isOpen);
    a11yPanel.setAttribute('aria-hidden', !isOpen);
    a11yBtn.setAttribute('aria-expanded', isOpen);
    if (a11yBackdrop) a11yBackdrop.classList.toggle('is-open', isOpen);
    // lock body scroll on phone/tablet
    if (isOpen && window.matchMedia('(max-width: 980px)').matches) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  if (a11yBtn) a11yBtn.addEventListener('click', () => togglePanel());
  if (a11yClose) a11yClose.addEventListener('click', () => togglePanel(false));
  if (a11yBackdrop) a11yBackdrop.addEventListener('click', () => togglePanel(false));

  // map of feature -> body class (or special handler)
  const a11yFeatures = {
    contrast:   'a11y-contrast',
    bigtext:    'a11y-bigtext',
    spacing:    'a11y-spacing',
    lineheight: 'a11y-lineheight',
    links:      'a11y-links',
    hideimg:    'a11y-hideimg',
    motion:     'a11y-motion',
    cursor:     'a11y-cursor',
    dyslexia:   'a11y-dyslexia',
    grayscale:  'a11y-grayscale',
    tooltips:   'a11y-tooltips'
  };
  // align cycles between three states
  const alignStates = ['', 'a11y-align-right', 'a11y-align-center', 'a11y-align-justify'];

  const state = JSON.parse(localStorage.getItem(STORAGE) || '{}');

  const applyState = () => {
    Object.entries(a11yFeatures).forEach(([key, cls]) => {
      document.body.classList.toggle(cls, !!state[key]);
      const tile = document.querySelector(`.a11y-tile[data-a11y="${key}"]`);
      if (tile) tile.classList.toggle('is-active', !!state[key]);
    });
    alignStates.forEach(c => c && document.body.classList.remove(c));
    const alignIdx = state.align || 0;
    if (alignStates[alignIdx]) document.body.classList.add(alignStates[alignIdx]);
    const alignTile = document.querySelector('.a11y-tile[data-a11y="align"]');
    if (alignTile) alignTile.classList.toggle('is-active', alignIdx > 0);
  };

  const persist = () => localStorage.setItem(STORAGE, JSON.stringify(state));

  a11yTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const key = tile.dataset.a11y;
      if (key === 'align') {
        state.align = ((state.align || 0) + 1) % alignStates.length;
      } else {
        state[key] = !state[key];
      }
      applyState();
      persist();
    });
  });

  if (a11yReset) {
    a11yReset.addEventListener('click', () => {
      Object.keys(state).forEach(k => delete state[k]);
      applyState();
      persist();
    });
  }

  // modal handling (accessibility statement + privacy policy)
  const openModal = id => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeAllModals = () => {
    document.querySelectorAll('.modal.is-open').forEach(m => {
      m.classList.remove('is-open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      togglePanel(false);
      closeAllModals();
      openModal(el.dataset.modal);
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', closeAllModals);
  });

  // close on escape – panel + modals
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.querySelector('.modal.is-open')) closeAllModals();
    else if (a11yPanel.classList.contains('is-open')) togglePanel(false);
  });

  applyState();

  /* ---- subtle parallax on hero bg ---- */
  const heroBg = document.querySelector('.hero__bg img');
  if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 800) heroBg.style.transform = `translateY(${y * 0.18}px) scale(${1 + y * 0.0003})`;
    }, { passive: true });
  }

});
