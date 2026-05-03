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

    document.getElementById('home-open').onclick = function () { startShift(); };
    document.getElementById('nav-upgrades').onclick = goUpgrades;
    document.getElementById('nav-progress').onclick = goProgress;
    document.getElementById('nav-levelselect').onclick = goLevelSelect;
    var convBtn = document.getElementById('nav-conversation');
    if (convBtn) convBtn.onclick = startConversationShift;
  }

  // phase, tier, and mode are optional — if omitted, uses current state values
  function startShift(phase, tier, mode, conversationPhase) {
    Screens.showScreen('game');

    var quitBtn = document.getElementById('game-quit');
    if (quitBtn) quitBtn.onclick = function () {
      Gameplay.abortShift();
      goHome();
    };

    var state = State.loadState();
    var playPhase = (mode === 'conversation') ? state.phase : (phase || state.phase);
    var playTier  = (mode === 'conversation') ? 'medium'    : (tier  || state.tier);
    var playConvPhase = conversationPhase !== undefined ? conversationPhase : (state.conversationPhase || 'full');
    var playState = Object.assign({}, state, {
      phase: playPhase,
      tier: playTier,
      mode: mode || 'word',
      conversationPhase: playConvPhase
    });

    Gameplay.startShift(playState, {
      onShiftEnd: function (result) {
        var freshState = State.loadState();

        if (result.mode === 'conversation') {
          Progress.recordConversationSession(result);
          State.updateState({ coins: freshState.coins + result.coinsEarned });
          Screens.showScreen('summary');
          Screens.renderSummary(result, false);
          document.getElementById('summary-retry').onclick = startConversationShift;
          document.getElementById('summary-home').onclick = goHome;
          var nextBtn = document.getElementById('summary-next');
          if (nextBtn) nextBtn.style.display = 'none';
        } else {
          Progress.recordSession(result.accuracy, result.wpm);
          State.updateState({
            totalWords: freshState.totalWords + result.ordersCompleted,
            coins:      freshState.coins + result.coinsEarned
          });
          var cleared = isTierCleared(result.accuracy, result.customersLost);
          Screens.showScreen('summary');
          Screens.renderSummary(result, cleared);
          document.getElementById('summary-retry').onclick = function () {
            startShift(result.phase, result.tier);
          };
          document.getElementById('summary-home').onclick = goHome;
          var nextBtn = document.getElementById('summary-next');
          if (nextBtn) {
            if (cleared) {
              var next = nextTierOrPhase(result.phase, result.tier);
              nextBtn.style.display = '';
              nextBtn.onclick = function () {
                var cs = State.loadState();
                var TIER_ORDER = { easy: 0, medium: 1, hard: 2 };
                if (result.phase === cs.phase && TIER_ORDER[result.tier] >= TIER_ORDER[cs.tier]) {
                  State.updateState({ phase: next.phase, tier: next.tier });
                }
                startShift(next.phase, next.tier);
              };
            } else {
              nextBtn.style.display = 'none';
            }
          }
        }
      }
    });
  }

  function showConversationPhasePicker(onSelect) {
    var modal = document.getElementById('conversation-phase-modal');
    if (modal.style.display === 'flex') return;  // already open
    var state = State.loadState();
    var lastPhase = state.conversationPhase || 'full';

    // Highlight last-used phase
    modal.querySelectorAll('.phase-card').forEach(function (card) {
      var phase = card.getAttribute('data-phase');
      var phaseVal = phase === 'full' ? 'full' : parseInt(phase, 10);
      card.classList.toggle('phase-card--active', phaseVal === lastPhase);
    });

    modal.style.display = 'flex';

    function handleCardClick(e) {
      var card = e.target.closest('.phase-card');
      if (!card) return;
      var raw = card.getAttribute('data-phase');
      var phase = raw === 'full' ? 'full' : parseInt(raw, 10);
      cleanup();
      onSelect(phase);
    }

    function cleanup() {
      modal.style.display = 'none';
      modal.querySelector('.phase-picker-grid').removeEventListener('click', handleCardClick);
      document.getElementById('conversation-phase-cancel').removeEventListener('click', cleanup);
    }

    modal.querySelector('.phase-picker-grid').addEventListener('click', handleCardClick);
    document.getElementById('conversation-phase-cancel').addEventListener('click', cleanup);
  }

  function startConversationShift() {
    showConversationPhasePicker(function (conversationPhase) {
      State.updateState({ conversationPhase: conversationPhase });
      startShift(null, null, 'conversation', conversationPhase);
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
