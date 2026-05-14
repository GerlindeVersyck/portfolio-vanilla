import { SECTION_MEDIA } from '../../shared/content/section-media.js';

export class HeroMediaInit {
  constructor() {
    this.applyHeroImages();
  }

  applyHeroImages() {
    const portrait = document.querySelector('[data-hero-image="portrait"]');
    const blurLayer = document.querySelector('.hero-photo-blur');

    if (portrait) {
      portrait.src = SECTION_MEDIA.hero.portrait;
    }

    if (blurLayer) {
      blurLayer.style.setProperty('--hero-blur-image', `url("${SECTION_MEDIA.hero.blur}")`);
    }
  }
}
