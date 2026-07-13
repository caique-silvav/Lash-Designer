document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. LOADER
  // ==========================================
  const loader = document.getElementById('loader');
  
  // Remove o loader quando a página carrega
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loaded');
    }, 1200);
  });

  // Fallback: remove o loader em 3.5s mesmo se algo travar
  setTimeout(() => {
    loader.classList.add('loaded');
  }, 3500);

  // ==========================================
  // 2. LENIS SMOOTH SCROLL (Configuração Leve)
  // ==========================================
  const lenis = new Lenis({
    duration: 0.9,          // Velocidade da animação
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva natural
    smoothWheel: true,
    wheelMultiplier: 0.5,   // Sensibilidade leve
    touchMultiplier: 1.2,   // Toque mobile fluido
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ==========================================
  // 3. HEADER GLASS EFFECT (Ao rolar)
  // ==========================================
  const header = document.getElementById('header');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Adiciona classe 'scrolled' se rolar mais de 40px
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

  // ==========================================
  // 4. MOBILE MENU
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navClose = document.getElementById('navClose');
  const menuOverlay = document.getElementById('menuOverlay');

  function openMenu() {
    nav.classList.add('open');
    menuOverlay.classList.add('active');
    menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    lenis.stop(); // Pausa o scroll suave ao abrir o menu
  }

  function closeMenu() {
    nav.classList.remove('open');
    menuOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
    lenis.start(); // Retoma o scroll ao fechar
  }

  menuToggle.addEventListener('click', openMenu);
  navClose.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);

  // Fecha o menu ao clicar em um link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ==========================================
  // 5. ACTIVE NAV LINK (Destaque no menu atual)
  // ==========================================
  function updateActiveNav() {
    const scrollY = window.scrollY + 150; // Offset para detectar melhor

    document.querySelectorAll('section[id]').forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href') === `#${id}`) {
            l.classList.add('active');
          }
        });
      }
    });
  }

  // ==========================================
  // 6. COUNTERS (Animação dos números no Hero)
  // ==========================================
  const counters = document.querySelectorAll('.hero-stat-number');
  const startCounters = () => counters.forEach(c => {
    const target = +c.dataset.count;
    const duration = 1800;
    const start = Date.now();

    const run = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Easing suave
      
      c.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
      
      if (progress < 1) {
        requestAnimationFrame(run);
      } else {
        c.textContent = target.toLocaleString('pt-BR');
      }
    };
    setTimeout(run, 1500); // Inicia após o loader
  });
  startCounters();

  // ==========================================
  // 7. SCROLL REVEAL (Animação ao aparecer)
  // ==========================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Delay escalonado para ficar bonito em grids
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  // Seletores para animar: inclui os novos cards de sobrancelha (.brow-card)
  const revealElements = document.querySelectorAll(
    '.service-card, .brow-card, .about-image, .about-content, .about-feature, .contact-info, .contact-map, .faq-item, .gallery-item'
  );

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // ==========================================
  // 8. TESTIMONIALS SLIDER
  // ==========================================
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('testDots');
  const slides = track ? track.children : [];
  let current = 0;
  let autoInterval;

  if (slides.length > 0) {
    // Criar dots dinamicamente
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.classList.add('testimonials-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i);
        resetAuto();
      });
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

    // Suporte a toque (Swipe)
    let touchStartX = 0;
    track.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
    
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { // Se o arrasto for maior que 50px
        diff > 0 ? next() : prev();
        resetAuto();
      }
    }, { passive: true });
  }

  // ==========================================
  // 9. FAQ ACCORDION
  // ==========================================
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Fecha todos
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      
      // Se não estava aberto, abre
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ==========================================
  // 10. SMOOTH SCROLL PARA LINKS INTERNOS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        // Usa o Lenis para rolar suavemente até o elemento
        lenis.scrollTo(target, { offset: -header.offsetHeight });
      }
    });
  });
});