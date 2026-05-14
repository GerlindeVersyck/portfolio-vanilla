# Personal Portfolio

A multilingual personal portfolio built with vanilla HTML, CSS and JavaScript. The project focuses on semantic structure, accessibility, responsive design and maintainable modular code.

## Overview

This portfolio presents the main sections of a personal website:

- Header
- Hero
- About
- Skills
- Languages
- Projects
- Contact
- Footer

The application uses a lightweight component-based structure. Each section is stored in its own HTML and CSS files and injected into the page dynamically. JavaScript is organized by responsibility, with separate modules for translations, navigation, animations, media setup, social links and contact form handling.

## Main Features

- Modular section loading with a component loader
- Multilingual interface with JSON locale files
- Dynamic language switching
- Responsive layout for desktop, tablet and mobile
- Hero scroll effects and section animations
- About section parallax effects
- Project cards with animated interactions
- Contact modal with validation and submit flow
- Social link initialization from a shared config
- Accessible focus states and reduced-motion support

## Project Structure

````text
index.html
style.css
script.js
locales/
sections/
features/
shared/
utils/
```text

### Important files

- `index.html`
  Main entry point with mount points for all sections.

- `style.css`
  Global styles, shared variables, utilities and section CSS imports.

- `script.js`
  Main bootstrap file. Loads components, initializes i18n and starts the site features.

- `utils/component-loader.js`
  Loads section HTML fragments dynamically.

- `utils/i18n-translations.js`
  Handles translations, locale loading, dynamic content translation and language switching.

- `utils/apply-about-media.js`
  Applies shared background images to the About section.

- `utils/social-links-init.js`
  Injects social URLs into matching links.

- `utils/get-header-offset.js`
  Returns the current header height for scroll calculations.

- `features/contact-form.js`
  Handles validation, feedback states and form submission.

- `features/contact-modal.js`
  Controls modal open/close behavior and success state handling.

- `features/about-parallax.js`
  Controls About section phase-based parallax and class updates.

- `features/code-frase-transform.js`
  Renders and reshuffles the animated code phrase line.

- `shared/animations/hero-scroll-effects.js`
  Manages scroll-driven motion and visual changes in the hero section.

- `shared/animations/index-page-scroll-animations.js`
  Manages title, language card and project animations on scroll.

- `shared/animations/section-navigation.js`
  Handles smooth in-page section navigation.

- `shared/config/social-links.js`
  Central source for social and email links.

- `shared/content/section-media.js`
  Shared media sources for the hero and about sections.

- `shared/enums/enums.js`
  Shared enum-style content such as skill card labels, social labels and language levels.

## Internationalization

The site supports multiple languages through locale JSON files stored in `locales/`.

Current languages:
- English
- Dutch
- French
- Spanish

Translations are applied through `data-i18n` attributes and related variants such as:
- `data-i18n`
- `data-i18n-html`
- `data-i18n-placeholder`
- `data-i18n-alt`
- `data-i18n-tooltip`
- `data-i18n-aria-label`

A fallback language is used when a translation key is missing.

## Accessibility

The project includes several accessibility-oriented decisions:

- Semantic HTML structure
- Keyboard-accessible navigation and modal controls
- Visible focus styles
- ARIA labels where needed
- Reduced-motion support
- Sufficient color contrast
- Form validation feedback with live regions

## Contact Form

The contact section uses:
- client-side validation
- translated validation and feedback messages
- modal-based interaction flow
- asynchronous submit behavior

To make form submission work in production, replace the placeholder Formspree endpoint in:

```js
features/contact-form.js
```text

## Running the Project

Because the project loads components and locale files dynamically, run it through a local development server instead of opening `index.html` directly in the browser.

Examples:

- VS Code Live Server
- `npx serve`
- any local static server

## Notes

This project is intentionally built without a frontend framework. The goal is to keep the stack lightweight while still applying modular structure, reusable logic and maintainable organization.

## Author

Gerlinde Versyck
````
