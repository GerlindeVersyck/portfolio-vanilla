import { getHeaderOffset } from '../../utils/get-header-offset.js';

export class SectionNavigation {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (this.navLinks.length === 0) {
      return;
    }

    this.init();
  }

  init() {
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (event) => this.handleNavClick(event));
    });
  }

  getScrollTarget(section) {
    return section.querySelector('.section-anchor') || section;
  }

  getTargetTop(section) {
    const target = this.getScrollTarget(section);
    const headerOffset = getHeaderOffset();

    return target.getBoundingClientRect().top + window.scrollY - headerOffset;
  }

  handleNavClick(event) {
    const href = event.currentTarget.getAttribute('href');

    if (!href || href === '#') {
      event.preventDefault();
      return;
    }

    const section = document.querySelector(href);

    if (!section) {
      return;
    }

    event.preventDefault();

    if (href === '#home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    const targetTop = this.getTargetTop(section);

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });
  }
}
