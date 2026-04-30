const { loadState, saveState, updateState, resetState, DEFAULT_STATE } = require('../js/state');

beforeEach(() => {
  localStorage.clear();
});

test('loadState returns DEFAULT_STATE when localStorage is empty', () => {
  const state = loadState();
  expect(state).toEqual(DEFAULT_STATE);
});

test('saveState and loadState round-trips state', () => {
  const modified = { ...DEFAULT_STATE, name: 'Alice', coins: 42, phase: 3 };
  saveState(modified);
  expect(loadState()).toEqual(modified);
});

test('updateState merges partial update into saved state', () => {
  saveState({ ...DEFAULT_STATE, name: 'Alice', coins: 10 });
  updateState({ coins: 25 });
  expect(loadState().coins).toBe(25);
  expect(loadState().name).toBe('Alice');
});

test('resetState restores DEFAULT_STATE', () => {
  saveState({ ...DEFAULT_STATE, name: 'Alice', phase: 5, coins: 200 });
  resetState();
  expect(loadState()).toEqual(DEFAULT_STATE);
});

test('DEFAULT_STATE has expected shape', () => {
  expect(DEFAULT_STATE).toMatchObject({
    name: '',
    phase: 1,
    tier: 'easy',
    coins: 0,
    unlocks: [],
    accuracyHistory: [],
    streak: { lastPlayedDate: null, count: 0 },
    totalWords: 0
  });
});
