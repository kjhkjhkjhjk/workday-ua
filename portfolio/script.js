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

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

const contactForm = document.querySelector('.contact-form');
const successMessage = document.querySelector('.form-success');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  contactForm.reset();
  successMessage.classList.add('is-visible');
});
