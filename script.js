document.addEventListener('DOMContentLoaded', () => {
  // LOADER
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('loaded'), 1200));
  setTimeout(() => loader.classList.add('loaded'), 3500);

  // LENIS SMOOTH SCROLL (Configuração leve e fluida)
  const lenis = new Lenis({
    duration: 0.9,          // Velocidade da animação (menor = mais ágil)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva natural
    smoothWheel: true,
    wheelMultiplier: 0.5,   // Sensibilidade leve (não pesada)
    touchMultiplier: 1.2,   // Toque mobile fluido
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // HEADER GLASS EFFECT
  const header = document.getElementById('header');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // MOBILE MENU
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navClose = document.getElementById('navClose');
  const menuOverlay = document.getElementById('menuOverlay');

  function openMenu() {
    nav.classList.add('open');
    menuOverlay.classList.add('active');
    menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    lenis.stop(); // Pausa scroll suave ao abrir menu
  }
  function closeMenu() {
    nav.classList.remove('open');
    menuOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
    lenis.start(); // Retoma scroll
  }
  menuToggle.addEventListener('click', openMenu);
  navClose.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

  // ACTIVE NAV LINK
  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    document.querySelectorAll('section[id]').forEach(sec => {
      const top = sec.offsetTop, height = sec.offsetHeight, id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  // COUNTERS
  const counters = document.querySelectorAll('.hero-stat-number');
  const startCounters = () => counters.forEach(c => {
    const target = +c.dataset.count, duration = 1800, start = Date.now();
    const run = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      c.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(run);
      else c.textContent = target.toLocaleString('pt-BR');
    };
    setTimeout(run, 1500);
  });
  startCounters();

  // SCROLL REVEAL (Otimizado)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 50);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.service-card, .about-image, .about-content, .about-feature, .contact-info, .contact-map, .faq-item, .gallery-item').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // TESTIMONIALS SLIDER
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('testDots');
  const slides = track ? track.children : [];
  let current = 0, autoInterval;

  if (slides.length > 0) {
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.classList.add('testimonials-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.children;
    const goTo = idx => {
      current = idx;
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dots).forEach((d, i) => d.classList.toggle('active', i === current));
    };
    const next = () => goTo((current + 1) % slides.length);
    const prev = () => goTo((current - 1 + slides.length) % slides.length);

    document.getElementById('testNext').addEventListener('click', () => { next(); resetAuto(); });
    document.getElementById('testPrev').addEventListener('click', () => { prev(); resetAuto(); });
    const resetAuto = () => { clearInterval(autoInterval); autoInterval = setInterval(next, 5000); };
    autoInterval = setInterval(next, 5000);

    let tx = 0;
    track.addEventListener('touchstart', e => tx = e.changedTouches[0].screenX, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
    }, { passive: true });
  }

  // FAQ ACCORDION
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const open = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!open) item.classList.add('active');
    });
  });

  // SMOOTH SCROLL PARA LINKS (Usa Lenis para navegação perfeita)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        lenis.scrollTo(t, { offset: -header.offsetHeight });
      }
    });
  });
});