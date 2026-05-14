import { TEXT_ENUMS } from '../shared/enums/enums.js';
import { renderCodePhraseLine } from '../features/code-frase-transform.js';

const I18N = (() => {
  const DEFAULT_LANGUAGE = 'en';
  const LOCALES_PATH = '/locales';

  let currentLanguage = null;
  let activeTranslations = {};
  let fallbackTranslations = {};
  let isInitialized = false;
  let switcherBound = false;
  let cardsObserver = null;
  let pendingLanguagePromise = null;
  let pendingLanguageCode = null;

  const translationsCache = new Map();

  const LANGUAGE_LEVELS = TEXT_ENUMS.languages.reduce((acc, lang) => {
    acc[lang.code] = lang.level;
    return acc;
  }, {});

  const SELECTORS = [
    '[data-i18n]',
    '[data-i18n-html]',
    '[data-i18n-placeholder]',
    '[data-i18n-alt]',
    '[data-i18n-title]',
    '[data-i18n-tooltip]',
    '[data-i18n-aria-label]',
    '[data-i18n-value]',
    '[data-enum]',
    '.language-card',
    '.language-switcher',
  ].join(', ');

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;

    return path.split('.').reduce((acc, part) => {
      if (acc == null) return undefined;

      if (/^\d+$/.test(part)) {
        return acc[Number(part)];
      }

      return acc[part];
    }, obj);
  };

  const getTranslation = (key) => {
    const primary = getNestedValue(activeTranslations, key);

    if (primary !== undefined) return primary;

    const fallback = getNestedValue(fallbackTranslations, key);

    if (fallback !== undefined) return fallback;

    return undefined;
  };

  const getTranslatableElements = (root, selector) => {
    const elements = [];

    if (root instanceof Element && root.matches(selector)) {
      elements.push(root);
    }

    elements.push(...root.querySelectorAll(selector));

    return elements;
  };

  const setTextContent = (element, value) => {
    const normalized = String(value);

    if (element.textContent !== normalized) {
      element.textContent = normalized;
    }
  };

  const setInnerHTML = (element, value) => {
    const normalized = String(value);

    if (element.innerHTML !== normalized) {
      element.innerHTML = normalized;
    }
  };

  const setAttributeIfChanged = (element, attribute, value) => {
    const normalized = String(value);

    if (element.getAttribute(attribute) !== normalized) {
      element.setAttribute(attribute, normalized);
    }
  };

  const setValueIfChanged = (element, value) => {
    const normalized = String(value);

    if (element.value !== normalized) {
      element.value = normalized;
    }
  };

  const translateElements = (root = document) => {
    getTranslatableElements(root, '[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      const value = getTranslation(key);

      if (value !== undefined) {
        setTextContent(element, value);
      }
    });

    getTranslatableElements(root, '[data-i18n-html]').forEach((element) => {
      const key = element.dataset.i18nHtml;
      const value = getTranslation(key);

      if (value !== undefined) {
        setInnerHTML(element, value);
      }
    });

    getTranslatableElements(root, '[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      const value = getTranslation(key);

      if (value !== undefined) {
        setAttributeIfChanged(element, 'placeholder', value);
      }
    });

    getTranslatableElements(root, '[data-i18n-alt]').forEach((element) => {
      const key = element.dataset.i18nAlt;
      const value = getTranslation(key);

      if (value !== undefined) {
        setAttributeIfChanged(element, 'alt', value);
      }
    });

    getTranslatableElements(root, '[data-i18n-title]').forEach((element) => {
      const key = element.dataset.i18nTitle;
      const value = getTranslation(key);

      if (value !== undefined) {
        setAttributeIfChanged(element, 'title', value);
      }
    });

    getTranslatableElements(root, '[data-i18n-aria-label]').forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      const value = getTranslation(key);

      if (value !== undefined) {
        setAttributeIfChanged(element, 'aria-label', value);
      }
    });

    getTranslatableElements(root, '[data-i18n-value]').forEach((element) => {
      const key = element.dataset.i18nValue;
      const value = getTranslation(key);

      if (value !== undefined) {
        setValueIfChanged(element, value);
      }
    });

    getTranslatableElements(root, '[data-enum]').forEach((element) => {
      const key = element.dataset.enum;
      const value = getNestedValue(TEXT_ENUMS, key);

      if (value !== undefined) {
        setTextContent(element, value);
      }
    });

    getTranslatableElements(root, '[data-i18n-tooltip]').forEach((element) => {
      const key = element.dataset.i18nTooltip;
      const value = getTranslation(key);

      if (value !== undefined) {
        setAttributeIfChanged(element, 'data-tooltip', value);
      }
    });
  };

  const renderLevelBars = (card) => {
    const levelBars = card.querySelector('.language-level-bars');

    if (!levelBars) return;

    const code = card.dataset.language;
    const levelValue = Number(LANGUAGE_LEVELS[code] || 0);
    const fullBars = Math.floor(levelValue);
    const hasHalfBar = levelValue % 1 !== 0;

    levelBars.innerHTML = '';

    for (let index = 0; index < 5; index += 1) {
      const bar = document.createElement('span');
      bar.className = 'level-bar';

      if (index < fullBars) {
        bar.classList.add('filled');
      } else if (hasHalfBar && index === fullBars) {
        bar.classList.add('half');
      }

      levelBars.appendChild(bar);
    }
  };

  const ensureCardsObserver = () => {
    if (cardsObserver) return;

    cardsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('language-card--visible');
          cardsObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );
  };

  const prepareLanguageCard = (card, index = 0) => {
    if (!card) return;

    renderLevelBars(card);

    if (card.dataset.i18nCardPrepared === 'true') {
      return;
    }

    card.style.setProperty('--language-card-delay', `${index * 0.1}s`);
    card.classList.add('language-card--prepped');
    card.dataset.i18nCardPrepared = 'true';

    if (cardsObserver) {
      cardsObserver.observe(card);
    }
  };

  const initLanguageCards = (root = document) => {
    getTranslatableElements(root, '.language-card').forEach((card, index) => {
      prepareLanguageCard(card, index);
    });
  };

  const updateLanguageSwitcherUI = (lang) => {
    document.querySelectorAll('.lang-option').forEach((button) => {
      const isActive = button.dataset.lang === lang;

      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    document.querySelectorAll('.language-switcher').forEach((switcher) => {
      switcher.dataset.currentLang = lang;

      const toggle = switcher.querySelector('.lang-toggle');
      const dropdown = switcher.querySelector('.lang-dropdown');

      if (toggle) {
        setAttributeIfChanged(
          toggle,
          'aria-expanded',
          String(dropdown?.classList.contains('active') || false)
        );
      }
    });
  };

  const closeAllLanguageDropdowns = () => {
    document.querySelectorAll('.language-switcher').forEach((switcher) => {
      const dropdown = switcher.querySelector('.lang-dropdown');

      if (dropdown) {
        dropdown.classList.remove('active');
      }

      const toggle = switcher.querySelector('.lang-toggle');

      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  };

  const renderCodePhraseContent = () => {
    const line = document.getElementById('codePhraseLine');
    const lineParts = getTranslation('codePhrase.lineParts');

    if (!line || !Array.isArray(lineParts) || lineParts.length === 0) {
      return;
    }

    renderCodePhraseLine(lineParts);
  };

  const applyTranslations = (root = document) => {
    const target = root instanceof Element || root instanceof Document ? root : document;

    translateElements(target);
    initLanguageCards(target);
    updateLanguageSwitcherUI(currentLanguage || DEFAULT_LANGUAGE);
    renderCodePhraseContent();
  };

  const fetchLocale = async (lang) => {
    if (translationsCache.has(lang)) {
      return translationsCache.get(lang);
    }

    const response = await fetch(`${LOCALES_PATH}/${lang}.json`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Kon taalbestand niet laden: ${lang}`);
    }

    const data = await response.json();
    translationsCache.set(lang, data);

    return data;
  };

  const ensureFallbackTranslations = async () => {
    fallbackTranslations = await fetchLocale(DEFAULT_LANGUAGE);
  };

  const loadTranslations = async (lang) => {
    if (pendingLanguagePromise && pendingLanguageCode === lang) {
      return pendingLanguagePromise;
    }

    pendingLanguageCode = lang;

    pendingLanguagePromise = (async () => {
      await ensureFallbackTranslations();

      const data = lang === DEFAULT_LANGUAGE ? fallbackTranslations : await fetchLocale(lang);

      activeTranslations = data;
      currentLanguage = lang;

      return activeTranslations;
    })();

    try {
      return await pendingLanguagePromise;
    } finally {
      pendingLanguagePromise = null;
      pendingLanguageCode = null;
    }
  };

  const changeLanguage = async (lang, options = {}) => {
    const { save = true, root = document } = options;

    try {
      await loadTranslations(lang);

      applyTranslations(root);
      document.documentElement.lang = lang;

      if (save) {
        localStorage.setItem('language', lang);
      }

      closeAllLanguageDropdowns();
      updateLanguageSwitcherUI(lang);
    } catch (error) {
      console.error('Taalwissel mislukt:', error);

      if (lang !== DEFAULT_LANGUAGE) {
        try {
          await loadTranslations(DEFAULT_LANGUAGE);

          applyTranslations(root);
          document.documentElement.lang = DEFAULT_LANGUAGE;

          if (save) {
            localStorage.setItem('language', DEFAULT_LANGUAGE);
          }

          closeAllLanguageDropdowns();
          updateLanguageSwitcherUI(DEFAULT_LANGUAGE);
        } catch (fallbackError) {
          console.error('Fallback taal laden mislukt:', fallbackError);
        }
      }
    }
  };

  const bindLanguageSwitcher = () => {
    if (switcherBound) return;

    switcherBound = true;

    document.addEventListener('click', async (event) => {
      const optionButton = event.target.closest('.lang-option');

      if (optionButton) {
        const lang = optionButton.dataset.lang;

        if (lang && lang !== currentLanguage) {
          await changeLanguage(lang);
        } else {
          closeAllLanguageDropdowns();
          updateLanguageSwitcherUI(currentLanguage || DEFAULT_LANGUAGE);
        }

        return;
      }

      const toggleButton = event.target.closest('.lang-toggle');

      if (toggleButton) {
        const switcher = toggleButton.closest('.language-switcher');

        if (!switcher) return;

        const dropdown = switcher.querySelector('.lang-dropdown');

        if (!dropdown) return;

        const willOpen = !dropdown.classList.contains('active');

        closeAllLanguageDropdowns();

        if (willOpen) {
          dropdown.classList.add('active');
          toggleButton.setAttribute('aria-expanded', 'true');
        } else {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
        updateLanguageSwitcherUI(currentLanguage || DEFAULT_LANGUAGE);

        return;
      }

      if (!event.target.closest('.language-switcher')) {
        closeAllLanguageDropdowns();
        updateLanguageSwitcherUI(currentLanguage || DEFAULT_LANGUAGE);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllLanguageDropdowns();
        updateLanguageSwitcherUI(currentLanguage || DEFAULT_LANGUAGE);
      }
    });
  };

  const initDynamicContentSupport = () => {
    document.addEventListener('componentsLoaded', (event) => {
      const root =
        event.detail?.root instanceof Element || event.detail?.root instanceof Document
          ? event.detail.root
          : document;

      applyTranslations(root);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;

          if (node.matches?.(SELECTORS)) {
            applyTranslations(node);
            return;
          }

          if (node.querySelector?.(SELECTORS)) {
            applyTranslations(node);
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  const init = async () => {
    if (isInitialized) return;

    isInitialized = true;

    ensureCardsObserver();
    bindLanguageSwitcher();
    initDynamicContentSupport();

    const savedLanguage = localStorage.getItem('language') || DEFAULT_LANGUAGE;
    document.documentElement.lang = savedLanguage;

    await changeLanguage(savedLanguage, {
      save: false,
      root: document,
    });
  };

  return {
    init,
    applyTranslations,
    changeLanguage,
    getCurrentLanguage: () => currentLanguage,
    getTranslations: () => activeTranslations,
    getFallbackTranslations: () => fallbackTranslations,
  };
})();

export default I18N;
