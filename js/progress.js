var Progress = (function () {

  function recordSession(accuracy, wpm) {
    var state = State.loadState();
    var today = new Date().toISOString().slice(0, 10);

    var streak = state.streak;
    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    var newCount = (streak.lastPlayedDate === today)
      ? streak.count
      : (streak.lastPlayedDate === yesterday ? streak.count + 1 : 1);
    var newStreak = { lastPlayedDate: today, count: newCount };

    var history = state.accuracyHistory.concat([{ date: today, accuracy: accuracy, wpm: wpm || 0 }]);
    if (history.length > 30) history = history.slice(history.length - 30);

    State.updateState({ accuracyHistory: history, streak: newStreak });
  }

  function render(state) {
    var container = document.getElementById('progress-content');
    if (!container) return;

    var phaseNames = ['', 'Home Row', '+ G H', '+ E I', '+ R U', '+ T Y', '+ Q W O P', '+ Bottom Row', 'Full Keyboard'];
    var tier = state.tier || 'easy';
    var tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    var wpmEntries = state.accuracyHistory.filter(function (e) { return e.wpm > 0; });
    var bestWPM = wpmEntries.length > 0 ? Math.max.apply(null, wpmEntries.map(function (e) { return e.wpm; })) : 0;
    var avgWPM = wpmEntries.length > 0
      ? Math.round(wpmEntries.reduce(function (s, e) { return s + e.wpm; }, 0) / wpmEntries.length)
      : 0;

    var html = '<div class="progress-section">'
      + '<h3>Current Level</h3>'
      + '<p>Phase ' + state.phase + ' — ' + (phaseNames[state.phase] || '') + ' &nbsp;|&nbsp; ' + tierLabel + '</p>'
      + '<p>Total words typed: <strong>' + state.totalWords + '</strong></p>'
      + '<p>🔥 Streak: <strong>' + state.streak.count + ' day' + (state.streak.count !== 1 ? 's' : '') + '</strong></p>'
      + (wpmEntries.length > 0
        ? '<p>⌨️ Best speed: <strong>' + bestWPM + ' wpm</strong> &nbsp;|&nbsp; Avg: <strong>' + avgWPM + ' wpm</strong></p>'
        : '')
      + '</div>';

    if (state.accuracyHistory.length > 0) {
      html += '<div class="progress-section"><h3>Recent Accuracy</h3><div class="accuracy-bars">';
      var last = state.accuracyHistory.slice(-20);
      last.forEach(function (entry) {
        var h = Math.round(entry.accuracy * 80);
        var color = entry.accuracy >= 0.85 ? '#43a047' : entry.accuracy >= 0.7 ? '#fb8c00' : '#ef5350';
        html += '<div class="acc-bar" style="height:' + h + 'px;background:' + color + '" title="' + Math.round(entry.accuracy * 100) + '%"></div>';
      });
      html += '</div></div>';
    }

    html += '<div class="progress-section"><h3>Keys Mastered</h3><div class="progress-keyboard">';
    var ROWS = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l',';'],
      ['z','x','c','v','b','n','m',',','.','/']
    ];
    var unlocked = Keyboard.PHASE_KEYS[state.phase] || [];
    ROWS.forEach(function (row) {
      html += '<div class="kb-row">';
      row.forEach(function (key) {
        var isUnlocked = unlocked.indexOf(key) !== -1;
        var bg = isUnlocked ? '#e91e8c' : '#e0e0e0';
        var color = isUnlocked ? 'white' : '#aaa';
        html += '<div class="kb-key" style="background:' + bg + ';color:' + color + '">' + key.toUpperCase() + '</div>';
      });
      html += '</div>';
    });
    html += '</div></div>';

    container.innerHTML = html;
  }

  return { render, recordSession };
})();
