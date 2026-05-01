var Screens = (function () {
  var SCREEN_IDS = ['setup', 'home', 'game', 'summary', 'upgrades', 'progress'];
  var PHASE_NAMES = ['', 'Home Row', '+ G H', '+ E I', '+ R U', '+ T Y', '+ Q W O P', '+ Bottom Row', 'Full Keyboard'];

  function showScreen(name) {
    SCREEN_IDS.forEach(function (id) {
      var el = document.getElementById('screen-' + id);
      if (el) el.classList.toggle('hidden', id !== name);
    });
  }

  function initSetup(onComplete) {
    var input = document.getElementById('setup-name');
    var btn = document.getElementById('setup-start');
    if (!input || !btn) { console.error('Screens.initSetup: required elements not found'); return; }

    input.focus();

    function submit() {
      var name = input.value.trim();
      if (!name) { input.focus(); return; }
      onComplete(name);
    }

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit();
    });
  }

  function renderHome(state) {
    var name = state.name || 'Chef';
    var tier = state.tier || 'easy';
    var tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
    var phaseName = PHASE_NAMES[state.phase] || '';

    var greetEl = document.getElementById('home-greeting');
    if (greetEl) greetEl.textContent = name + '!';

    var coinsEl = document.getElementById('home-coins');
    if (coinsEl) coinsEl.textContent = '🪙 ' + state.coins;

    var coinsStat = document.getElementById('home-coins-stat');
    if (coinsStat) coinsStat.textContent = state.coins;

    var wordsEl = document.getElementById('home-words');
    if (wordsEl) wordsEl.textContent = state.totalWords;

    var streakEl = document.getElementById('home-streak');
    if (streakEl) streakEl.textContent = state.streak.count;

    var phaseEl = document.getElementById('home-phase');
    if (phaseEl) phaseEl.textContent = 'Phase ' + state.phase;

    var phaseNumEl = document.getElementById('home-phase-num');
    if (phaseNumEl) phaseNumEl.textContent = state.phase;

    var phaseNameEl = document.getElementById('home-phase-name');
    if (phaseNameEl) phaseNameEl.textContent = phaseName;

    var tierEl = document.getElementById('home-tier');
    if (tierEl) tierEl.textContent = tierLabel;
  }

  function renderSummary(result) {
    var title = document.getElementById('summary-title');
    var stats = document.getElementById('summary-stats');
    if (!title || !stats) return;

    var cleared = isTierCleared(result.accuracy, result.customersLost);

    if (result.won && cleared) {
      title.textContent = 'Bravissima! Level cleared! ⭐';
    } else if (result.won) {
      title.textContent = 'Shift done!';
    } else {
      title.textContent = 'Try again!';
    }

    var pct = Math.round(result.accuracy * 100);

    stats.innerHTML = ''
      + _statRow('Orders Served', result.ordersCompleted)
      + _statRow('Speed', result.wpm + ' wpm')
      + _statRow('Accuracy', pct + '%')
      + _statRow('Customers Lost', result.customersLost)
      + _statRow('Coins Earned', '🪙 ' + result.coinsEarned)
      + (cleared ? '<div class="summary-cleared">⭐ Next level unlocked!</div>' : '');
  }

  function _statRow(label, value) {
    return '<div class="summary-stat-row">'
      + '<span class="stat-label">' + label + '</span>'
      + '<span class="stat-value">' + value + '</span>'
      + '</div>';
  }

  return { showScreen, initSetup, renderHome, renderSummary };
})();
