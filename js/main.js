/**
 * main.js – Portfolio interactivity:
 *   - Sticky navigation with scroll-aware styling
 *   - Mobile hamburger menu
 *   - Smooth scrolling for anchor links
 *   - Intersection Observer scroll-reveal animations
 *   - Animated skill bars (triggered on scroll)
 *   - Counter animation for stats
 *   - Contact form (client-side feedback only)
 *   - Language switcher wiring
 */

/* ------------------------------------------------------------------ *
 * Utility helpers
 * ------------------------------------------------------------------ */

/** Ease-out cubic interpolation (t in [0,1]). */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Animate a numeric counter from 0 to `target` over `duration` ms. */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(easeOutCubic(progress) * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Sticky-nav: add scrolled class once the user has scrolled past the hero
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 50);
}, { passive: true });

// Mobile hamburger toggle
navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('nav__menu--open');
  navToggle.classList.toggle('nav__toggle--open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu on nav-link click
navMenu.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('nav__menu--open');
    navToggle.classList.remove('nav__toggle--open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ------------------------------------------------------------------ *
 * Smooth scrolling
 * ------------------------------------------------------------------ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = nav.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ------------------------------------------------------------------ *
 * Active nav link highlighting
 * ------------------------------------------------------------------ */

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'nav__link--active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(section => sectionObserver.observe(section));

/* ------------------------------------------------------------------ *
 * Scroll-reveal animations
 * ------------------------------------------------------------------ */

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.animate-on-scroll').forEach(el => revealObserver.observe(el));

/* ------------------------------------------------------------------ *
 * Skill bar animations (fill width when visible)
 * ------------------------------------------------------------------ */

const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-bar__fill').forEach(bar => {
        bar.style.width = `${bar.dataset.width}%`;
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-card').forEach(card => skillObserver.observe(card));

/* ------------------------------------------------------------------ *
 * Counter animations for stats
 * ------------------------------------------------------------------ */

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat__number[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target, 10));
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.about__stats').forEach(el => counterObserver.observe(el));

/* ------------------------------------------------------------------ *
 * Contact form (client-side only)
 * ------------------------------------------------------------------ */

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = '…';

    // Simulate async send (replace with real endpoint as needed)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Show success feedback using the translated string
    const lang = i18n.getCurrentLang();
    const msgEl = document.createElement('p');
    msgEl.className = 'form-feedback form-feedback--success';

    // Use already-loaded translation via a hidden element trick or fallback string
    const successKey = 'contact.form.success';
    const successTexts = { en: 'Thanks! Your message has been sent.', nl: 'Bedankt! Je bericht is verzonden.' };
    msgEl.textContent = successTexts[lang] || successTexts.en;

    contactForm.reset();
    btn.disabled = false;
    // Restore translated button text
    const sendTexts = { en: 'Send Message', nl: 'Verstuur Bericht' };
    btn.textContent = sendTexts[lang] || sendTexts.en;

    // Remove any previous feedback
    const old = contactForm.querySelector('.form-feedback');
    if (old) old.remove();
    contactForm.appendChild(msgEl);

    // Auto-remove after 5 s
    setTimeout(() => msgEl.remove(), 5000);
  });
}

/* ------------------------------------------------------------------ *
 * Language switcher
 * ------------------------------------------------------------------ */

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => i18n.setLanguage(btn.dataset.lang));
});

/* ------------------------------------------------------------------ *
 * Initialise i18n on page load
 * ------------------------------------------------------------------ */

i18n.init();
