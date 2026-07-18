const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

document.querySelectorAll('.nav-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  });
});

const headline = document.querySelector('.hero-headline');
if (headline) {
  const text = headline.textContent.trim();
  headline.textContent = '';
  [...text].forEach((character, index) => {
    const span = document.createElement('span');
    span.className = 'headline-char';
    span.style.setProperty('--char-index', index);
    span.textContent = character === ' ' ? '\u00a0' : character;
    headline.append(span);
  });
}

const revealItems = [...document.querySelectorAll('.reveal')];
const revealGroups = new Map();
revealItems.forEach((item) => {
  const group = item.closest('section') || document.body;
  const index = revealGroups.get(group) || 0;
  item.style.setProperty('--reveal-delay', `${Math.min(index * 65, 325)}ms`);
  revealGroups.set(group, index + 1);
});

if (prefersReducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const progressBar = document.querySelector('.scroll-progress');
let progressFrame = 0;
const updateScrollProgress = () => {
  progressFrame = 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  root.style.setProperty('--scroll-progress', progress);
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
};
window.addEventListener('scroll', () => {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateScrollProgress);
}, { passive: true });
updateScrollProgress();

const motionElements = {
  cursor: null,
  ring: null,
  heroArt: document.querySelector('.hero-art'),
  badges: [...document.querySelectorAll('.floating-badge')],
  magnetic: [],
  tilt: [],
};
let motionFrame = 0;
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let pointerInside = false;
let scrollOffset = window.scrollY;

const lerp = (current, target, amount) => current + (target - current) * amount;
const requestMotionFrame = () => {
  if (!motionFrame) motionFrame = requestAnimationFrame(renderMotion);
};

const renderMotion = () => {
  motionFrame = 0;
  let moving = false;

  if (motionElements.cursor) {
    const dot = motionElements.cursor;
    const ring = motionElements.ring;
    dot.x = lerp(dot.x, pointerX, 0.82);
    dot.y = lerp(dot.y, pointerY, 0.82);
    ring.x = lerp(ring.x, pointerX, 0.18);
    ring.y = lerp(ring.y, pointerY, 0.18);
    dot.node.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate3d(-50%, -50%, 0)`;
    ring.node.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate3d(-50%, -50%, 0)`;
    moving = Math.abs(pointerX - ring.x) > 0.1 || Math.abs(pointerY - ring.y) > 0.1;
  }

  motionElements.magnetic.forEach((item) => {
    item.x = lerp(item.x, item.targetX, 0.16);
    item.y = lerp(item.y, item.targetY, 0.16);
    item.node.style.setProperty('--mag-x', `${item.x}px`);
    item.node.style.setProperty('--mag-y', `${item.y}px`);
    moving = moving || Math.abs(item.targetX - item.x) > 0.1 || Math.abs(item.targetY - item.y) > 0.1;
  });

  motionElements.tilt.forEach((item) => {
    item.x = lerp(item.x, item.targetX, 0.13);
    item.y = lerp(item.y, item.targetY, 0.13);
    item.node.style.setProperty('--tilt-x', `${item.x}deg`);
    item.node.style.setProperty('--tilt-y', `${item.y}deg`);
    moving = moving || Math.abs(item.targetX - item.x) > 0.1 || Math.abs(item.targetY - item.y) > 0.1;
  });

  if (motionElements.heroArt && pointerInside) {
    const targetX = (pointerX / window.innerWidth - 0.5) * 14;
    const targetY = (pointerY / window.innerHeight - 0.5) * -12 + (scrollOffset * -0.02);
    const currentX = parseFloat(motionElements.heroArt.dataset.parallaxX || '0');
    const currentY = parseFloat(motionElements.heroArt.dataset.parallaxY || '0');
    const nextX = lerp(currentX, targetX, 0.08);
    const nextY = lerp(currentY, targetY, 0.08);
    motionElements.heroArt.dataset.parallaxX = nextX;
    motionElements.heroArt.dataset.parallaxY = nextY;
    motionElements.heroArt.style.setProperty('--parallax-x', `${nextX}px`);
    motionElements.heroArt.style.setProperty('--parallax-y', `${nextY}px`);
    motionElements.badges.forEach((badge, index) => {
      const depth = index ? -0.65 : 0.8;
      badge.style.setProperty('--badge-x', `${nextX * depth}px`);
      badge.style.setProperty('--badge-y', `${nextY * depth}px`);
    });
    moving = moving || Math.abs(targetX - nextX) > 0.1 || Math.abs(targetY - nextY) > 0.1;
  }

  if (moving) requestMotionFrame();
};

const resetMotion = () => {
  motionElements.magnetic.forEach((item) => {
    item.targetX = 0;
    item.targetY = 0;
  });
  motionElements.tilt.forEach((item) => {
    item.targetX = 0;
    item.targetY = 0;
  });
  requestMotionFrame();
};

if (!prefersReducedMotion.matches && finePointer.matches) {
  document.body.classList.add('has-custom-cursor');
  motionElements.cursor = { node: document.querySelector('.cursor-dot'), x: pointerX, y: pointerY };
  motionElements.ring = { node: document.querySelector('.cursor-ring'), x: pointerX, y: pointerY };

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerInside = true;
    requestMotionFrame();
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointerInside = false; }, { passive: true });

  const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card');
  hoverTargets.forEach((target) => {
    target.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'), { passive: true });
    target.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'), { passive: true });
  });

  document.querySelectorAll('.button--primary').forEach((button) => {
    const item = { node: button, x: 0, y: 0, targetX: 0, targetY: 0 };
    motionElements.magnetic.push(item);
    button.classList.add('magnetic-button');
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      item.targetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.18;
      item.targetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.18;
      requestMotionFrame();
    }, { passive: true });
    button.addEventListener('pointerleave', resetMotion, { passive: true });
  });

  document.querySelectorAll('.project-card, .skill-card').forEach((card) => {
    const item = { node: card, x: 0, y: 0, targetX: 0, targetY: 0 };
    motionElements.tilt.push(item);
    card.classList.add('tilt-card');
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      item.targetX = y * -7;
      item.targetY = x * 7;
      card.style.setProperty('--tilt-scale', '1.015');
      requestMotionFrame();
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      item.targetX = 0;
      item.targetY = 0;
      card.style.setProperty('--tilt-scale', '1');
      requestMotionFrame();
    }, { passive: true });
  });

  window.addEventListener('scroll', () => {
    scrollOffset = window.scrollY;
    if (motionElements.heroArt && pointerInside) requestMotionFrame();
  }, { passive: true });
}

const contactForm = document.querySelector('.contact-form');
const successMessage = document.querySelector('.form-success');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  contactForm.reset();
  successMessage.classList.add('is-visible');
});
