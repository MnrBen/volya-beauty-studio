/* ==========================================================================
   VOLYA Beauty Studio — interacción y movimiento
   GSAP 3.15.0 (ScrollTrigger, SplitText) + Lenis 1.3.27.
   Si el dispositivo pide movimiento reducido no hay animaciones ni scroll
   suave, y todo el contenido se ve igual.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const hasSplit = typeof window.SplitText !== 'undefined';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = hasGsap && !prefersReduced && root.classList.contains('motion');

  window.__volyaMotion = true;
  if (!motion) root.classList.remove('motion');

  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  const EASE = 'expo.out';
  const OPEN = 'inset(0% 0% 0% 0%)';

  if (hasGsap) gsap.registerPlugin(...[ScrollTrigger, hasSplit && SplitText].filter(Boolean));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Resuelve cuando la imagen ya se puede pintar (también si falla, para no bloquear).
  function imageReady(img) {
    if (!img) return Promise.resolve();
    const loaded = img.complete && img.naturalWidth
      ? Promise.resolve()
      : new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    return loaded.then(() => (img.decode ? img.decode().catch(() => {}) : undefined));
  }

  // Efecto de enfoque: la foto nítida aparece sobre su miniatura borrosa.
  // Termina siempre a escala 1: la foto nunca queda ampliada.
  function focusIn(container, delay = 0) {
    const img = container.querySelector('.media__img');
    return imageReady(img).then(() => gsap.fromTo(img,
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 1.5, ease: EASE, delay }));
  }

  // La foto se descubre de abajo arriba y después enfoca.
  function revealMedia(media, delay = 0) {
    gsap.to(media, { clipPath: OPEN, duration: 1.4, ease: 'expo.inOut', delay });
    focusIn(media, delay + 0.35);
  }

  /* ---------- Scroll suave (solo rueda del ratón; en táctil, scroll nativo) ---------- */
  let lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const header = document.querySelector('[data-header]');
  const headerHeight = () => header?.offsetHeight || 0;

  function scrollToTarget(target) {
    const offset = desktopQuery.matches ? -headerHeight() : 0;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.4 });
      return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  /* ---------- Cabecera: en móvil se esconde al bajar y vuelve al subir ---------- */
  let menuOpen = false;
  let lastY = window.scrollY;

  function updateHeader() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(y - lastY) < 6) return;
    const hide = !desktopQuery.matches && !menuOpen && y > lastY && y > 160;
    header.classList.toggle('is-hidden', hide);
    lastY = y;
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ---------- Menú (móvil y tablet) ---------- */
  const menu = document.getElementById('menu');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menuClose = menu?.querySelector('[data-menu-close]');

  function openMenu() {
    if (menuOpen || !menu) return;
    menuOpen = true;
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    root.classList.add('is-locked');
    lenis?.stop();
    menuClose.focus();
    if (motion) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: OPEN, duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(menu.querySelectorAll('[data-menu-item]'),
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.05, ease: EASE, delay: 0.3 });
    }
  }

  function closeMenu(restoreFocus = true) {
    if (!menuOpen) return;
    menuOpen = false;
    menuToggle.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-locked');
    lenis?.start();
    const done = () => {
      menu.hidden = true;
      if (hasGsap) gsap.set(menu, { clearProps: 'clipPath' });
      if (restoreFocus) menuToggle.focus();
    };
    if (motion) {
      gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: done });
    } else {
      done();
    }
  }

  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', () => closeMenu());

  document.addEventListener('keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...menu.querySelectorAll('a[href], button:not([disabled])')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  desktopQuery.addEventListener('change', (e) => { if (e.matches) closeMenu(false); });

  /* ---------- Enlaces internos ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    const target = id.length > 1 && document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    if (menuOpen) closeMenu(false);
    scrollToTarget(target);
    history.pushState(null, '', id);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- Botón fijo de cita ----------
     Aparece al dejar atrás el de la portada y se retira en Contacto, donde
     ya están los mismos botones. */
  const ctaBar = document.querySelector('[data-cta-bar]');
  const heroActions = document.querySelector('[data-hero-actions]');
  const contact = document.querySelector('[data-contact]');
  if (ctaBar && heroActions && 'IntersectionObserver' in window) {
    let pastHero = false;
    let atContact = false;
    const sync = () => ctaBar.classList.toggle('is-visible', pastHero && !atContact);
    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sync();
    }).observe(heroActions);
    if (contact) {
      new IntersectionObserver(([entry]) => {
        atContact = entry.isIntersecting || entry.boundingClientRect.top < 0;
        sync();
      }, { rootMargin: '0px 0px -30% 0px' }).observe(contact);
    }
  }

  /* ---------- Servicios: vista previa de escritorio ---------- */
  function initServices() {
    const rows = [...document.querySelectorAll('[data-service]')];
    const items = [...document.querySelectorAll('.preview__item')];
    if (!rows.length || rows.length !== items.length) return;
    let active = rows.findIndex((row) => row.classList.contains('is-active'));
    if (active < 0) active = 0;

    const activate = (i) => {
      if (i === active) return;
      rows[active].classList.remove('is-active');
      items[active].classList.remove('is-active');
      active = i;
      rows[i].classList.add('is-active');
      items[i].classList.add('is-active');
      if (motion) {
        gsap.fromTo(items[i].querySelector('.media__img'), { scale: 1.06 }, { scale: 1, duration: 1.4, ease: EASE });
      }
    };

    rows.forEach((row, i) => {
      row.addEventListener('pointerenter', () => { if (desktopQuery.matches) activate(i); });
      row.addEventListener('focusin', () => activate(i));
    });
  }

  /* ---------- Títulos por líneas ---------- */
  function splitLines(el, vars) {
    gsap.set(el, { opacity: 1 });
    if (!hasSplit) {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: EASE, ...vars });
      return;
    }
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 120, duration: 1.3, stagger: 0.09, ease: EASE, ...vars }),
    });
  }

  /* ---------- Entrada de la portada ---------- */
  function intro() {
    const tl = gsap.timeline({ defaults: { ease: EASE } });

    tl.fromTo('.site-header__inner', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1.2 }, 0.2);

    const title = document.querySelector('[data-hero-title]');
    if (title) splitLines(title, { delay: 0.35 });

    tl.fromTo('.hero [data-intro]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.75);

    // La foto principal se abre primero; la de labios (solo escritorio), después.
    const photos = [...document.querySelectorAll('.hero__photo')].filter((fig) => fig.offsetParent !== null);
    photos.forEach((fig, i) => {
      revealMedia(fig.querySelector('.media'), 0.05 + i * 0.3);
      tl.fromTo(fig.querySelector('figcaption'), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4 + i * 0.2);
    });
    // Fotos ocultas a este ancho: se dejan visibles por si la ventana cambia de tamaño
    document.querySelectorAll('.hero__photo').forEach((fig) => {
      if (fig.offsetParent !== null) return;
      gsap.set(fig.querySelector('.media'), { clipPath: OPEN });
      gsap.set([fig.querySelector('figcaption'), fig.querySelector('.media__img')], { opacity: 1 });
    });
  }

  /* ---------- Revelados al hacer scroll ---------- */
  function reveals() {
    document.querySelectorAll('[data-split]').forEach((el) => {
      splitLines(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 1.1, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });

    document.querySelectorAll('[data-media-reveal]').forEach((media) => {
      ScrollTrigger.create({
        trigger: media,
        start: 'top 85%',
        once: true,
        onEnter: () => revealMedia(media, media.closest('.feature__inset') ? 0.45 : 0),
      });
    });

    // Servicios: el filete se dibuja, el texto sube y la miniatura se descubre
    const rows = gsap.utils.toArray('[data-service]');
    gsap.set(rows.flatMap((row) => [...row.querySelectorAll('.rule')]), { scaleX: 0 });
    gsap.set(rows.flatMap((row) => [...row.querySelectorAll('.service__body, .service__cta')]), { opacity: 0, y: 24 });

    ScrollTrigger.batch(rows, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => batch.forEach((row, i) => {
        const delay = i * 0.12;
        const tl = gsap.timeline({ delay, defaults: { ease: EASE } });
        tl.to(row.querySelectorAll('.rule'), { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0)
          .to(row.querySelectorAll('.service__body, .service__cta'), { opacity: 1, y: 0, duration: 1.1, stagger: 0.06 }, 0.25);
        const thumb = row.querySelector('.service__thumb');
        if (thumb && thumb.offsetParent !== null) revealMedia(thumb, delay + 0.1);
        else if (thumb) gsap.set(thumb, { clipPath: OPEN });
      }),
    });

    const preview = document.querySelector('.preview');
    if (preview) {
      gsap.to(preview, {
        clipPath: OPEN, duration: 1.5, ease: 'expo.inOut',
        scrollTrigger: { trigger: preview, start: 'top 85%', once: true },
      });
      const first = preview.querySelector('.preview__item.is-active .media__img');
      if (first) gsap.fromTo(first, { scale: 1.1 }, {
        scale: 1, duration: 2, ease: EASE,
        scrollTrigger: { trigger: preview, start: 'top 85%', once: true },
      });
    }

    // Escritorio: las fotos se desplazan a distinto ritmo (solo traslación, sin ampliar)
    gsap.matchMedia().add('(min-width: 1024px)', () => {
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const factor = parseFloat(el.dataset.parallax) || 0;
        // En la portada se mide desde arriba del todo, para que las fotos arranquen en su sitio
        const hero = el.closest('.hero');
        gsap.to(el, {
          y: () => factor * window.innerHeight,
          ease: 'none',
          scrollTrigger: hero
            ? { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
            : { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
        });
      });
    });
  }

  /* ---------- Arranque ---------- */
  initServices();

  if (motion) {
    const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(1200)]) : Promise.resolve();
    fontsReady.then(() => {
      intro();
      reveals();
      ScrollTrigger.refresh();
    });
  }
})();
