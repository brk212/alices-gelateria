var State = (function () {
  var DEFAULT_STATE = {
    name: '',
    phase: 1,
    tier: 'easy',
    coins: 0,
    unlocks: [],
    accuracyHistory: [],
    streak: { lastPlayedDate: null, count: 0 },
    totalWords: 0,
    conversationStats: { totalSentences: 0, bestWPM: 0, accuracyHistory: [] },
    conversationPhase: 'full'
  };

  var STORAGE_KEY = 'alices_gelateria_state';

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE);
      var parsed = JSON.parse(raw);
      // Merge with DEFAULT_STATE to handle schema additions gracefully
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateState(partial) {
    var current = loadState();
    var next = Object.assign({}, current, partial);
    if (partial.streak) {
      next.streak = Object.assign({}, current.streak, partial.streak);
    }
    if (partial.conversationStats) {
      next.conversationStats = Object.assign({}, current.conversationStats, partial.conversationStats);
    }
    saveState(next);
    return next;
  }

  function resetState() {
    saveState(Object.assign({}, DEFAULT_STATE));
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_STATE, loadState, saveState, updateState, resetState };
  }

  return { DEFAULT_STATE, loadState, saveState, updateState, resetState };
})();
