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

  /* ---------- Cabecera ----------
     Clara y transparente sobre las fotos de la portada; con fondo marfil
     después. En móvil se esconde al bajar y vuelve al subir. */
  const hero = document.querySelector('[data-hero]');
  let menuOpen = false;
  let lastY = window.scrollY;

  function updateHeader() {
    const y = window.scrollY;
    const overHero = !!hero && hero.getBoundingClientRect().bottom > headerHeight();
    header.classList.toggle('on-dark', overHero);
    header.classList.toggle('is-scrolled', !overHero && y > 8);
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

  /* ---------- Muro de la portada ----------
     Cada columna repite su juego de fotos las veces necesarias para cubrir
     la pantalla y se desplaza en bucle, una hacia arriba y la siguiente hacia
     abajo. Solo traslación: las fotos nunca se amplían. */
  function initWall() {
    const wall = document.querySelector('[data-wall]');
    if (!wall) return;
    const markLoaded = (img) => {
      const done = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done();
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    };
    wall.querySelectorAll('.wall__img').forEach(markLoaded);
    if (!motion) return;

    const tweens = [];
    const build = () => {
      tweens.forEach((t) => t.kill());
      tweens.length = 0;
      wall.querySelectorAll('[data-wall-col]').forEach((col, i) => {
        const track = col.querySelector('.wall__track');
        track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
        gsap.set(track, { clearProps: 'transform' });
        if (col.offsetParent === null) return;
        const set = track.querySelector('.wall__set');
        const setH = set.offsetHeight;
        if (!setH) return;
        const copies = Math.ceil((wall.offsetHeight + Math.abs(col.offsetTop) + setH) / setH);
        for (let k = 0; k < copies; k++) {
          const clone = set.cloneNode(true);
          clone.setAttribute('data-clone', '');
          clone.querySelectorAll('img').forEach(markLoaded);
          track.appendChild(clone);
        }
        const up = i % 2 === 0;
        tweens.push(gsap.fromTo(track,
          { y: up ? 0 : -setH },
          { y: up ? -setH : 0, duration: setH / 16, ease: 'none', repeat: -1 }));
      });
    };
    build();

    // Fuera de pantalla, el muro se para para no gastar batería
    ScrollTrigger.create({
      trigger: wall,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });

    let lastW = window.innerWidth;
    let timer;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(build, 250);
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

    tl.fromTo('[data-wall-col]', { opacity: 0, yPercent: 6 }, { opacity: 1, yPercent: 0, duration: 1.8, stagger: 0.12 }, 0);
    tl.fromTo('.site-header__inner', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1.2 }, 0.3);

    const title = document.querySelector('[data-hero-title]');
    if (title) splitLines(title, { delay: 0.45 });

    tl.fromTo('.hero [data-intro]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.85);
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
        onEnter: () => {
          // En el collage de uñas, las fotos se descubren una tras otra
          const gallery = media.closest('.svc__gallery');
          const delay = gallery ? [...gallery.children].indexOf(media) * 0.18 : (media.closest('.feature__inset') ? 0.45 : 0);
          revealMedia(media, delay);
        },
      });
    });

    // Servicios: nombre y botón suben al entrar cada bloque
    document.querySelectorAll('.svc').forEach((svc) => {
      gsap.fromTo(svc.querySelectorAll('.svc__name, .svc__cta'), { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: EASE,
        scrollTrigger: { trigger: svc, start: 'top 80%', once: true },
      });
    });

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
  initWall();

  if (motion) {
    const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(1200)]) : Promise.resolve();
    fontsReady.then(() => {
      intro();
      reveals();
      ScrollTrigger.refresh();
    });
  }
})();
