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
      + '<div class="prog-card-title">Il livello attuale</div>'
      + '<div class="prog-stat-row">'
      + _statBox('Fase', state.phase, '')
      + _statBox('Chiavi', phaseNames[state.phase] || '', 'mint')
      + _statBox('Livello', tierLabel, 'yellow')
      + '</div>'
      + '<div class="prog-stat-row">'
      + _statBox('Parole totali', state.totalWords, '')
      + _statBox('Streak 🔥', state.streak.count + ' ' + (state.streak.count !== 1 ? 'giorni' : 'giorno'), 'mint')
      + (wpmEntries.length > 0 ? _statBox('Velocità max', bestWPM + ' wpm', 'yellow') : '')
      + '</div>'
      + (wpmEntries.length > 0 ? '<div class="prog-stat-row">' + _statBox('Velocità media', avgWPM + ' wpm', '') + '</div>' : '')
      + '</div>';

    if (state.accuracyHistory.length > 0) {
      html += '<div class="prog-card">'
        + '<div class="prog-card-title">Accuratezza recente</div>'
        + '<div class="accuracy-bars">';
      var last = state.accuracyHistory.slice(-20);
      last.forEach(function (entry) {
        var h = Math.round(entry.accuracy * 76);
        var bg = entry.accuracy >= 0.85 ? 'var(--mint-deep)' : entry.accuracy >= 0.7 ? 'var(--yellow-deep)' : 'var(--pink-deep)';
        html += '<div class="acc-bar" style="height:' + h + 'px;background:' + bg + '" title="' + Math.round(entry.accuracy * 100) + '%"></div>';
      });
      html += '</div></div>';
    }

    var ROWS = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l',';'],
      ['z','x','c','v','b','n','m',',','.','/']
    ];
    var ROW_CLASSES = ['', 'r2', 'r3'];
    var unlocked = Keyboard.PHASE_KEYS[state.phase] || [];

    html += '<div class="prog-card">'
      + '<div class="prog-card-title">Chiavi sbloccate</div>'
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
