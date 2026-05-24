const { createWordState, handleKeypress, calculateAccuracy } = require('../js/gameplay');

test('createWordState initialises with index 0 and no errors', () => {
  const ws = createWordState('fall');
  expect(ws.word).toBe('fall');
  expect(ws.index).toBe(0);
  expect(ws.correctCount).toBe(0);
  expect(ws.wrongCount).toBe(0);
  expect(ws.complete).toBe(false);
});

test('handleKeypress advances index on correct key', () => {
  let ws = createWordState('fall');
  ws = handleKeypress(ws, 'f');
  expect(ws.index).toBe(1);
  expect(ws.correctCount).toBe(1);
  expect(ws.wrongCount).toBe(0);
});

test('handleKeypress does not advance on wrong key', () => {
  let ws = createWordState('fall');
  ws = handleKeypress(ws, 'x');
  expect(ws.index).toBe(0);
  expect(ws.wrongCount).toBe(1);
  expect(ws.lastWrong).toBe(true);
});

test('handleKeypress marks complete when last letter typed', () => {
  let ws = createWordState('hi');
  ws = handleKeypress(ws, 'h');
  ws = handleKeypress(ws, 'i');
  expect(ws.complete).toBe(true);
});

test('calculateAccuracy returns 1.0 for zero errors', () => {
  expect(calculateAccuracy(10, 0)).toBe(1.0);
});

test('calculateAccuracy returns 0.8 for 2 wrong out of 10 total', () => {
  expect(calculateAccuracy(8, 2)).toBeCloseTo(0.8);
});

test('calculateAccuracy returns 0 when no keypresses', () => {
  expect(calculateAccuracy(0, 0)).toBe(0);
});

const { isSentenceComplete } = require('../js/gameplay');

test('isSentenceComplete returns false when typed is shorter than sentence', () => {
  expect(isSentenceComplete('hello', 'hello world')).toBe(false);
});

test('isSentenceComplete returns true when typed matches sentence perfectly', () => {
  expect(isSentenceComplete('hello world', 'hello world')).toBe(true);
});

test('isSentenceComplete returns true at exactly 90% accuracy', () => {
  // 10 of 11 chars correct = 90.9%
  expect(isSentenceComplete('hellX_worl', 'hello_world')).toBe(false); // shorter — only 10 chars, sentence is 11
  expect(isSentenceComplete('hellX_worldX', 'hello_worldX')).toBe(true); // 11/12 typed, 11 chars match = 91.6%
});

test('isSentenceComplete returns false when accuracy is below 90%', () => {
  // 7 of 10 chars correct = 70%
  expect(isSentenceComplete('hXllX_wXrld', 'hello_world')).toBe(false);
});

const { PHASE_WORDS } = require('../data/words');
global.PHASE_WORDS = PHASE_WORDS;
const { generatePhrase, PHASE_LETTER_LABELS } = require('../js/gameplay');

test('generatePhrase returns 9 space-separated words for phase 1', () => {
  const phrase = generatePhrase(1);
  const words = phrase.split(' ');
  expect(words).toHaveLength(9);
});

test('generatePhrase words all come from the phase pool', () => {
  const phrase = generatePhrase(1);
  const words = phrase.split(' ');
  const pool = PHASE_WORDS[1];
  words.forEach(w => expect(pool).toContain(w));
});

test('generatePhrase produces no adjacent duplicate words', () => {
  [1, 5, 6].forEach(phase => {
    for (let i = 0; i < 20; i++) {
      const words = generatePhrase(phase).split(' ');
      for (let j = 0; j < words.length - 1; j++) {
        expect(words[j]).not.toBe(words[j + 1]);
      }
    }
  });
});

test('no phase word pool contains duplicate words', () => {
  [1, 2, 3, 4, 5, 6, 7].forEach(p => {
    const pool = PHASE_WORDS[p];
    const unique = new Set(pool);
    expect(unique.size).toBe(pool.length);
  });
});

test('PHASE_LETTER_LABELS has entries for phases 1 through 9', () => {
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
    expect(PHASE_LETTER_LABELS[p]).toBeDefined();
    expect(typeof PHASE_LETTER_LABELS[p].letters).toBe('string');
    expect(typeof PHASE_LETTER_LABELS[p].label).toBe('string');
  });
});
