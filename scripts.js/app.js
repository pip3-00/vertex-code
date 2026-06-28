/*
  Vertex Code - app.js
  - Scroll suave con offset (navbar fixed-top)
  - Menú activo por sección (IntersectionObserver)
  - Cierra el menú colapsable en mobile al hacer click
*/

(function () {
  'use strict';

  const sectionIds = ['inicio', 'servicios', 'contacto', 'nosotros'];
  const navLinks = Array.from(
    document.querySelectorAll('.navbar a.nav-link[href^="#"]')
  );

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navbar = document.querySelector('.navbar.fixed-top');

  function getNavbarOffset() {
    if (!navbar) return 0;
    // Altura real incluyendo borders
    return navbar.getBoundingClientRect().height;
  }

  function clearActive() {
    navLinks.forEach((a) => a.classList.remove('active'));
  }

  function setActiveBySectionId(sectionId) {
    const link = navLinks.find((a) => a.getAttribute('href') === `#${sectionId}`);
    if (!link) return;
    clearActive();
    link.classList.add('active');
  }

  // 1) Scroll suave con offset al clicar links de ancla
  document.addEventListener('click', (e) => {
    const target = e.target;
    const anchor = target && target.closest ? target.closest('a[href^="#"]') : null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const sectionId = href.slice(1);
    if (!sectionIds.includes(sectionId)) return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    e.preventDefault();

    // Cerrar collapse en mobile
    const collapse = document.getElementById('menu');
    if (collapse && collapse.classList.contains('show')) {
      // Bootstrap 5: colapsar vía API si existe
      try {
        const instance = bootstrap.Collapse.getOrCreateInstance(collapse, {
          toggle: false,
        });
        instance.hide();
      } catch (_) {
        collapse.classList.remove('show');
      }
    }

    const offset = getNavbarOffset();
    const top = section.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    // Marcar activo inmediatamente (mejora UX)
    setActiveBySectionId(sectionId);

    // Actualizar URL sin saltar
    if (history && history.pushState) {
      history.pushState(null, '', href);
    }
  });

  // 2) Menú activo por sección visible
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        // Preferimos el que está más visible
        const visible = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

        if (visible.length) {
          const id = visible[0].target.id;
          setActiveBySectionId(id);
        }
      },
      {
        // Ajustamos el “punto de activación” considerando navbar fija
        root: null,
        rootMargin: `-${getNavbarOffset()}px 0px -60% 0px`,
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  } else {
    // Fallback simple: por scroll
    const onScroll = () => {
      const offset = getNavbarOffset();
      const current = sections
        .slice()
        .reverse()
        .find((sec) => window.pageYOffset + offset >= sec.offsetTop);

      if (current) setActiveBySectionId(current.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 3) Selecciona activo inicial si el usuario entra con hash
  const initialHash = (location && location.hash ? location.hash : '').slice(1);
  if (initialHash && sectionIds.includes(initialHash)) {
    setActiveBySectionId(initialHash);
  }
})();

