const { isTierCleared, nextTierOrPhase } = require('../js/progression');

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

test('nextTierOrPhase advances tier easy→medium', () => {
  expect(nextTierOrPhase(1, 'easy')).toEqual({ phase: 1, tier: 'medium' });
});

test('nextTierOrPhase advances tier medium→hard', () => {
  expect(nextTierOrPhase(1, 'medium')).toEqual({ phase: 1, tier: 'hard' });
});

test('nextTierOrPhase advances phase at hard tier', () => {
  expect(nextTierOrPhase(1, 'hard')).toEqual({ phase: 2, tier: 'easy' });
});

test('nextTierOrPhase stays at phase 8 hard when already at max', () => {
  expect(nextTierOrPhase(8, 'hard')).toEqual({ phase: 8, tier: 'hard' });
});
