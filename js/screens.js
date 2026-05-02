var Screens = (function () {
  var SCREEN_IDS = ['setup', 'home', 'game', 'summary', 'upgrades', 'progress', 'levelselect'];
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

  function renderSummary(result, cleared) {
    var title = document.getElementById('summary-title');
    var stats = document.getElementById('summary-stats');
    if (!title || !stats) return;

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

    // Show/hide next-level button
    var nextBtn = document.getElementById('summary-next');
    if (nextBtn) nextBtn.style.display = cleared ? '' : 'none';
  }

  function renderLevelSelect(state) {
    var container = document.getElementById('levelselect-content');
    if (!container) return;

    var tiers = ['easy', 'medium', 'hard'];
    var html = '';

    for (var p = 1; p <= 8; p++) {
      var locked = p > state.phase;
      var isCurrent = (p === state.phase);
      html += '<div class="ls-card' + (locked ? ' ls-locked' : '') + '">'
        + '<div class="ls-phase-header">'
        + '<div class="ls-phase-num">' + p + '</div>'
        + '<div>'
        + '<div class="ls-phase-name">' + PHASE_NAMES[p] + '</div>'
        + (isCurrent ? '<div class="ls-current-badge">Your level</div>' : '')
        + '</div>'
        + '</div>';

      if (locked) {
        html += '<div class="ls-locked-msg">Keep playing to unlock</div>';
      } else {
        html += '<div class="ls-tiers">';
        tiers.forEach(function (tier) {
          var label = tier.charAt(0).toUpperCase() + tier.slice(1);
          var isActiveTier = isCurrent && tier === state.tier;
          html += '<button class="ls-tier-btn' + (isActiveTier ? ' ls-active' : '') + '" '
            + 'data-phase="' + p + '" data-tier="' + tier + '">'
            + label
            + (isActiveTier ? ' ★' : '')
            + '</button>';
        });
        html += '</div>';
      }

      html += '</div>';
    }

    container.innerHTML = html;
  }

  function _statRow(label, value) {
    return '<div class="summary-stat-row">'
      + '<span class="stat-label">' + label + '</span>'
      + '<span class="stat-value">' + value + '</span>'
      + '</div>';
  }

  return { showScreen, initSetup, renderHome, renderSummary, renderLevelSelect };
})();
