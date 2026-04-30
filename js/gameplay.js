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

  // ── Session config ───────────────────────────────────────────────────

  var TIER_CONFIG = {
    easy:   { ordersToWin: 15, maxConcurrent: 1, patienceMs: 60000 },
    medium: { ordersToWin: 20, maxConcurrent: 2, patienceMs: 40000 },
    hard:   { ordersToWin: 25, maxConcurrent: 3, patienceMs: 25000 }
  };
  var COINS_PER_WORD = 10;
  var MAX_LIVES = 3;

  // ── Session state ────────────────────────────────────────────────────

  var session = null;
  var patienceIntervals = {};
  var onShiftEnd = null;

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
      queue.push({ name: c.name, emoji: c.emoji, id: 'cust_' + i });
    }
    return queue;
  }

  // ── Shift management ─────────────────────────────────────────────────

  function startShift(state, callbacks) {
    onShiftEnd = callbacks.onShiftEnd;
    var config = TIER_CONFIG[state.tier] || TIER_CONFIG.easy;
    var wordPool = getWordPool(state.phase);

    session = {
      phase: state.phase,
      tier: state.tier,
      config: config,
      lives: MAX_LIVES,
      coins: state.coins,
      coinsEarnedThisShift: 0,
      ordersCompleted: 0,
      customersLost: 0,
      totalCorrect: 0,
      totalWrong: 0,
      ordersToWin: config.ordersToWin,
      activeOrders: [],
      customerQueue: [],
      wordPool: wordPool,
      streak: 0,
      callbacks: callbacks
    };

    session.customerQueue = buildCustomerQueue(config.ordersToWin + 5, CUSTOMERS);

    renderGameStats();
    refillActiveOrders();
    renderCustomerQueue();
    renderOrderArea();

    Keyboard.render(state.phase, true);

    document.removeEventListener('keydown', _onKey);
    document.addEventListener('keydown', _onKey);
  }

  function _onKey(e) {
    if (!session || e.metaKey || e.ctrlKey || e.altKey) return;
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

  function _completeOrder(order) {
    clearInterval(patienceIntervals[order.customerId]);
    delete patienceIntervals[order.customerId];

    session.ordersCompleted++;
    session.coinsEarnedThisShift += COINS_PER_WORD;
    session.streak++;

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

    if (onShiftEnd) {
      onShiftEnd({
        won: won,
        ordersCompleted: session.ordersCompleted,
        ordersToWin: session.ordersToWin,
        accuracy: calculateAccuracy(session.totalCorrect, session.totalWrong),
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
      var word = pickRandom(session.wordPool);
      var order = {
        customerId: customer.id,
        customer: customer,
        wordState: createWordState(word),
        patience: 100
      };
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
    var coinsEl = document.getElementById('game-coins');
    if (coinsEl) coinsEl.textContent = '🪙 ' + (session.coins + session.coinsEarnedThisShift);
    var streakEl = document.getElementById('game-streak');
    if (streakEl) streakEl.textContent = '⭐ ' + session.streak;
    var livesEl = document.getElementById('game-lives');
    if (livesEl) livesEl.textContent = '❤️'.repeat(session.lives);
  }

  function renderCustomerQueue() {
    var container = document.getElementById('customer-queue');
    if (!container) return;

    var html = '<div style="font-size:0.72em;color:#aaa;text-transform:uppercase;font-weight:600;letter-spacing:1px;margin-bottom:6px">Queue</div>';
    session.activeOrders.forEach(function (order) {
      html += '<div class="customer-card active" id="cust-' + order.customerId + '">'
        + '<div class="customer-emoji">' + order.customer.emoji + '</div>'
        + '<div class="customer-name">' + order.customer.name + '</div>'
        + '<div class="patience-bar"><div class="patience-fill" id="patience-' + order.customerId + '" style="width:' + order.patience + '%"></div></div>'
        + '</div>';
    });

    var nextInLine = session.customerQueue.slice(session.activeOrders.length, session.activeOrders.length + 2);
    nextInLine.forEach(function (c) {
      html += '<div class="customer-card" style="opacity:0.4">'
        + '<div class="customer-emoji">' + c.emoji + '</div>'
        + '<div class="customer-name">' + c.name + '</div>'
        + '</div>';
    });

    container.innerHTML = html;
  }

  function renderOrderArea() {
    var container = document.getElementById('order-area');
    if (!container) return;

    if (session.activeOrders.length === 0) {
      container.innerHTML = '<div style="color:#aaa;padding:20px">Loading next customer...</div>';
      return;
    }

    var html = '';
    session.activeOrders.forEach(function (order, i) {
      var ws = order.wordState;
      var isPrimary = (i === 0);
      html += '<div class="order-ticket' + (isPrimary ? '' : ' pending') + '">'
        + '<div class="ticket-label">' + order.customer.name + ' wants:</div>'
        + '<div class="letter-boxes">';
      ws.word.split('').forEach(function (letter, li) {
        var cls = 'letter-box';
        if (li < ws.index) cls += ' typed';
        else if (li === ws.index && isPrimary) cls += ' current' + (ws.lastWrong ? ' wrong' : '');
        html += '<div class="' + cls + '">' + letter + '</div>';
      });
      html += '</div></div>';
    });

    container.innerHTML = html;

    if (!session.activeOrders[0].wordState.complete) {
      Keyboard.highlightKey(session.activeOrders[0].wordState.word[session.activeOrders[0].wordState.index]);
    }
  }

  function updatePatienceBar(order) {
    var bar = document.getElementById('patience-' + order.customerId);
    if (!bar) return;
    bar.style.width = order.patience + '%';
    if (order.patience < 25) bar.className = 'patience-fill danger';
    else if (order.patience < 55) bar.className = 'patience-fill warning';
    else bar.className = 'patience-fill';
  }

  function animateWrongKey() {
    var ticket = document.querySelector('.order-ticket .letter-box.current');
    if (ticket) {
      ticket.classList.add('wrong');
      setTimeout(function () { ticket.classList.remove('wrong'); }, 350);
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createWordState, handleKeypress, calculateAccuracy };
  }

  return { startShift, getSession, createWordState, handleKeypress, calculateAccuracy };
})();
