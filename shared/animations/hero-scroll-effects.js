import { HERO_SCROLL_STAGE_CONFIG } from '../config/hero-config.js';

const HERO_SCROLL_OFFSET = 80;
const HERO_SHELL_SCROLL_FACTOR = 0.5;
const HERO_MAX_SCROLL_FACTOR = 1.52;
const HERO_MOBILE_BREAKPOINT = 640;

export class HeroScrollEffects {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.heroContent = document.querySelector('.hero-content');
    this.titleStage = document.querySelector('.hero-stage-title');
    this.subtitleStage = document.querySelector('.hero-stage-subtitle');
    this.socialStage = document.querySelector('.hero-stage-social');

    if (
      !this.hero ||
      !this.heroContent ||
      !this.titleStage ||
      !this.subtitleStage ||
      !this.socialStage
    ) {
      return;
    }

    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.updateBounds();
    this.handleScroll();

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
  }

  map(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) {
      return outMin;
    }

    const progress = this.clamp((value - inMin) / (inMax - inMin), 0, 1);

    return outMin + (outMax - outMin) * progress;
  }

  easeOutCubic(value) {
    const clampedValue = this.clamp(value, 0, 1);
    return 1 - Math.pow(1 - clampedValue, 3);
  }

  easeInOutCubic(value) {
    const clampedValue = this.clamp(value, 0, 1);
    return clampedValue < 0.5
      ? 4 * clampedValue * clampedValue * clampedValue
      : 1 - Math.pow(-2 * clampedValue + 2, 3) / 2;
  }

  lerp(start, end, value) {
    return start + (end - start) * this.clamp(value, 0, 1);
  }

  updateBounds() {
    const heroRect = this.hero.getBoundingClientRect();

    this.heroTop = window.scrollY + heroRect.top;
    this.heroHeight = this.hero.offsetHeight;
    this.maxScrollDistance = Math.max(this.heroHeight * HERO_MAX_SCROLL_FACTOR, 1);

    this.measureCenters();
  }

  measureCenters() {
    const contentRect = this.heroContent.getBoundingClientRect();
    const titleRect = this.titleStage.getBoundingClientRect();
    const subtitleRect = this.subtitleStage.getBoundingClientRect();
    const socialRect = this.socialStage.getBoundingClientRect();

    const contentCenter = contentRect.top + contentRect.height / 2;
    const titleCenter = titleRect.top + titleRect.height / 2;
    const subtitleCenter = subtitleRect.top + subtitleRect.height / 2;
    const socialCenter = socialRect.top + socialRect.height / 2;

    const subtitleSocialTop = subtitleRect.top;
    const subtitleSocialBottom = socialRect.bottom;
    const subtitleSocialCenter = subtitleSocialTop + (subtitleSocialBottom - subtitleSocialTop) / 2;

    const stageConfig =
      window.innerWidth <= HERO_MOBILE_BREAKPOINT
        ? HERO_SCROLL_STAGE_CONFIG.mobile
        : HERO_SCROLL_STAGE_CONFIG.desktop;

    this.titleCenterShift = contentCenter - titleCenter;
    this.subtitleCenterShift = contentCenter - subtitleCenter;
    this.socialCenterShift = contentCenter - socialCenter;
    this.subtitleSocialCenterShift = contentCenter - subtitleSocialCenter;

    this.stageConfig = stageConfig;
  }

  handleResize() {
    this.updateBounds();
    this.handleScroll();
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const distance = this.clamp(
      scrollY - this.heroTop + HERO_SCROLL_OFFSET,
      0,
      this.maxScrollDistance
    );
    const progress = this.clamp(distance / this.maxScrollDistance, 0, 1);
    const shellOffset = scrollY * HERO_SHELL_SCROLL_FACTOR;

    this.hero.style.setProperty('--hero-shell-offset', `${shellOffset.toFixed(2)}px`);
    this.hero.style.setProperty('--hero-scroll-progress', progress.toFixed(4));

    this.measureCenters();
    this.updatePhoto(progress);
    this.updateStages(progress);
  }

  updatePhoto(progress) {
    const wave = Math.sin(progress * Math.PI);
    const enhanced = this.easeInOutCubic(wave);

    const shift = this.map(this.easeOutCubic(progress), 0, 1, 0, -3.2);
    const brightness = this.lerp(0.8, 1.08, enhanced);
    const contrast = this.lerp(0.96, 1.16, enhanced);
    const saturate = this.lerp(0.9, 1.06, enhanced);
    const leftOverlay = this.lerp(0.36, 0.2, enhanced);
    const photoOverlay = this.lerp(0.32, 0.12, enhanced);
    const blurOpacity = this.lerp(0.22, 0.05, enhanced);
    const mainOpacity = this.lerp(0.28, 0.58, enhanced);

    this.hero.style.setProperty('--hero-photo-shift', `${shift}rem`);
    this.hero.style.setProperty('--hero-photo-brightness', brightness.toFixed(3));
    this.hero.style.setProperty('--hero-photo-contrast', contrast.toFixed(3));
    this.hero.style.setProperty('--hero-photo-saturate', saturate.toFixed(3));
    this.hero.style.setProperty('--hero-left-overlay', leftOverlay.toFixed(3));
    this.hero.style.setProperty('--hero-photo-overlay', photoOverlay.toFixed(3));
    this.hero.style.setProperty('--hero-photo-blur-opacity', blurOpacity.toFixed(3));
    this.hero.style.setProperty('--hero-photo-main-opacity', mainOpacity.toFixed(3));
  }

  updateStages(progress) {
    const { stageConfig } = this;

    const titleFadePhase = this.clamp((progress - 0.1) / 0.24, 0, 1);
    const subtitleCenterPhase = this.clamp((progress - 0.3) / 0.1, 0, 1);
    const socialPreSplitDropPhase = this.clamp((progress - 0.4) / 0.035, 0, 1);
    const splitPhase = this.clamp((progress - 0.445) / 0.05, 0, 1);
    const subtitleLateDropPhase = this.clamp((progress - 0.58) / 0.1, 0, 1);
    const preFadeDropPhase = this.clamp((progress - 0.78) / 0.07, 0, 1);
    const subtitlePreReturnDropPhase = this.clamp((progress - 0.82) / 0.03, 0, 1);
    const subtitleFinalDipPhase = this.clamp((progress - 0.83) / 0.025, 0, 1);
    const subtitleFadePhase = this.clamp((progress - 0.855) / 0.07, 0, 1);
    const socialCenterPhase = this.clamp((progress - 0.36) / 0.1, 0, 1);
    const socialLowerPhase = this.clamp((progress - 0.46) / 0.08, 0, 1);
    const socialReturnPhase = this.clamp((progress - 0.84) / 0.07, 0, 1);
    const socialHoldPhase = this.clamp((progress - 0.91) / 0.06, 0, 1);
    const socialPreBlurDropPhase = this.clamp((progress - 0.955) / 0.025, 0, 1);
    const socialFadePhase = this.clamp((progress - 0.975) / 0.11, 0, 1);

    const titleFadeEase = this.easeOutCubic(titleFadePhase);
    const subtitleCenterEase = this.easeOutCubic(subtitleCenterPhase);
    const socialPreSplitDropEase = this.easeOutCubic(socialPreSplitDropPhase);
    const splitEase = this.easeOutCubic(splitPhase);
    const subtitleLateDropEase = this.easeOutCubic(subtitleLateDropPhase);
    const preFadeDropEase = this.easeOutCubic(preFadeDropPhase);
    const subtitlePreReturnDropEase = this.easeOutCubic(subtitlePreReturnDropPhase);
    const subtitleFinalDipEase = this.easeOutCubic(subtitleFinalDipPhase);
    const subtitleFadeEase = this.easeOutCubic(subtitleFadePhase);
    const socialCenterEase = this.easeOutCubic(socialCenterPhase);
    const socialLowerEase = this.easeOutCubic(socialLowerPhase);
    const socialReturnEase = this.easeInOutCubic(socialReturnPhase);
    const socialPreBlurDropEase = this.easeOutCubic(socialPreBlurDropPhase);
    const socialFadeEase = this.easeOutCubic(socialFadePhase);

    const titleOffset = this.map(titleFadeEase, 0, 1, 0, 68);
    const titleOpacity = this.map(titleFadeEase, 0, 1, 1, 0);

    const subtitleBaseTarget = this.subtitleCenterShift + stageConfig.subtitleVisualDrop;
    const subtitleBaseOffset = this.map(subtitleCenterEase, 0, 1, 0, subtitleBaseTarget);
    const subtitleSplitYOffset = this.map(splitEase, 0, 1, 0, stageConfig.subtitleSplitY);
    const subtitleRelativeLift = this.map(splitEase, 0, 1, 0, stageConfig.subtitleAboveSocialGap);
    const subtitleLateDropOffset = this.map(
      subtitleLateDropEase,
      0,
      1,
      0,
      stageConfig.subtitleLateDrop
    );
    const subtitlePreFadeDropOffset = this.map(
      preFadeDropEase,
      0,
      1,
      0,
      stageConfig.preFadeDropBoth
    );
    const subtitlePreReturnDropOffset = this.map(
      subtitlePreReturnDropEase,
      0,
      1,
      0,
      stageConfig.subtitlePreReturnDrop
    );
    const subtitleFinalDipOffset = this.map(
      subtitleFinalDipEase,
      0,
      1,
      0,
      stageConfig.subtitleFinalDip
    );
    const subtitleExitOffset = this.map(subtitleFadeEase, 0, 1, 0, 34);

    const subtitleOffset =
      subtitleBaseOffset +
      subtitleSplitYOffset +
      subtitleRelativeLift +
      subtitleLateDropOffset +
      subtitlePreFadeDropOffset +
      subtitlePreReturnDropOffset +
      subtitleFinalDipOffset +
      subtitleExitOffset;

    const subtitleOpacity = this.map(subtitleFadeEase, 0, 1, 1, 0);
    const subtitleX = this.map(splitEase, 0, 1, 0, stageConfig.subtitleSplitX);

    const socialBaseTarget = this.subtitleSocialCenterShift + stageConfig.subtitleVisualDrop;
    const socialLowerTarget = this.socialCenterShift + stageConfig.socialVisualDrop;
    const socialBaseOffset = this.map(socialCenterEase, 0, 1, 0, socialBaseTarget);
    const socialLowerOffset =
      this.lerp(socialBaseTarget, socialLowerTarget, socialLowerEase) - socialBaseTarget;
    const socialPreSplitDropOffset = this.map(
      socialPreSplitDropEase,
      0,
      1,
      0,
      stageConfig.socialPreSplitDrop
    );
    const socialSplitYOffset = this.map(splitEase, 0, 1, 0, stageConfig.socialSplitY);
    const socialCornerLiftOffset = this.map(splitEase, 0, 1, 0, stageConfig.socialCornerLift);
    const socialPreFadeDropOffset = this.map(preFadeDropEase, 0, 1, 0, stageConfig.preFadeDropBoth);
    const socialReturnDropOffset = this.map(
      socialReturnEase,
      0,
      1,
      0,
      stageConfig.socialReturnDrop
    );
    const socialPreBlurDropOffset = this.map(
      socialPreBlurDropEase,
      0,
      1,
      0,
      stageConfig.socialPreBlurDrop
    );

    const socialOffset =
      socialBaseOffset +
      socialPreSplitDropOffset +
      socialLowerOffset +
      socialSplitYOffset +
      socialCornerLiftOffset +
      socialPreFadeDropOffset +
      socialReturnDropOffset +
      socialPreBlurDropOffset;

    const socialCornerX = this.map(splitEase, 0, 1, 0, stageConfig.socialSplitX);
    const socialX = this.lerp(socialCornerX, 0, socialReturnEase);

    const socialOpacity = socialHoldPhase < 1 ? 1 : this.map(socialFadeEase, 0, 1, 1, 0);

    const socialBlur = socialHoldPhase < 1 ? 0 : this.map(socialFadeEase, 0, 1, 0, 10);

    this.socialStage.style.filter = `blur(${socialBlur.toFixed(2)}px)`;

    this.hero.style.setProperty('--hero-title-offset', `${titleOffset.toFixed(2)}px`);
    this.hero.style.setProperty('--hero-subtitle-offset', `${subtitleOffset.toFixed(2)}px`);
    this.hero.style.setProperty('--hero-social-offset', `${socialOffset.toFixed(2)}px`);
    this.hero.style.setProperty('--hero-title-opacity', titleOpacity.toFixed(3));
    this.hero.style.setProperty('--hero-subtitle-opacity', subtitleOpacity.toFixed(3));
    this.hero.style.setProperty('--hero-social-opacity', socialOpacity.toFixed(3));
    this.hero.style.setProperty('--hero-subtitle-x', `${subtitleX.toFixed(2)}px`);
    this.hero.style.setProperty('--hero-social-x', `${socialX.toFixed(2)}px`);
  }
}
