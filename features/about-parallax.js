(() => {
  const SELECTORS = {
    about: '.about',
    frames: '.parallax-frame',
    phase1: '.phase-1',
    phase2: '.phase-2',
    phase3: '.phase-3',
    phase4: '.phase-4',
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const lerp = (start, end, t) => start + (end - start) * t;

  let elements = null;
  let ticking = false;
  let isInitialized = false;

  const queryElements = () => ({
    about: document.querySelector(SELECTORS.about),
    frames: document.querySelectorAll(SELECTORS.frames),
    phase1: document.querySelector(SELECTORS.phase1),
    phase2: document.querySelector(SELECTORS.phase2),
    phase3: document.querySelector(SELECTORS.phase3),
    phase4: document.querySelector(SELECTORS.phase4),
  });

  const getPhaseProgress = (element) => {
    if (!element) return 0;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const total = rect.height + viewportHeight;

    if (total <= 0) return 0;

    return clamp((viewportHeight - rect.top) / total, 0, 1);
  };

  const getActivePhaseState = () => {
    const p1 = getPhaseProgress(elements.phase1);
    const p2 = getPhaseProgress(elements.phase2);
    const p3 = getPhaseProgress(elements.phase3);
    const p4 = getPhaseProgress(elements.phase4);

    const phase4Active = p4 > 0 && p4 < 1;
    const phase3Active = !phase4Active && p3 > 0 && p3 < 1;
    const phase2Active = !phase4Active && !phase3Active && p2 > 0 && p2 < 1;
    const phase1Active = !phase4Active && !phase3Active && !phase2Active && p1 > 0 && p1 < 1;

    let activePhase = 0;

    if (phase1Active) activePhase = 1;
    if (phase2Active) activePhase = 2;
    if (phase3Active) activePhase = 3;
    if (phase4Active) activePhase = 4;

    return { activePhase };
  };

  const updateAboutPhaseClasses = (phaseState) => {
    if (!elements.about) return;

    elements.about.classList.remove(
      'about--phase-1',
      'about--phase-2',
      'about--phase-3',
      'about--phase-4'
    );

    if (phaseState.activePhase > 0) {
      elements.about.classList.add(`about--phase-${phaseState.activePhase}`);
    }

    elements.about.dataset.aboutPhase = String(phaseState.activePhase);
    document.body.dataset.aboutPhase = String(phaseState.activePhase);
  };

  const getParallaxSettings = (isVertical, activePhase) => {
    let baseStrength = isVertical ? 2.8 : 4.6;
    let boostedStrength = isVertical ? 3.8 : 6.2;
    let limit = 0.78;
    let scale = isVertical ? 1.07 : 1.14;

    if (isVertical) {
      if (activePhase === 1) {
        baseStrength = 3.8;
        boostedStrength = 5.2;
        limit = 0.9;
        scale = 1.075;
      } else if (activePhase === 2) {
        baseStrength = 3.1;
        boostedStrength = 4.2;
        limit = 0.82;
        scale = 1.07;
      } else if (activePhase === 3) {
        baseStrength = 2.4;
        boostedStrength = 3.1;
        limit = 0.68;
        scale = 1.055;
      } else if (activePhase === 4) {
        baseStrength = 2.1;
        boostedStrength = 2.7;
        limit = 0.6;
        scale = 1.05;
      }
    } else {
      if (activePhase === 1) {
        baseStrength = 3.4;
        boostedStrength = 4.6;
        limit = 0.7;
        scale = 1.12;
      } else if (activePhase === 2) {
        baseStrength = 4.2;
        boostedStrength = 5.8;
        limit = 0.76;
        scale = 1.13;
      } else if (activePhase === 3) {
        baseStrength = 5.2;
        boostedStrength = 6.8;
        limit = 0.82;
        scale = 1.14;
      } else if (activePhase === 4) {
        baseStrength = 5.8;
        boostedStrength = 7.4;
        limit = 0.86;
        scale = 1.15;
      }
    }

    return { baseStrength, boostedStrength, limit, scale };
  };

  const updateParallax = () => {
    if (!elements) return;

    const windowHeight = window.innerHeight;
    const viewportCenter = windowHeight * 0.5;
    const phaseState = getActivePhaseState();

    updateAboutPhaseClasses(phaseState);

    elements.frames.forEach((frame) => {
      const image = frame.querySelector('.parallax-image');
      if (!image) return;

      const rect = frame.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= windowHeight) return;

      const frameHeight = rect.height;
      const imageHeight = image.offsetHeight;
      const maxTranslate = imageHeight - frameHeight;

      if (maxTranslate <= 0) return;

      const progress = (windowHeight - rect.top) / (windowHeight + frameHeight);
      const clampedProgress = clamp(progress, 0, 1);
      const centeredProgress = clampedProgress - 0.5;

      const frameCenter = rect.top + rect.height / 2;
      const distanceToCenter = Math.abs(frameCenter - viewportCenter);
      const centerInfluence = 1 - clamp(distanceToCenter / (windowHeight * 0.5), 0, 1);

      const isVertical = frame.classList.contains('about-image-vertical');
      const { baseStrength, boostedStrength, limit, scale } = getParallaxSettings(
        isVertical,
        phaseState.activePhase
      );

      const strength = lerp(baseStrength, boostedStrength, centerInfluence);
      const rawTranslate = centeredProgress * maxTranslate * strength;
      const safeTranslate = clamp(rawTranslate, -maxTranslate * limit, maxTranslate * limit);

      image.style.transform = `translate3d(0, ${safeTranslate}px, 0) scale(${scale})`;
    });
  };

  const requestTick = () => {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  };

  const bindEvents = () => {
    if (isInitialized) return;

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    window.addEventListener('load', requestTick);

    isInitialized = true;
  };

  const initParallax = () => {
    elements = queryElements();

    if (!elements.frames.length || !elements.about) {
      return false;
    }

    bindEvents();
    updateParallax();
    return true;
  };

  const bootstrap = () => {
    if (initParallax()) return;

    const observer = new MutationObserver(() => {
      if (initParallax()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
