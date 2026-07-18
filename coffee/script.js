const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
const preloader = document.querySelector('#preloader');
const preloaderStartedAt = performance.now();
const preloaderMinDisplay = prefersReducedMotion.matches ? 0 : 1450;

const releasePreloader = () => {
  if (!preloader || preloader.dataset.released) return;
  preloader.dataset.released = 'true';
  const wait = Math.max(0, preloaderMinDisplay - (performance.now() - preloaderStartedAt));
  window.setTimeout(() => {
    preloader.classList.add('is-hidden');
    window.setTimeout(() => {
      document.body.classList.remove('preloader-active');
      window.dispatchEvent(new CustomEvent('preloader:ready'));
    }, prefersReducedMotion.matches ? 0 : 650);
  }, wait);
};

if (document.readyState === 'complete') releasePreloader();
else window.addEventListener('load', releasePreloader, { once: true });

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
  const headlineText = headline.textContent.trim();
  headline.setAttribute('aria-label', headlineText);
  let characterIndex = 0;
  const appendWord = (fragment, word) => {
    const parts = word.split('-');
    parts.forEach((part, partIndex) => {
      if (part) {
        const wordWrapper = document.createElement('span');
        wordWrapper.className = 'headline-word';
        [...part].forEach((character) => {
          const span = document.createElement('span');
          span.className = 'headline-char';
          span.style.setProperty('--char-index', characterIndex);
          span.textContent = character;
          characterIndex += 1;
          wordWrapper.append(span);
        });
        fragment.append(wordWrapper);
      }
      if (partIndex < parts.length - 1) {
        fragment.append(document.createTextNode('-'));
      }
    });
  };
  const splitTextNode = (node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
      } else if (part) {
        appendWord(fragment, part);
      }
    });
    node.replaceWith(fragment);
  };
  [...headline.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) splitTextNode(node);
    else if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) splitTextNode(child);
      });
    }
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

const counterItems = [...document.querySelectorAll('.counter-value')];
const setCounter = (item, value) => {
  item.textContent = `${value}${item.dataset.suffix || ''}`;
};
const animateCounter = (item) => {
  if (item.dataset.counted) return;
  item.dataset.counted = 'true';
  const target = Number(item.dataset.count);
  const startedAt = performance.now();
  const duration = 1200;
  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - ((1 - progress) ** 3);
    setCounter(item, Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (prefersReducedMotion.matches) {
  counterItems.forEach((item) => setCounter(item, Number(item.dataset.count)));
} else if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.7 });
  counterItems.forEach((item) => counterObserver.observe(item));
} else {
  counterItems.forEach((item) => setCounter(item, Number(item.dataset.count)));
}

const sectionLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]:not(.nav-pill)')];
const sectionsForNav = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-42% 0px -48% 0px', threshold: 0 });
  sectionsForNav.forEach((section) => navObserver.observe(section));
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
  heroVisual: document.querySelector('.hero-visual'),
  heroCupScene: document.querySelector('.hero-cup-scene'),
  beans: [...document.querySelectorAll('.hero-bean')],
  magnetic: [],
  tilt: [],
  productScenes: [],
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

  motionElements.productScenes.forEach((item) => {
    item.x = lerp(item.x, item.targetX, 0.14);
    item.y = lerp(item.y, item.targetY, 0.14);
    item.z = lerp(item.z, item.targetZ, 0.16);
    item.node.style.setProperty('--scene-x', `${item.x}deg`);
    item.node.style.setProperty('--scene-y', `${item.y}deg`);
    item.node.style.setProperty('--product-z', `${item.z}px`);
    moving = moving
      || Math.abs(item.targetX - item.x) > 0.1
      || Math.abs(item.targetY - item.y) > 0.1
      || Math.abs(item.targetZ - item.z) > 0.1;
  });

  if (motionElements.heroCupScene && pointerInside) {
    const targetX = (pointerY / window.innerHeight - 0.5) * -18;
    const targetY = (pointerX / window.innerWidth - 0.5) * 20;
    const currentX = parseFloat(motionElements.heroCupScene.dataset.rotateX || '0');
    const currentY = parseFloat(motionElements.heroCupScene.dataset.rotateY || '0');
    const nextX = lerp(currentX, targetX, 0.1);
    const nextY = lerp(currentY, targetY, 0.1);
    motionElements.heroCupScene.dataset.rotateX = nextX;
    motionElements.heroCupScene.dataset.rotateY = nextY;
    motionElements.heroCupScene.style.setProperty('--scene-x', `${nextX}deg`);
    motionElements.heroCupScene.style.setProperty('--scene-y', `${nextY}deg`);
    moving = moving || Math.abs(targetX - nextX) > 0.1 || Math.abs(targetY - nextY) > 0.1;
  }

  if (motionElements.heroVisual && pointerInside) {
    const targetX = (pointerX / window.innerWidth - 0.5) * 14;
    const targetY = (pointerY / window.innerHeight - 0.5) * -12 + scrollOffset * -0.018;
    const currentX = parseFloat(motionElements.heroVisual.dataset.parallaxX || '0');
    const currentY = parseFloat(motionElements.heroVisual.dataset.parallaxY || '0');
    const nextX = lerp(currentX, targetX, 0.08);
    const nextY = lerp(currentY, targetY, 0.08);
    motionElements.heroVisual.dataset.parallaxX = nextX;
    motionElements.heroVisual.dataset.parallaxY = nextY;
    motionElements.heroVisual.style.setProperty('--parallax-x', `${nextX}px`);
    motionElements.heroVisual.style.setProperty('--parallax-y', `${nextY}px`);
    motionElements.beans.forEach((bean, index) => {
      const depth = index ? -0.7 : 0.85;
      bean.style.setProperty('--bean-x', `${nextX * depth}px`);
      bean.style.setProperty('--bean-y', `${nextY * depth}px`);
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
  motionElements.productScenes.forEach((item) => {
    item.targetX = 0;
    item.targetY = 0;
    item.targetZ = 32;
    item.node.classList.remove('product-scene-hover');
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

  document.querySelectorAll('a, button, .menu-card, .benefit-card, .review-card').forEach((target) => {
    target.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'), { passive: true });
    target.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'), { passive: true });
  });

  document.querySelectorAll('.button--dark, .button--light').forEach((button) => {
    const item = { node: button, x: 0, y: 0, targetX: 0, targetY: 0 };
    motionElements.magnetic.push(item);
    button.classList.add('magnetic-button');
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      item.targetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.16;
      item.targetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.16;
      requestMotionFrame();
    }, { passive: true });
    button.addEventListener('pointerleave', resetMotion, { passive: true });
  });

  document.querySelectorAll('.menu-card, .benefit-card, .review-card').forEach((card) => {
    const item = { node: card, x: 0, y: 0, targetX: 0, targetY: 0 };
    motionElements.tilt.push(item);
    card.classList.add('tilt-card');
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      item.targetX = y * -6;
      item.targetY = x * 6;
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

  document.querySelectorAll('.dish-art').forEach((scene) => {
    const item = { node: scene, x: 0, y: 0, z: 32, targetX: 0, targetY: 0, targetZ: 32 };
    motionElements.productScenes.push(item);
    scene.addEventListener('pointermove', (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      item.targetX = y * -20;
      item.targetY = x * 20;
      item.targetZ = 56;
      scene.classList.add('product-scene-hover');
      requestMotionFrame();
    }, { passive: true });
    scene.addEventListener('pointerleave', () => {
      item.targetX = 0;
      item.targetY = 0;
      item.targetZ = 32;
      scene.classList.remove('product-scene-hover');
      requestMotionFrame();
    }, { passive: true });
  });

  window.addEventListener('scroll', () => {
    scrollOffset = window.scrollY;
    if (motionElements.heroVisual && pointerInside) requestMotionFrame();
  }, { passive: true });
}

if (!prefersReducedMotion.matches) {
  window.addEventListener('preloader:ready', () => {
    document.querySelector('.coffee-cup')?.classList.add('cup-bobbing');
  }, { once: true });
}

const modal = document.querySelector('#booking-modal');
const openButtons = document.querySelectorAll('[data-modal-open]');
const closeButtons = document.querySelectorAll('[data-modal-close]');
const bookingForm = document.querySelector('.booking-form');
const bookingSuccess = document.querySelector('.booking-success');

const closeModal = () => {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-visible');
};

openButtons.forEach((button) => {
  button.addEventListener('click', () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-visible');
    document.querySelector('#booking-name').focus();
  });
});

closeButtons.forEach((button) => button.addEventListener('click', closeModal));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  bookingForm.reset();
  bookingSuccess.classList.add('is-visible');
});
