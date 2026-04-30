var Screens = (function () {
  var SCREEN_IDS = ['setup', 'home', 'game', 'summary', 'upgrades', 'progress'];

  function showScreen(name) {
    SCREEN_IDS.forEach(function (id) {
      var el = document.getElementById('screen-' + id);
      if (el) el.classList.toggle('hidden', id !== name);
    });
  }

  function initSetup(onComplete) {
    var input = document.getElementById('setup-name');
    var btn = document.getElementById('setup-start');

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
    var phaseNames = ['', 'Home Row', '+ G H', '+ E I', '+ R U', '+ T Y', '+ Q W O P', '+ Bottom Row', 'Full Keyboard'];
    document.getElementById('home-phase').textContent = 'Phase ' + state.phase + ' — ' + (phaseNames[state.phase] || '');
    document.getElementById('home-tier').textContent = state.tier.charAt(0).toUpperCase() + state.tier.slice(1);
  }

  return { showScreen, initSetup, renderHome };
})();
