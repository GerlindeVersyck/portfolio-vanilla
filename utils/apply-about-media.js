import { SECTION_MEDIA } from '../shared/content/section-media.js';

export const applyAboutMedia = (root = document) => {
  const elements = root.querySelectorAll('[data-about-image]');

  elements.forEach((element) => {
    const key = element.dataset.aboutImage;
    const imageUrl = SECTION_MEDIA.about[key];

    if (!imageUrl) {
      return;
    }

    element.style.backgroundImage = `url("${imageUrl}")`;
  });
};
