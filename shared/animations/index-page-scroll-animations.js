const TITLE_OBSERVER_THRESHOLD = 0.45;
const LETTER_STAGGER_MS = 100;
const LETTER_SPIN_DURATION_MS = 600;
const LANGUAGES_OBSERVER_THRESHOLD = 0.28;
const LANGUAGE_CARD_STAGGER_MS = 120;
const LANGUAGE_TILT_DURATION_MS = 900;
const PROJECT_CARD_STAGGER_MS = 100;
const ELEMENT_STAGGER_DELAY_MS = 100;

export class ScrollAnimations {
  constructor() {
    this.animatedElements = [];
    this.languageCards = [];
    this.projectCards = [];
    this.projectFallTimeouts = [];
    this.projectsSection = null;
    this.projectsInFocusZone = false;
    this.projectsHaveFallen = false;
    this.projectScrollTicking = false;

    this.init();
  }

  init() {
    this.animatedElements = document.querySelectorAll('.hero-content, .section-title');
    this.languageCards = document.querySelectorAll('.language-card');
    this.projectCards = document.querySelectorAll('.project-card');
    this.projectsSection = document.querySelector('.projects');

    this.animatedElements.forEach((element, index) => {
      element.classList.add('scroll-animate');
      element.style.transitionDelay = `${index * ELEMENT_STAGGER_DELAY_MS}ms`;
    });

    this.setupObserver();
    this.setupTitleAnimations();
    this.setupLanguagesAnimation();
    this.setupProjectsAnimation();
  }

  setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    this.animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  setupTitleAnimations() {
    const titles = document.querySelectorAll('.section-title');

    titles.forEach((title) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const currentText = title.textContent.trim();
            const preparedText = title.dataset.sourceText || '';

            if (!title.dataset.lettersPrepared || preparedText !== currentText) {
              this.prepareTitle(title);
            }

            const letters = title.querySelectorAll('[data-letter]');

            if (letters.length > 0) {
              this.animateLettersWithRotation(letters);
            }
          });
        },
        { threshold: TITLE_OBSERVER_THRESHOLD }
      );

      observer.observe(title);
    });
  }

  prepareTitle(title) {
    const text = title.textContent.trim();

    if (!text) {
      return;
    }

    title.dataset.sourceText = text;
    title.dataset.lettersPrepared = 'true';
    title.innerHTML = '';

    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.dataset.letter = 'true';
      span.className = 'section-title__letter';

      title.appendChild(span);
    });
  }

  animateLettersWithRotation(letters) {
    letters.forEach((letter, index) => {
      letter.classList.remove('section-title__letter--spinning', 'section-title__letter--active');

      setTimeout(() => {
        letter.classList.add('section-title__letter--spinning');

        setTimeout(() => {
          letter.classList.remove('section-title__letter--spinning');
          letter.classList.add('section-title__letter--active');
        }, LETTER_SPIN_DURATION_MS);
      }, index * LETTER_STAGGER_MS);
    });
  }

  setupLanguagesAnimation() {
    const languagesSection = document.querySelector('.languages');

    if (!languagesSection || this.languageCards.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          this.languageCards.forEach((card, index) => {
            card.classList.remove('language-card--tilt');

            setTimeout(() => {
              card.classList.add('language-card--tilt');

              setTimeout(() => {
                card.classList.remove('language-card--tilt');
              }, LANGUAGE_TILT_DURATION_MS);
            }, index * LANGUAGE_CARD_STAGGER_MS);
          });
        });
      },
      {
        threshold: LANGUAGES_OBSERVER_THRESHOLD,
      }
    );

    observer.observe(languagesSection);
  }

  setupProjectsAnimation() {
    if (!this.projectsSection || this.projectCards.length === 0) {
      return;
    }

    const handleProjectsScroll = () => {
      if (this.projectScrollTicking) {
        return;
      }

      this.projectScrollTicking = true;

      requestAnimationFrame(() => {
        this.updateProjectsVisibilityState();
        this.projectScrollTicking = false;
      });
    };

    window.addEventListener('scroll', handleProjectsScroll, { passive: true });
    window.addEventListener('resize', handleProjectsScroll);

    this.updateProjectsVisibilityState();
  }

  isAtPageBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  }

  updateProjectsVisibilityState() {
    if (!this.projectsSection) {
      return;
    }

    const rect = this.projectsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const focusZoneTop = viewportHeight * 0.3;
    const focusZoneBottom = viewportHeight * 0.7;

    const sectionIntersectsFocusZone = rect.bottom > focusZoneTop && rect.top < focusZoneBottom;
    const shouldShowProjects = sectionIntersectsFocusZone && !this.isAtPageBottom();

    if (shouldShowProjects) {
      if (!this.projectsInFocusZone) {
        this.resetProjectCards();
      }

      this.projectsInFocusZone = true;
      this.projectsHaveFallen = false;
      return;
    }

    if (!this.projectsHaveFallen) {
      this.triggerProjectFall();
      this.projectsHaveFallen = true;
    }

    this.projectsInFocusZone = false;
  }

  clearProjectFallTimeouts() {
    this.projectFallTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });

    this.projectFallTimeouts = [];
  }

  triggerProjectFall() {
    this.clearProjectFallTimeouts();
    this.resetProjectCards();

    this.projectCards.forEach((card, index) => {
      const timeoutId = setTimeout(() => {
        card.classList.add('fall-down');
      }, index * PROJECT_CARD_STAGGER_MS);

      this.projectFallTimeouts.push(timeoutId);
    });
  }

  resetProjectCards() {
    this.clearProjectFallTimeouts();

    this.projectCards.forEach((card) => {
      card.classList.remove('fall-down');
      card.style.animation = 'none';
      card.style.transform = '';
      card.style.opacity = '';
      void card.offsetHeight;
      card.style.animation = '';
    });
  }
}
