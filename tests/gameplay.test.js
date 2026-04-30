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
