const { isTierCleared, nextTierOrPhase, sequencePos } = require('../js/progression');

test('isTierCleared returns true for ≥85% accuracy and ≤1 lost customer', () => {
  expect(isTierCleared(0.85, 1)).toBe(true);
  expect(isTierCleared(0.92, 0)).toBe(true);
});

test('isTierCleared returns false for <85% accuracy', () => {
  expect(isTierCleared(0.84, 0)).toBe(false);
});

test('isTierCleared returns false for >1 lost customer', () => {
  expect(isTierCleared(0.90, 2)).toBe(false);
});

test('nextTierOrPhase advances phase within a tier', () => {
  expect(nextTierOrPhase(1, 'easy')).toEqual({ phase: 2, tier: 'easy' });
  expect(nextTierOrPhase(3, 'medium')).toEqual({ phase: 4, tier: 'medium' });
  expect(nextTierOrPhase(7, 'hard')).toEqual({ phase: 8, tier: 'hard' });
});

test('nextTierOrPhase advances tier at phase 10', () => {
  expect(nextTierOrPhase(10, 'easy')).toEqual({ phase: 1, tier: 'medium' });
  expect(nextTierOrPhase(10, 'medium')).toEqual({ phase: 1, tier: 'hard' });
});

test('nextTierOrPhase stays at phase 10 hard when already at max', () => {
  expect(nextTierOrPhase(10, 'hard')).toEqual({ phase: 10, tier: 'hard' });
});

test('sequencePos orders easy before medium before hard', () => {
  expect(sequencePos(1, 'easy')).toBe(0);
  expect(sequencePos(10, 'easy')).toBe(9);
  expect(sequencePos(1, 'medium')).toBe(10);
  expect(sequencePos(10, 'medium')).toBe(19);
  expect(sequencePos(1, 'hard')).toBe(20);
  expect(sequencePos(10, 'hard')).toBe(29);
});

test('sequencePos: all easy phases come before any medium phase', () => {
  expect(sequencePos(10, 'easy')).toBeLessThan(sequencePos(1, 'medium'));
});
