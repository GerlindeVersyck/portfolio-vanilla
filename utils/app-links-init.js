import { SOCIAL_LINKS, PROJECT_LINKS } from '../shared/config/app-links.js';

export class AppLinksInit {
  constructor(root = document) {
    this.root = root;
    this.applySocialLinks();
    this.applyProjectLinks();
  }

  applySocialLinks() {
    Object.entries(SOCIAL_LINKS).forEach(([key, url]) => {
      this.root.querySelectorAll(`[data-social-link="${key}"]`).forEach((link) => {
        link.href = url;
      });
    });
  }

  applyProjectLinks() {
    Object.entries(PROJECT_LINKS).forEach(([key, url]) => {
      this.root.querySelectorAll(`[data-project-link="${key}"]`).forEach((link) => {
        link.href = url;
      });
    });
  }
}
