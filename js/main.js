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

  if (hasGsap) gsap.registerPlugin(...[ScrollTrigger, hasSplit && SplitText].filter(Boolean));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
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
  function focusIn(container, delay = 0) {
    const img = container.querySelector('.media__img');
    return imageReady(img).then(() => gsap.fromTo(img,
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 1.5, ease: EASE, delay }));
  }

  /* ---------- Scroll suave (solo rueda del ratón; en táctil, scroll nativo) ---------- */
  let lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const headerHeight = () => document.querySelector('[data-header]')?.offsetHeight || 0;

  function scrollToTarget(target) {
    const offset = desktopQuery.matches ? -headerHeight() : 0;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.4 });
      return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  /* ---------- Cabecera: se esconde al bajar en móvil y vuelve al subir ---------- */
  const header = document.querySelector('[data-header]');
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
  let lastFocus = null;

  function openMenu() {
    if (menuOpen || !menu) return;
    menuOpen = true;
    lastFocus = document.activeElement;
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    root.classList.add('is-locked');
    lenis?.stop();
    menuClose.focus();
    if (motion) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' });
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

  /* ---------- Botón fijo de cita: aparece al dejar atrás el de la portada ---------- */
  const ctaBar = document.querySelector('[data-cta-bar]');
  const heroActions = document.querySelector('[data-hero-actions]');
  if (ctaBar && heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      ctaBar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(heroActions);
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
        gsap.fromTo(items[i].querySelector('.media__img'), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: EASE });
      }
    };

    rows.forEach((row, i) => {
      row.addEventListener('pointerenter', () => { if (desktopQuery.matches) activate(i); });
      row.addEventListener('focusin', () => activate(i));
    });
  }

  /* ---------- Lupa ----------
     Un círculo que amplía el punto marcado sobre la foto, unido a él por un
     filete. En escritorio sigue al cursor; en móvil recorre las uñas con el
     scroll. Sin animación, se queda quieta en el primer punto. */
  function initLoupe(fig) {
    const frame = fig.querySelector('.hero__frame');
    const lens = fig.querySelector('.loupe');
    const lensImg = lens?.querySelector('.loupe__img');
    const lines = fig.querySelectorAll('.loupe__guide line');
    const target = fig.querySelector('.loupe__target');
    if (!frame || !lens || !lensImg || !target) return;

    // En escritorio la foto ya se ve grande: menos aumento para no pasar de su resolución
    const zoomFor = () => parseFloat((desktopQuery.matches && fig.dataset.zoomDesktop) || fig.dataset.zoom) || 2;
    let zoom = zoomFor();
    const points = fig.dataset.points.trim().split(/\s+/).map((p) => p.split(',').map(Number));
    const state = { x: points[0][0], y: points[0][1] };
    let g = null;

    function render() {
      if (!g) return;
      const px = g.fx + state.x * g.w;
      const py = g.fy + state.y * g.h;
      const tx = g.r - state.x * g.w * zoom;
      const ty = g.r - state.y * g.h * zoom;
      lensImg.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      target.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);

      // Filete del punto a la lupa, de borde a borde
      const dx = g.cx - px;
      const dy = g.cy - py;
      const d = Math.hypot(dx, dy) || 1;
      const rim = g.r + 8;
      const visible = d > rim + 18;
      const ux = dx / d;
      const uy = dy / d;
      const coords = {
        x1: (px + ux * 12).toFixed(1),
        y1: (py + uy * 12).toFixed(1),
        x2: (g.cx - ux * rim).toFixed(1),
        y2: (g.cy - uy * rim).toFixed(1),
      };
      lines.forEach((line) => {
        Object.entries(coords).forEach(([k, v]) => line.setAttribute(k, v));
        line.style.opacity = visible ? '' : '0';
      });
      target.style.opacity = visible ? '' : '0';
    }

    function measure() {
      zoom = zoomFor();
      g = {
        fx: frame.offsetLeft,
        fy: frame.offsetTop,
        w: frame.offsetWidth,
        h: frame.offsetHeight,
        cx: lens.offsetLeft + lens.offsetWidth / 2,
        cy: lens.offsetTop + lens.offsetHeight / 2,
        r: lens.offsetWidth / 2,
      };
      lensImg.style.width = `${g.w * zoom}px`;
      lensImg.style.height = `${g.h * zoom}px`;
      render();
    }

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(fig);

    const pointerQuery = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
    const toPoint = (e) => {
      const r = frame.getBoundingClientRect();
      return [clamp((e.clientX - r.left) / r.width, 0.03, 0.97), clamp((e.clientY - r.top) / r.height, 0.03, 0.97)];
    };

    if (!hasGsap) {
      // Sin GSAP: la lupa sigue al cursor sin suavizado
      frame.addEventListener('pointermove', (e) => {
        if (!window.matchMedia(pointerQuery).matches) return;
        [state.x, state.y] = toPoint(e);
        render();
      });
      return;
    }

    // "always" garantiza que la función se ejecute aunque no se cumpla ninguna otra condición
    gsap.matchMedia().add({ always: 'all', pointer: pointerQuery, reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      const { pointer, reduce } = ctx.conditions;
      [state.x, state.y] = points[0];
      render();

      if (pointer) {
        const direct = (key) => (v) => { state[key] = v; render(); };
        const setX = reduce ? direct('x') : gsap.quickTo(state, 'x', { duration: 0.7, ease: 'power3.out', onUpdate: render });
        const setY = reduce ? direct('y') : gsap.quickTo(state, 'y', { duration: 0.7, ease: 'power3.out', onUpdate: render });
        const move = (e) => {
          const [x, y] = toPoint(e);
          setX(x);
          setY(y);
        };
        const leave = () => {
          setX(points[0][0]);
          setY(points[0][1]);
        };
        frame.addEventListener('pointermove', move);
        frame.addEventListener('pointerleave', leave);
        return () => {
          frame.removeEventListener('pointermove', move);
          frame.removeEventListener('pointerleave', leave);
        };
      }

      if (!reduce) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: frame, start: 'top 70%', end: 'bottom 25%', scrub: 0.6 },
        });
        points.slice(1).forEach(([x, y]) => tl.to(state, { x, y, ease: 'sine.inOut', onUpdate: render }));
      }
      return undefined;
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
    const start = performance.now();
    const tl = gsap.timeline({ defaults: { ease: EASE } });

    tl.fromTo('.site-header__inner', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1.2 }, 0.1);

    const title = document.querySelector('[data-hero-title]');
    if (title) splitLines(title, { delay: 0.15 });

    tl.fromTo('.hero [data-intro]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.55);

    const frame = document.querySelector('.hero__frame');
    if (frame) {
      tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.2);
      tl.fromTo(frame.querySelector('.media__lqip'), { scale: 1.3 }, { scale: 1.12, duration: 2 }, 0.2);
      imageReady(frame.querySelector('.media__img')).then(() => {
        const elapsed = (performance.now() - start) / 1000;
        focusIn(frame, Math.max(0, 1 - elapsed));
      });
    }

    tl.fromTo('.loupe', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.3 }, 1.2);
    tl.fromTo('.loupe__guide', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 1.6);
  }

  /* ---------- Revelados al hacer scroll ---------- */
  function reveals() {
    document.querySelectorAll('[data-split]').forEach((el) => {
      splitLines(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 1.1, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    // Servicios: el filete se dibuja, el texto sube y la lupa enfoca
    const rows = gsap.utils.toArray('[data-service]');
    gsap.set(rows.flatMap((row) => [...row.querySelectorAll('.rule')]), { scaleX: 0 });
    gsap.set(rows.flatMap((row) => [...row.querySelectorAll('.service__body, .service__cta')]), { opacity: 0, y: 24 });
    gsap.set(rows.map((row) => row.querySelector('.service__lens')), { opacity: 0, scale: 0.75 });

    ScrollTrigger.batch(rows, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => batch.forEach((row, i) => {
        const tl = gsap.timeline({ delay: i * 0.12, defaults: { ease: EASE } });
        tl.to(row.querySelectorAll('.rule'), { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0)
          .to(row.querySelectorAll('.service__body, .service__cta'), { opacity: 1, y: 0, duration: 1.1, stagger: 0.06 }, 0.25);
        const lens = row.querySelector('.service__lens');
        if (lens) {
          tl.to(lens, { opacity: 1, scale: 1, duration: 1.2 }, 0.15);
          if (lens.offsetParent !== null) focusIn(lens, 0.3 + i * 0.12);
          else gsap.set(lens.querySelector('.media__img'), { opacity: 1 });
        }
      }),
    });

    const preview = document.querySelector('.preview');
    if (preview) {
      gsap.fromTo(preview, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
        scrollTrigger: { trigger: preview, start: 'top 85%', once: true },
      });
      const first = preview.querySelector('.preview__item.is-active .media__img');
      if (first) gsap.fromTo(first, { scale: 1.12 }, {
        scale: 1, duration: 2, ease: EASE,
        scrollTrigger: { trigger: preview, start: 'top 85%', once: true },
      });
    }
  }

  /* ---------- Arranque ---------- */
  initServices();
  document.querySelectorAll('[data-loupe]').forEach(initLoupe);

  if (motion) {
    const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(1200)]) : Promise.resolve();
    fontsReady.then(() => {
      intro();
      reveals();
      ScrollTrigger.refresh();
    });
  }
})();
