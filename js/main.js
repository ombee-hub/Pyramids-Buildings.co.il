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
  const burger   = document.getElementById('hamburger');
  const nav      = document.getElementById('nav');
  const navClose = document.getElementById('navClose');

  // dimmed backdrop behind the drawer – lives in the header so it shares its stacking context
  const navBackdrop = document.createElement('div');
  navBackdrop.className = 'nav-backdrop';
  header?.appendChild(navBackdrop);

  const closeNav = () => {
    burger?.classList.remove('is-open');
    nav?.classList.remove('is-open');
    navBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  const openNav = () => {
    burger?.classList.add('is-open');
    nav?.classList.add('is-open');
    navBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    navClose?.addEventListener('click', closeNav);
    navBackdrop.addEventListener('click', closeNav);
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

  /* ---- cookie consent ---- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');
  const COOKIE_STORE = 'pyr_cookies_v1';

  const showBanner = () => {
    cookieBanner?.classList.add('is-open');
    cookieBanner?.setAttribute('aria-hidden', 'false');
  };
  const hideBanner = () => {
    cookieBanner?.classList.remove('is-open');
    cookieBanner?.setAttribute('aria-hidden', 'true');
  };
  const saveConsent = (accepted) => {
    sessionStorage.setItem(COOKIE_STORE, JSON.stringify({ accepted, ts: Date.now() }));
    hideBanner();
  };

  // show on every page load (until the visitor chooses for this session)
  setTimeout(showBanner, 900);

  cookieAccept?.addEventListener('click', () => saveConsent(true));
  cookieReject?.addEventListener('click', () => saveConsent(false));

  /* ---- subtle parallax on hero bg ---- */
  const heroBg = document.querySelector('.hero__bg img');
  if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 800) heroBg.style.transform = `translateY(${y * 0.18}px) scale(${1 + y * 0.0003})`;
    }, { passive: true });
  }

});
