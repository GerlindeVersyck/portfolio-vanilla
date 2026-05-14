/**
 * i18n.js – Lightweight internationalisation for the portfolio.
 *
 * Usage:
 *   - Add `data-i18n="key.path"` to any element whose textContent should be translated.
 *   - Add `data-i18n-placeholder="key.path"` to inputs/textareas for placeholder text.
 *   - Add `data-i18n-aria="key.path"` to elements for aria-label translation.
 *   - Call `i18n.setLanguage('nl')` to switch languages at runtime.
 */
const i18n = (() => {
  let currentLang = 'en';
  const cache = {};

  /**
   * Resolve a dot-separated key path inside a translations object.
   * @param {Object} obj
   * @param {string} path  e.g. "contact.form.send"
   * @returns {string|undefined}
   */
  function resolve(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  /**
   * Fetch and cache a language file from /lang/{lang}.json.
   * @param {string} lang
   * @returns {Promise<Object>}
   */
  async function load(lang) {
    if (cache[lang]) return cache[lang];
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) throw new Error(`Failed to load language file: ${lang}`);
    const data = await response.json();
    cache[lang] = data;
    return data;
  }

  /**
   * Apply the loaded translations to every element with a data-i18n attribute.
   * @param {Object} translations
   */
  function apply(translations) {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = resolve(translations, key);
      if (value !== undefined) {
        // Preserve inner HTML for elements that might contain HTML entities (e.g. footer)
        if (el.tagName === 'META') {
          el.setAttribute('content', value);
        } else {
          el.innerHTML = value;
        }
      }
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = resolve(translations, key);
      if (value !== undefined) el.setAttribute('placeholder', value);
    });

    // Aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const value = resolve(translations, key);
      if (value !== undefined) el.setAttribute('aria-label', value);
    });

    // Page title
    const titleKey = resolve(translations, 'meta.title');
    if (titleKey) document.title = titleKey;
  }

  /**
   * Switch to the given language and re-render the page.
   * @param {string} lang  e.g. "en" | "nl"
   */
  async function setLanguage(lang) {
    try {
      const translations = await load(lang);
      currentLang = lang;
      apply(translations);
      document.documentElement.lang = lang;
      // Persist choice
      localStorage.setItem('portfolio-lang', lang);
      // Update active state on language buttons
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
        btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
      });
    } catch (err) {
      console.error('i18n error:', err);
    }
  }

  /** Initialise with stored or browser-detected language. */
  async function init() {
    const stored = localStorage.getItem('portfolio-lang');
    const browser = navigator.language ? navigator.language.slice(0, 2) : 'en';
    const supported = ['en', 'nl'];
    const lang = supported.includes(stored) ? stored
      : supported.includes(browser) ? browser
      : 'en';
    await setLanguage(lang);
  }

  return { init, setLanguage, getCurrentLang: () => currentLang };
})();
