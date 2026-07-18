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
