(function () {
  'use strict';

  function init() {
    var state = State.loadState();

    if (!state.name) {
      Screens.showScreen('setup');
      Screens.initSetup(function (name) {
        State.updateState({ name: name });
        goHome();
      });
    } else {
      goHome();
    }
  }

  function goHome() {
    var state = State.loadState();
    Screens.renderHome(state);
    Screens.showScreen('home');

    document.getElementById('home-open').onclick = startShift;
    document.getElementById('nav-upgrades').onclick = goUpgrades;
    document.getElementById('nav-progress').onclick = goProgress;
    document.getElementById('nav-levelselect').onclick = goLevelSelect;
  }

  // phase and tier are optional — if omitted, uses current state values
  function startShift(phase, tier) {
    Screens.showScreen('game');

    var quitBtn = document.getElementById('game-quit');
    if (quitBtn) quitBtn.onclick = function () {
      Gameplay.abortShift();
      goHome();
    };

    var state = State.loadState();
    var playPhase = phase || state.phase;
    var playTier  = tier  || state.tier;
    var playState = Object.assign({}, state, { phase: playPhase, tier: playTier });

    Gameplay.startShift(playState, {
      onShiftEnd: function (result) {
        Progress.recordSession(result.accuracy, result.wpm);
        var freshState = State.loadState();
        State.updateState({
          totalWords: freshState.totalWords + result.ordersCompleted,
          coins:      freshState.coins + result.coinsEarned
        });
        // NOTE: state.phase / state.tier are NOT advanced here.
        // Advancement only happens when the user clicks "Next Level".

        var cleared = isTierCleared(result.accuracy, result.customersLost);

        Screens.showScreen('summary');
        Screens.renderSummary(result, cleared);

        // Try Again → replay the exact level just played
        document.getElementById('summary-retry').onclick = function () {
          startShift(result.phase, result.tier);
        };
        document.getElementById('summary-home').onclick = goHome;

        // Next Level → advance main progress (only if at current level), start next level
        var nextBtn = document.getElementById('summary-next');
        if (nextBtn) {
          if (cleared) {
            var next = nextTierOrPhase(result.phase, result.tier);
            nextBtn.style.display = '';
            nextBtn.onclick = function () {
              // Advance main progress only when the player cleared their actual current level
              var cs = State.loadState();
              if (result.phase === cs.phase && result.tier === cs.tier) {
                State.updateState({ phase: next.phase, tier: next.tier });
              }
              startShift(next.phase, next.tier);
            };
          } else {
            nextBtn.style.display = 'none';
          }
        }
      }
    });
  }

  function goLevelSelect() {
    var state = State.loadState();
    Screens.renderLevelSelect(state);
    Screens.showScreen('levelselect');
    document.getElementById('levelselect-back').onclick = goHome;

    // Event delegation — one listener for all tier buttons
    var content = document.getElementById('levelselect-content');
    if (content) {
      content.onclick = function (e) {
        var btn = e.target.closest('.ls-tier-btn');
        if (!btn || btn.disabled) return;
        var p = parseInt(btn.getAttribute('data-phase'), 10);
        var t = btn.getAttribute('data-tier');
        startShift(p, t);
      };
    }
  }

  function goUpgrades() {
    Shop.render(State.loadState());
    Screens.showScreen('upgrades');
    document.getElementById('upgrades-back').onclick = goHome;
  }

  function goProgress() {
    Progress.render(State.loadState());
    Screens.showScreen('progress');
    document.getElementById('progress-back').onclick = goHome;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
