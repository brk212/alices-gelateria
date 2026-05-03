var Gameplay = (function () {

  // ── Pure logic (tested) ──────────────────────────────────────────────

  function createWordState(word) {
    return { word: word, index: 0, correctCount: 0, wrongCount: 0, complete: false, lastWrong: false };
  }

  function handleKeypress(wordState, key) {
    if (wordState.complete) return wordState;
    var expected = wordState.word[wordState.index];
    // Case-insensitive so Caps Lock doesn't break the game for a young learner
    if (key.toLowerCase() === expected.toLowerCase()) {
      var newIndex = wordState.index + 1;
      return Object.assign({}, wordState, {
        index: newIndex, correctCount: wordState.correctCount + 1,
        complete: newIndex === wordState.word.length, lastWrong: false
      });
    } else {
      return Object.assign({}, wordState, { wrongCount: wordState.wrongCount + 1, lastWrong: true });
    }
  }

  function calculateAccuracy(correct, wrong) {
    var total = correct + wrong;
    return total === 0 ? 0 : correct / total;
  }

  function calculateWPM(ordersCompleted, elapsedMs) {
    if (elapsedMs < 1000) return 0;
    return Math.round(ordersCompleted / (elapsedMs / 60000));
  }

  function isSentenceComplete(typed, sentence) {
    if (!sentence || sentence.length === 0) return false;
    if (typed.length < sentence.length) return false;
    var correct = 0;
    for (var i = 0; i < sentence.length; i++) {
      if (typed[i].toLowerCase() === sentence[i].toLowerCase()) correct++;
    }
    return correct / sentence.length >= 0.9;
  }

  // ── Session config ───────────────────────────────────────────────────

  var TIER_CONFIG = {
    easy:   { ordersToWin: 15, maxConcurrent: 1, patienceMs: 60000 },
    medium: { ordersToWin: 20, maxConcurrent: 2, patienceMs: 40000 },
    hard:   { ordersToWin: 25, maxConcurrent: 3, patienceMs: 25000 }
  };
  var CONVERSATION_CONFIG = { ordersToWin: 10, maxConcurrent: 2, patienceMs: 40000 };
  var PHASE_LETTER_LABELS = {
    1: { letters: 'a s d f j k l', label: 'home row' },
    2: { letters: '+ g h',         label: 'left stretch' },
    3: { letters: '+ i e',         label: 'top row vowels' },
    4: { letters: '+ u r',         label: 'right vowel + reach' },
    5: { letters: '+ t y',         label: 'top row center' },
    6: { letters: '+ w o p',       label: 'outer ring' },
    7: { letters: '+ n b m c z v', label: 'bottom row' }
  };

  function generatePhrase(phase) {
    var pool = PHASE_WORDS[phase].slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var words = [];
    for (var k = 0; k < 9; k++) {
      words.push(pool[k % pool.length]);
    }
    return words.join(' ');
  }

  var COINS_PER_WORD = 10;
  var MAX_LIVES = 3;

  // ── Session state ────────────────────────────────────────────────────

  var session = null;
  var patienceIntervals = {};
  var onShiftEnd = null;
  var paused = false;

  function getSession() { return session; }

  // ── Helpers ──────────────────────────────────────────────────────────

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function getWordPool(phase) {
    return PHASE_WORDS[phase] || PHASE_WORDS[1];
  }

  function buildCustomerQueue(count, allCustomers) {
    var queue = [];
    for (var i = 0; i < count; i++) {
      var c = pickRandom(allCustomers);
      queue.push({ name: c.name, emoji: c.emoji, img: c.img || null, id: 'cust_' + i });
    }
    return queue;
  }

  // ── Shift management ─────────────────────────────────────────────────

  function startShift(state, callbacks) {
    onShiftEnd = callbacks.onShiftEnd;
    var config = state.mode === 'conversation' ? CONVERSATION_CONFIG : (TIER_CONFIG[state.tier] || TIER_CONFIG.easy);
    var wordPool = state.mode === 'conversation'
      ? CONVERSATION_SENTENCES
      : getWordPool(state.phase);

    session = {
      phase: state.phase,
      tier: state.tier,
      config: config,
      lives: MAX_LIVES,
      coins: state.coins,
      coinsEarnedThisShift: 0,
      wordsTyped: 0,
      ordersCompleted: 0,
      customersLost: 0,
      totalCorrect: 0,
      totalWrong: 0,
      ordersToWin: config.ordersToWin,
      activeOrders: [],
      customerQueue: [],
      wordPool: wordPool,
      streak: 0,
      callbacks: callbacks,
      shiftStartTime: Date.now(),
      mode: state.mode || 'word',
      conversationPhase: state.conversationPhase || 'full'
    };

    session.customerQueue = buildCustomerQueue(config.ordersToWin + 5, CUSTOMERS);

    renderGameStats();
    refillActiveOrders();
    renderCustomerQueue();
    renderOrderArea();

    if (session.mode !== 'conversation') {
      Keyboard.render(state.phase, true);
    } else {
      var kbEl = document.getElementById('keyboard-hint');
      if (kbEl) kbEl.innerHTML = '';
    }

    paused = false;
    document.removeEventListener('keydown', _onKey);
    document.addEventListener('keydown', _onKey);
  }

  function _pause() {
    if (!session || paused) return;
    paused = true;
    Object.keys(patienceIntervals).forEach(function (id) { clearInterval(patienceIntervals[id]); });
    patienceIntervals = {};
    session.pausedAt = Date.now();
    var overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.innerHTML = '<div class="pause-box"><div class="pause-title">Paused</div><button class="btn btn-primary" id="pause-resume">Resume →</button></div>';
    document.getElementById('screen-game').appendChild(overlay);
    document.getElementById('pause-resume').addEventListener('click', _resume);
  }

  function _resume() {
    if (!session || !paused) return;
    paused = false;
    if (session.pausedAt) {
      session.shiftStartTime += Date.now() - session.pausedAt;
      session.pausedAt = null;
    }
    session.activeOrders.forEach(function (order) { startPatienceTimer(order); });
    var overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.remove();
  }

  function _onKey(e) {
    if (!session || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') { paused ? _resume() : _pause(); return; }
    if (paused) return;
    if (session.mode === 'conversation') return;
    if (e.key.length !== 1) return;
    e.preventDefault();

    if (session.activeOrders.length === 0) return;
    var order = session.activeOrders[0];
    var newWS = handleKeypress(order.wordState, e.key);

    if (newWS.lastWrong) {
      session.totalWrong++;
      order.wordState = newWS;
      animateWrongKey();
    } else {
      session.totalCorrect++;
      order.wordState = newWS;
      Keyboard.highlightKey(newWS.complete ? null : newWS.word[newWS.index]);
    }

    if (newWS.complete) {
      _completeOrder(order);
    } else {
      renderOrderArea();
    }
  }

  function _updateSentenceDisplay(typed, sentence) {
    sentence.split('').forEach(function (ch, i) {
      var span = document.getElementById('sc-' + i);
      if (!span) return;
      if (i >= typed.length) {
        span.className = 'sentence-char';
      } else if (typed[i].toLowerCase() === ch.toLowerCase()) {
        span.className = 'sentence-char correct';
      } else {
        span.className = 'sentence-char wrong';
      }
    });
  }

  function _onConvInput() {
    if (!session || session.activeOrders.length === 0) return;
    var order = session.activeOrders[0];
    var inputEl = document.getElementById('conv-input');
    if (!inputEl) return;
    var typed = inputEl.value;
    order.typedValue = typed;
    _updateSentenceDisplay(typed, order.sentence);
    if (isSentenceComplete(typed, order.sentence)) {
      var correct = 0;
      for (var i = 0; i < order.sentence.length; i++) {
        if (typed[i].toLowerCase() === order.sentence[i].toLowerCase()) correct++;
      }
      session.totalCorrect += correct;
      session.totalWrong += (order.sentence.length - correct);
      _completeOrder(order);
    }
  }

  function _completeOrder(order) {
    clearInterval(patienceIntervals[order.customerId]);
    delete patienceIntervals[order.customerId];

    session.ordersCompleted++;
    session.coinsEarnedThisShift += COINS_PER_WORD;
    session.streak++;
    if (session.mode === 'conversation') {
      session.wordsTyped += order.sentence.trim().split(/\s+/).length;
    }

    session.activeOrders = session.activeOrders.filter(function (o) { return o.customerId !== order.customerId; });
    session.customerQueue = session.customerQueue.filter(function (c) { return c.id !== order.customerId; });

    renderGameStats();
    renderCustomerQueue();

    if (session.ordersCompleted >= session.ordersToWin) {
      _endShift(true);
      return;
    }
    refillActiveOrders();
    renderCustomerQueue();
    renderOrderArea();
  }

  function _loseCustomer(order) {
    clearInterval(patienceIntervals[order.customerId]);
    delete patienceIntervals[order.customerId];

    session.lives--;
    session.customersLost++;
    session.streak = 0;
    session.activeOrders = session.activeOrders.filter(function (o) { return o.customerId !== order.customerId; });
    session.customerQueue = session.customerQueue.filter(function (c) { return c.id !== order.customerId; });

    renderGameStats();
    renderCustomerQueue();

    if (session.lives <= 0) {
      _endShift(false);
      return;
    }
    refillActiveOrders();
    renderOrderArea();
  }

  function _endShift(won) {
    document.removeEventListener('keydown', _onKey);
    Object.keys(patienceIntervals).forEach(function (id) { clearInterval(patienceIntervals[id]); });
    patienceIntervals = {};
    paused = false;
    var overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.remove();

    if (onShiftEnd) {
      onShiftEnd({
        won: won,
        mode: session.mode,
        ordersCompleted: session.ordersCompleted,
        ordersToWin: session.ordersToWin,
        accuracy: calculateAccuracy(session.totalCorrect, session.totalWrong),
        wpm: session.mode === 'conversation'
          ? calculateWPM(session.wordsTyped, Date.now() - session.shiftStartTime)
          : calculateWPM(session.ordersCompleted, Date.now() - session.shiftStartTime),
        customersLost: session.customersLost,
        coinsEarned: session.coinsEarnedThisShift,
        phase: session.phase,
        tier: session.tier
      });
    }
    session = null;
  }

  // ── Active order management ───────────────────────────────────────────

  function refillActiveOrders() {
    var config = session.config;
    while (session.activeOrders.length < config.maxConcurrent && session.customerQueue.length > session.activeOrders.length) {
      var customer = session.customerQueue[session.activeOrders.length];
      if (!customer) break;
      var order;
      if (session.mode === 'conversation') {
        var sentence = session.conversationPhase !== 'full'
          ? generatePhrase(session.conversationPhase)
          : pickRandom(session.wordPool);
        order = {
          customerId: customer.id,
          customer: customer,
          sentence: sentence,
          typedValue: '',
          patience: 100
        };
      } else {
        var word = pickRandom(session.wordPool);
        order = {
          customerId: customer.id,
          customer: customer,
          wordState: createWordState(word),
          patience: 100
        };
      }
      session.activeOrders.push(order);
      startPatienceTimer(order);
    }
  }

  function startPatienceTimer(order) {
    var tickMs = 500;
    var decrementPerTick = (tickMs / session.config.patienceMs) * 100;

    patienceIntervals[order.customerId] = setInterval(function () {
      if (!session) return;
      order.patience = Math.max(0, order.patience - decrementPerTick);
      updatePatienceBar(order);
      if (order.patience <= 0) {
        _loseCustomer(order);
      }
    }, tickMs);
  }

  // ── DOM rendering ─────────────────────────────────────────────────────

  function renderGameStats() {
    var elapsed = Date.now() - session.shiftStartTime;
    var wpm = session.mode === 'conversation'
      ? calculateWPM(session.wordsTyped, elapsed)
      : calculateWPM(session.ordersCompleted, elapsed);
    var coins = session.coins + session.coinsEarnedThisShift;

    var wpmEl = document.getElementById('game-wpm');
    if (wpmEl) wpmEl.textContent = '⌨ ' + wpm + ' wpm';
    var coinsEl = document.getElementById('game-coins');
    if (coinsEl) coinsEl.textContent = '🪙 ' + coins;
    var streakEl = document.getElementById('game-streak');
    if (streakEl) streakEl.textContent = '★ ×' + session.streak;
    var livesEl = document.getElementById('game-lives');
    if (livesEl) {
      var hearts = '';
      for (var i = 0; i < 3; i++) {
        hearts += (i < session.lives) ? '💖' : '🤍';
      }
      livesEl.textContent = hearts;
    }

    var regStreak = document.getElementById('reg-streak');
    if (regStreak) regStreak.innerHTML = '×' + session.streak + '<span class="unit">in a row</span>';
    var regOrders = document.getElementById('reg-orders');
    if (regOrders) regOrders.innerHTML = session.ordersCompleted + '<span class="unit">/ ' + session.ordersToWin + '</span>';
    var regLives = document.getElementById('reg-lives');
    if (regLives) regLives.innerHTML = session.lives + '<span class="unit">lives</span>';

    var ribbonEl = document.getElementById('game-phase-info');
    if (ribbonEl) {
      if (session.mode === 'conversation') {
        ribbonEl.textContent = 'Conversation Mode  ·  ' + session.ordersCompleted + ' / ' + session.ordersToWin + ' sentences';
      } else {
        var phaseNames = ['', 'Home Row', '+ G H', '+ E I', '+ R U', '+ T Y', '+ Q W O P', '+ Bottom Row', 'Full Keyboard'];
        ribbonEl.textContent = 'Phase ' + session.phase + ' · ' + (phaseNames[session.phase] || '') + '  ·  ' + session.ordersCompleted + ' / ' + session.ordersToWin + ' orders';
      }
    }
  }

  function renderCustomerQueue() {
    var container = document.getElementById('customer-queue');
    if (!container) return;

    var html = '<div class="queue-label">la fila — up next</div>';
    session.activeOrders.forEach(function (order) {
      html += '<div class="cust-card active" id="cust-' + order.customerId + '">'
        + '<div class="cust-portrait">' + _portrait(order.customer) + '</div>'
        + '<div class="cust-meta">'
        + '<div class="cust-name">' + order.customer.name + '</div>'
        + '<div class="cust-want">→ ' + (session.mode === 'conversation'
            ? order.sentence.slice(0, 22) + '…'
            : order.wordState.word)
        + '</div>'
        + '<div class="patience-track"><div class="patience-fill" id="patience-' + order.customerId + '" style="width:' + order.patience + '%"></div></div>'
        + '</div></div>';
    });

    var nextInLine = session.customerQueue.slice(session.activeOrders.length, session.activeOrders.length + 3);
    nextInLine.forEach(function (c) {
      html += '<div class="cust-card dim">'
        + '<div class="cust-portrait">' + _portrait(c) + '</div>'
        + '<div class="cust-meta"><div class="cust-name">' + c.name + '</div></div>'
        + '</div>';
    });

    container.innerHTML = html;
  }

  function _portrait(customer) {
    if (customer.img) {
      return '<img src="' + customer.img + '" alt="' + customer.name + '" class="portrait-img"'
        + ' onerror="this.parentNode.innerHTML=\'' + customer.emoji + '\'">';
    }
    return customer.emoji;
  }

  var ORDER_QUOTES = [
    "I'd love a scoop of", "Can I get a", "Could I please have",
    "Ooh, I'll take a", "May I have a", "I'd like a"
  ];

  function renderOrderArea() {
    if (session && session.mode === 'conversation') {
      renderConversationOrderArea();
      return;
    }

    var container = document.getElementById('order-area');
    if (!container) return;

    if (session.activeOrders.length === 0) {
      container.innerHTML = '<div style="font-family:var(--display);font-style:italic;font-size:18px;color:var(--ink-faint);padding:20px;text-align:center;">One moment…</div>';
      return;
    }

    var order = session.activeOrders[0];
    var ws = order.wordState;
    var quote = ORDER_QUOTES[Math.floor(ws.word.charCodeAt(0) % ORDER_QUOTES.length)];

    var html = '<div class="order-card">'
      + '<div class="order-header">'
      + '<div class="order-portrait">' + _portrait(order.customer) + '</div>'
      + '<div><div class="order-cust-name">' + order.customer.name + '</div>'
      + '<div class="ticket-quote">"' + quote + ' <span class="word">' + ws.word + '</span>!"</div>'
      + '</div></div>'
      + '<div class="letter-row">';

    ws.word.split('').forEach(function (letter, li) {
      var cls = 'letter-box';
      if (li < ws.index) cls += ' typed';
      else if (li === ws.index) cls += ' current' + (ws.lastWrong ? ' wrong' : '');
      html += '<div class="' + cls + '">' + letter.toUpperCase() + '</div>';
    });

    html += '</div></div>';

    if (session.activeOrders.length > 1) {
      var order2 = session.activeOrders[1];
      var ws2 = order2.wordState;
      html += '<div class="order-card" style="opacity:0.5;margin-top:10px;">'
        + '<div class="order-header"><div class="order-portrait">' + _portrait(order2.customer) + '</div>'
        + '<div><div class="order-cust-name">' + order2.customer.name + '</div></div></div>'
        + '<div class="letter-row">';
      ws2.word.split('').forEach(function (letter, li) {
        var cls = 'letter-box';
        if (li < ws2.index) cls += ' typed';
        html += '<div class="' + cls + '">' + letter.toUpperCase() + '</div>';
      });
      html += '</div></div>';
    }

    container.innerHTML = html;

    if (!ws.complete) {
      Keyboard.highlightKey(ws.word[ws.index]);
    }
  }

  function renderConversationOrderArea() {
    var container = document.getElementById('order-area');
    if (!container) return;

    if (session.activeOrders.length === 0) {
      container.innerHTML = '<div style="font-family:var(--display);font-style:italic;font-size:18px;color:var(--ink-faint);padding:20px;text-align:center;">One moment…</div>';
      return;
    }

    var order = session.activeOrders[0];
    var typed = order.typedValue || '';

    var spansHtml = order.sentence.split('').map(function (ch, i) {
      var cls = 'sentence-char';
      if (i < typed.length) {
        cls += typed[i].toLowerCase() === ch.toLowerCase() ? ' correct' : ' wrong';
      }
      var display = ch === ' ' ? '&nbsp;' : ch;
      return '<span class="' + cls + '" id="sc-' + i + '">' + display + '</span>';
    }).join('');

    var html = '<div class="order-card conversation">'
      + '<div class="order-header">'
      + '<div class="order-portrait">' + _portrait(order.customer) + '</div>'
      + '<div class="order-cust-name">' + order.customer.name + '</div>'
      + '</div>'
      + '<div class="sentence-display">' + spansHtml + '</div>'
      + '<input type="text" id="conv-input" class="conv-input" autocomplete="off" spellcheck="false">'
      + '</div>';

    container.innerHTML = html;

    var inputEl = document.getElementById('conv-input');
    if (inputEl) {
      inputEl.value = typed;
      inputEl.focus();
      inputEl.setSelectionRange(typed.length, typed.length);
      inputEl.addEventListener('input', _onConvInput);
    }
  }

  function updatePatienceBar(order) {
    var bar = document.getElementById('patience-' + order.customerId);
    if (!bar) return;
    bar.style.width = order.patience + '%';
    if (order.patience < 25) bar.className = 'patience-fill danger';
    else if (order.patience < 55) bar.className = 'patience-fill warn';
    else bar.className = 'patience-fill';
  }

  function animateWrongKey() {
    var box = document.querySelector('.letter-box.current');
    if (box) {
      box.classList.add('wrong');
      setTimeout(function () { box.classList.remove('wrong'); }, 350);
    }
  }

  function abortShift() {
    if (!session) return;
    document.removeEventListener('keydown', _onKey);
    Object.keys(patienceIntervals).forEach(function (id) { clearInterval(patienceIntervals[id]); });
    patienceIntervals = {};
    paused = false;
    var overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.remove();
    session = null;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createWordState, handleKeypress, calculateAccuracy, isSentenceComplete, generatePhrase, PHASE_LETTER_LABELS };
  }

  return { startShift, abortShift, getSession, createWordState, handleKeypress, calculateAccuracy, isSentenceComplete, generatePhrase, PHASE_LETTER_LABELS };
})();
