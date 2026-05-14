const CODE_PHRASE_INTERVAL_MS = 9000;
const SENTENCE_MODE_CHANCE = 0.6;
const MAX_UNIQUE_ATTEMPTS = 8;

const codePhraseState = {
  intervalId: null,
  previousRenderedLine: '',
  hasRenderedInitialLine: false,
};

const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const htmlStripper = document.createElement('div');

const stripHtml = (value) => {
  htmlStripper.innerHTML = value;
  return (htmlStripper.textContent || htmlStripper.innerText || '').trim();
};

const startsSentence = (part) => /^[A-ZÀ-Ý]/.test(stripHtml(part));

const endsSentence = (part) => /[.!?…]$/.test(stripHtml(part));

const groupPartsIntoSentences = (parts) => {
  const groups = [];
  let currentGroup = [];

  parts.forEach((part) => {
    const isSentenceStart = startsSentence(part);

    if (isSentenceStart && currentGroup.length > 0) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }

    currentGroup.push(part);

    if (endsSentence(part)) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
  });

  if (currentGroup.length > 0) {
    groups.push([...currentGroup]);
  }

  return groups;
};

const renderOriginalSentenceOrder = (parts) => parts.join(' ');

const renderBySentenceGroups = (parts) => {
  const groups = groupPartsIntoSentences(parts);
  return shuffleArray(groups).flat().join(' ');
};

const renderByLooseWords = (parts) => shuffleArray(parts).join(' ');

const buildMixedLine = (parts) => {
  const useSentenceGroups = Math.random() < SENTENCE_MODE_CHANCE;

  return useSentenceGroups ? renderBySentenceGroups(parts) : renderByLooseWords(parts);
};

const buildUniqueLine = (parts, maxAttempts = MAX_UNIQUE_ATTEMPTS) => {
  let nextLine = buildMixedLine(parts);
  let attempts = 0;

  while (nextLine === codePhraseState.previousRenderedLine && attempts < maxAttempts) {
    nextLine = buildMixedLine(parts);
    attempts += 1;
  }

  return nextLine;
};

const clearCodePhraseInterval = () => {
  if (!codePhraseState.intervalId) {
    return;
  }

  clearInterval(codePhraseState.intervalId);
  codePhraseState.intervalId = null;
};

export const renderCodePhraseLine = (parts) => {
  const line = document.getElementById('codePhraseLine');

  if (!line || !Array.isArray(parts) || parts.length === 0) {
    return;
  }

  const render = () => {
    const nextLine = codePhraseState.hasRenderedInitialLine
      ? buildUniqueLine(parts)
      : renderOriginalSentenceOrder(parts);

    line.innerHTML = nextLine;
    codePhraseState.previousRenderedLine = nextLine;
    codePhraseState.hasRenderedInitialLine = true;
  };

  clearCodePhraseInterval();
  render();

  codePhraseState.intervalId = setInterval(render, CODE_PHRASE_INTERVAL_MS);
};
