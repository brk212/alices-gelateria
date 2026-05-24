var MAX_PHASE = 10;

function isTierCleared(accuracy, customersLost) {
  return accuracy >= 0.85 && customersLost <= 1;
}

// Returns a number representing position in the overall progression sequence:
// (1,easy)=0 … (8,easy)=7, (1,medium)=8 … (8,medium)=15, (1,hard)=16 … (8,hard)=23
function sequencePos(phase, tier) {
  var TIER_ORDER = { easy: 0, medium: 1, hard: 2 };
  return TIER_ORDER[tier] * MAX_PHASE + (phase - 1);
}

function nextTierOrPhase(phase, tier) {
  if (phase < MAX_PHASE) return { phase: phase + 1, tier: tier };
  if (tier === 'easy')   return { phase: 1, tier: 'medium' };
  if (tier === 'medium') return { phase: 1, tier: 'hard' };
  return { phase: MAX_PHASE, tier: 'hard' };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isTierCleared, nextTierOrPhase, sequencePos };
}
