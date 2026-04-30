function isTierCleared(accuracy, customersLost) {
  return accuracy >= 0.85 && customersLost <= 1;
}

function nextTierOrPhase(phase, tier) {
  var MAX_PHASE = 8;
  if (tier === 'easy')   return { phase: phase, tier: 'medium' };
  if (tier === 'medium') return { phase: phase, tier: 'hard' };
  if (phase >= MAX_PHASE) return { phase: MAX_PHASE, tier: 'hard' };
  return { phase: phase + 1, tier: 'easy' };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isTierCleared, nextTierOrPhase };
}
