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

    var html = '<div class="prog-card">'
      + '<div class="prog-card-title">Current Level</div>'
      + '<div class="prog-stat-row">'
      + _statBox('Phase', state.phase, '')
      + _statBox('Keys', phaseNames[state.phase] || '', 'mint')
      + _statBox('Level', tierLabel, 'yellow')
      + '</div>'
      + '<div class="prog-stat-row">'
      + _statBox('Total Words', state.totalWords, '')
      + _statBox('Streak 🔥', state.streak.count + ' ' + (state.streak.count !== 1 ? 'days' : 'day'), 'mint')
      + (wpmEntries.length > 0 ? _statBox('Best Speed', bestWPM + ' wpm', 'yellow') : '')
      + '</div>'
      + (wpmEntries.length > 0 ? '<div class="prog-stat-row">' + _statBox('Avg Speed', avgWPM + ' wpm', '') + '</div>' : '')
      + '</div>';

    var lastWpm = state.accuracyHistory.slice(-20).filter(function (e) { return e.wpm > 0; });
    if (lastWpm.length > 0) {
      var maxWpm = Math.max.apply(null, lastWpm.map(function (e) { return e.wpm; }));
      html += '<div class="prog-card">'
        + '<div class="prog-card-title">Recent Speed (WPM)</div>'
        + '<div class="accuracy-bars">';
      lastWpm.forEach(function (entry) {
        var h = Math.round((entry.wpm / maxWpm) * 76);
        var bg = entry.wpm >= maxWpm * 0.9 ? 'var(--yellow)'
               : entry.wpm >= maxWpm * 0.5 ? 'var(--mint-deep)'
               : 'var(--ink-faint)';
        var label = entry.wpm + ' wpm' + (entry.wpm === maxWpm ? ' ★ best' : '');
        html += '<div class="acc-bar" style="height:' + h + 'px;background:' + bg + '" title="' + label + '"></div>';
      });
      html += '</div>'
        + '<div class="prog-wpm-best">★ ' + maxWpm + ' wpm personal best</div>'
        + '</div>';
    }

    var ROWS = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l',';'],
      ['z','x','c','v','b','n','m',',','.','/']
    ];
    var ROW_CLASSES = ['', 'r2', 'r3'];
    var unlocked = Keyboard.PHASE_KEYS[state.phase] || [];

    html += '<div class="prog-card">'
      + '<div class="prog-card-title">Keys Unlocked</div>'
      + '<div class="prog-keyboard">';

    ROWS.forEach(function (row, ri) {
      html += '<div class="prog-kb-row ' + (ROW_CLASSES[ri] || '') + '">';
      row.forEach(function (key) {
        var isUnlocked = unlocked.indexOf(key) !== -1;
        var bg = isUnlocked ? 'var(--pink-deep)' : 'rgba(255,255,255,0.3)';
        var color = isUnlocked ? 'white' : 'var(--ink-faint)';
        html += '<div class="prog-key" style="background:' + bg + ';color:' + color + '">' + key.toUpperCase() + '</div>';
      });
      html += '</div>';
    });

    html += '</div></div>';

    container.innerHTML = html;
  }

  function _statBox(label, value, mod) {
    return '<div class="prog-stat-box' + (mod ? ' ' + mod : '') + '">'
      + '<div class="prog-stat-num">' + value + '</div>'
      + '<div class="prog-stat-lbl">' + label + '</div>'
      + '</div>';
  }

  return { render, recordSession };
})();
