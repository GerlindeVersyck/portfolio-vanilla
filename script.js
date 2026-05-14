import { loadComponents } from './utils/component-loader.js';
import './features/about-parallax.js';
import { ContactForm } from './features/contact-form.js';
import { SectionNavigation } from './shared/animations/section-navigation.js';
import { HeroScrollEffects } from './shared/animations/hero-scroll-effects.js';
import { HeroMediaInit } from './sections/hero-section/hero-media-init.js';
import { ScrollAnimations } from './shared/animations/index-page-scroll-animations.js';
import I18N from './utils/i18n-translations.js';
import { getHeaderOffset } from './utils/get-header-offset.js';
import { applyAboutMedia } from './utils/apply-about-media.js';
import { ContactModal } from './features/contact-modal.js';
import { AppLinksInit } from './utils/app-links-init.js';

const initFeatures = () => {
  new HeroMediaInit();
  new AppLinksInit();
  new HeroScrollEffects();
  new ScrollAnimations();
  new SectionNavigation();
  new ContactModal();
  new ContactForm();
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  applyAboutMedia(document);

  await I18N.init();
  initFeatures();

  const savedSection = sessionStorage.getItem('portfolioCurrentSection');

  if (savedSection) {
    const target = document.getElementById(savedSection);

    if (target) {
      setTimeout(() => {
        const headerOffset = getHeaderOffset();
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: 'smooth',
        });
      }, 100);
    }

    sessionStorage.removeItem('portfolioCurrentSection');
  }
});
