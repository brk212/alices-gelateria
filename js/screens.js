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
    document.getElementById('home-greeting').textContent = 'Welcome back, ' + state.name + '!';
    document.getElementById('home-coins').textContent = '🪙 ' + state.coins;
    document.getElementById('home-phase').textContent = 'Phase ' + state.phase + ' — ' + (PHASE_NAMES[state.phase] || '');
    var tier = state.tier || 'easy';
    document.getElementById('home-tier').textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  function renderSummary(result) {
    var title = document.getElementById('summary-title');
    var stats = document.getElementById('summary-stats');
    if (!title || !stats) return { cleared: false };

    var cleared = isTierCleared(result.accuracy, result.customersLost);

    if (result.won && cleared) {
      title.textContent = '🎉 Shift Complete!';
    } else if (result.won) {
      title.textContent = '✅ Shift Done!';
    } else {
      title.textContent = '😔 Try Again!';
    }

    var pct = Math.round(result.accuracy * 100);
    stats.innerHTML = '<p>Words served: <strong>' + result.ordersCompleted + '</strong></p>'
      + '<p>Accuracy: <strong>' + pct + '%</strong></p>'
      + '<p>Customers lost: <strong>' + result.customersLost + '</strong></p>'
      + '<p>Coins earned: <strong>🪙 ' + result.coinsEarned + '</strong></p>'
      + (cleared ? '<p style="color:#43a047;font-weight:700;margin-top:12px">⭐ Tier cleared! Next level unlocked.</p>' : '');

    return { cleared: cleared };
  }

  return { showScreen, initSetup, renderHome, renderSummary };
})();
