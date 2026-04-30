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
  }

  function startShift() {
    Screens.showScreen('game');
    var state = State.loadState();
    Gameplay.startShift(state, {
      onShiftEnd: function (result) {
        Progress.recordSession(result.accuracy, result.wpm);
        var freshState = State.loadState();
        State.updateState({
          totalWords: freshState.totalWords + result.ordersCompleted,
          coins: freshState.coins + result.coinsEarned
        });

        var cleared = isTierCleared(result.accuracy, result.customersLost);
        if (cleared) {
          var next = nextTierOrPhase(result.phase, result.tier);
          State.updateState({ phase: next.phase, tier: next.tier });
        }

        Screens.showScreen('summary');
        Screens.renderSummary(result);

        document.getElementById('summary-retry').onclick = startShift;
        document.getElementById('summary-home').onclick = goHome;
      }
    });
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
