# Phased Conversation Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a phase picker modal to Conversation Mode so players can practice free-typing with only the letters from their current phase instead of the full keyboard.

**Architecture:** When the Conversation button is tapped, a modal appears letting the player pick Phase 1–7 or Full Keyboard. Phased shifts dynamically generate 9-word phrases by shuffling `PHASE_WORDS[phase]` without replacement. Full Keyboard uses the existing `CONVERSATION_SENTENCES` pool unchanged. The last-used phase is persisted via the existing `State.updateState` mechanism.

**Tech Stack:** Vanilla JS (ES5), Jest (tests), CSS (no framework), localStorage via existing State module.

---

### Task 1: Add `conversationPhase` to state schema

**Files:**
- Modify: `js/state.js`
- Modify: `tests/state.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tests/state.test.js`:

```javascript
test('DEFAULT_STATE includes conversationPhase defaulting to full', () => {
  expect(DEFAULT_STATE.conversationPhase).toBe('full');
});

test('updateState handles conversationPhase', () => {
  saveState({ ...DEFAULT_STATE });
  updateState({ conversationPhase: 3 });
  expect(loadState().conversationPhase).toBe(3);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/benjaminkneen/Projects/typing-tutor && npx jest tests/state.test.js --no-coverage
```

Expected: 2 new failures — `conversationPhase` not in DEFAULT_STATE.

- [ ] **Step 3: Add `conversationPhase` to DEFAULT_STATE**

In `js/state.js`, update `DEFAULT_STATE`:

```javascript
var DEFAULT_STATE = {
  name: '',
  phase: 1,
  tier: 'easy',
  coins: 0,
  unlocks: [],
  accuracyHistory: [],
  streak: { lastPlayedDate: null, count: 0 },
  totalWords: 0,
  conversationStats: { totalSentences: 0, bestWPM: 0, accuracyHistory: [] },
  conversationPhase: 'full'
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest tests/state.test.js --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/state.js tests/state.test.js
git commit -m "feat: add conversationPhase to state schema"
```

---

### Task 2: Add `generatePhrase` and `PHASE_LETTER_LABELS` to gameplay.js

**Files:**
- Modify: `js/gameplay.js`
- Modify: `tests/gameplay.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tests/gameplay.test.js`:

```javascript
const { PHASE_WORDS } = require('../data/words');
global.PHASE_WORDS = PHASE_WORDS;
const { generatePhrase, PHASE_LETTER_LABELS } = require('../js/gameplay');

test('generatePhrase returns 9 space-separated words for phase 1', () => {
  const phrase = generatePhrase(1);
  const words = phrase.split(' ');
  expect(words).toHaveLength(9);
});

test('generatePhrase words all come from the phase pool', () => {
  const phrase = generatePhrase(1);
  const words = phrase.split(' ');
  const pool = PHASE_WORDS[1];
  words.forEach(w => expect(pool).toContain(w));
});

test('generatePhrase produces no adjacent duplicate words (phase 1 pool is large enough)', () => {
  for (let i = 0; i < 20; i++) {
    const words = generatePhrase(1).split(' ');
    for (let j = 0; j < words.length - 1; j++) {
      expect(words[j]).not.toBe(words[j + 1]);
    }
  }
});

test('PHASE_LETTER_LABELS has entries for phases 1 through 7', () => {
  [1, 2, 3, 4, 5, 6, 7].forEach(p => {
    expect(PHASE_LETTER_LABELS[p]).toBeDefined();
    expect(typeof PHASE_LETTER_LABELS[p].letters).toBe('string');
    expect(typeof PHASE_LETTER_LABELS[p].label).toBe('string');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest tests/gameplay.test.js --no-coverage
```

Expected: 4 new failures — `generatePhrase` and `PHASE_LETTER_LABELS` not yet exported.

- [ ] **Step 3: Add `PHASE_LETTER_LABELS` and `generatePhrase` to gameplay.js**

In `js/gameplay.js`, add these after the `CONVERSATION_CONFIG` constant (around line 52):

```javascript
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
```

- [ ] **Step 4: Export `generatePhrase` and `PHASE_LETTER_LABELS`**

At the bottom of `js/gameplay.js`, update both the `module.exports` line and the `return` statement:

```javascript
// module.exports line (for tests):
module.exports = { createWordState, handleKeypress, calculateAccuracy, isSentenceComplete, generatePhrase, PHASE_LETTER_LABELS };

// return statement (for browser):
return { startShift, abortShift, getSession, createWordState, handleKeypress, calculateAccuracy, isSentenceComplete, generatePhrase, PHASE_LETTER_LABELS };
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest tests/gameplay.test.js --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add js/gameplay.js tests/gameplay.test.js
git commit -m "feat: add generatePhrase and PHASE_LETTER_LABELS to gameplay"
```

---

### Task 3: Wire `conversationPhase` through `Gameplay.startShift` and `refillActiveOrders`

**Files:**
- Modify: `js/gameplay.js`

No new tests needed — this wires internal session state. The modal integration in Task 6 provides end-to-end coverage.

- [ ] **Step 1: Add `conversationPhase` to the session object in `startShift`**

In `js/gameplay.js`, inside the `startShift` function, add `conversationPhase` to the `session` object initialisation (around line 88, after `mode: state.mode || 'word'`):

```javascript
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
```

- [ ] **Step 2: Update `refillActiveOrders` to use `generatePhrase` for phased shifts**

In `js/gameplay.js`, update the `conversation` branch of `refillActiveOrders` (around line 300):

```javascript
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
}
```

- [ ] **Step 3: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add js/gameplay.js
git commit -m "feat: wire conversationPhase through session and refillActiveOrders"
```

---

### Task 4: Add modal HTML to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the modal markup**

Find the closing `</body>` tag in `index.html` and insert the following immediately before it:

```html
<!-- Conversation Phase Picker Modal -->
<div id="conversation-phase-modal" class="modal-overlay" style="display:none;">
  <div class="modal-box">
    <div class="modal-title">💬 Conversation Mode</div>
    <div class="modal-subtitle">Choose your letter set</div>
    <div class="phase-picker-grid">
      <button class="phase-card" data-phase="1">
        <span class="phase-card__num">Phase 1</span>
        <span class="phase-card__letters">a s d f j k l</span>
        <span class="phase-card__label">home row</span>
      </button>
      <button class="phase-card" data-phase="2">
        <span class="phase-card__num">Phase 2</span>
        <span class="phase-card__letters">+ g h</span>
        <span class="phase-card__label">left stretch</span>
      </button>
      <button class="phase-card" data-phase="3">
        <span class="phase-card__num">Phase 3</span>
        <span class="phase-card__letters">+ i e</span>
        <span class="phase-card__label">top row vowels</span>
      </button>
      <button class="phase-card" data-phase="4">
        <span class="phase-card__num">Phase 4</span>
        <span class="phase-card__letters">+ u r</span>
        <span class="phase-card__label">right vowel + reach</span>
      </button>
      <button class="phase-card" data-phase="5">
        <span class="phase-card__num">Phase 5</span>
        <span class="phase-card__letters">+ t y</span>
        <span class="phase-card__label">top row center</span>
      </button>
      <button class="phase-card" data-phase="6">
        <span class="phase-card__num">Phase 6</span>
        <span class="phase-card__letters">+ w o p</span>
        <span class="phase-card__label">outer ring</span>
      </button>
      <button class="phase-card" data-phase="7">
        <span class="phase-card__num">Phase 7</span>
        <span class="phase-card__letters">+ n b m c z v</span>
        <span class="phase-card__label">bottom row</span>
      </button>
      <button class="phase-card phase-card--full" data-phase="full">
        <span class="phase-card__num">⌨️ Full</span>
        <span class="phase-card__letters">all keys</span>
        <span class="phase-card__label">real sentences</span>
      </button>
    </div>
    <button id="conversation-phase-cancel" class="modal-cancel">Cancel</button>
  </div>
</div>
```

- [ ] **Step 2: Verify HTML is valid — open the game in a browser**

```bash
open /Users/benjaminkneen/Projects/typing-tutor/index.html
```

The modal should not be visible (it's `display:none`). The home screen should look unchanged.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add conversation phase picker modal HTML"
```

---

### Task 5: Add modal CSS to style.css

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append modal styles to style.css**

Add the following to the end of `style.css`:

```css
/* ── Conversation Phase Picker Modal ─────────────────────────────── */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-box {
  background: #1a1a2e;
  border: 1px solid #3a3a6a;
  border-radius: 16px;
  padding: 24px;
  width: min(360px, 92vw);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.modal-title {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #e0e0ff;
  margin-bottom: 4px;
}

.modal-subtitle {
  text-align: center;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 16px;
}

.phase-picker-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.phase-card {
  background: #1e1e3f;
  border: 1px solid #3a3a6a;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: border-color 0.15s;
}

.phase-card:hover {
  border-color: #7c3aed;
}

.phase-card--active {
  border-color: #a78bfa;
  background: #261e4a;
}

.phase-card--full {
  background: #1a0f2e;
  border-color: #5a3a7a;
}

.phase-card--full:hover {
  border-color: #9333ea;
}

.phase-card__num {
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: bold;
  color: #a78bfa;
}

.phase-card--full .phase-card__num {
  color: #c084fc;
}

.phase-card__letters {
  font-family: monospace;
  font-size: 0.7rem;
  color: #aaa;
  letter-spacing: 1px;
}

.phase-card__label {
  font-size: 0.65rem;
  color: #666;
}

.modal-cancel {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 6px;
  text-align: center;
}

.modal-cancel:hover {
  color: #aaa;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "feat: add conversation phase picker modal CSS"
```

---

### Task 6: Wire modal into main.js

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Add `showConversationPhasePicker` function**

In `js/main.js`, add the following function before `startConversationShift`:

```javascript
function showConversationPhasePicker(onSelect) {
  var modal = document.getElementById('conversation-phase-modal');
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

  function handleCancel() {
    cleanup();
  }

  function cleanup() {
    modal.style.display = 'none';
    modal.querySelector('.phase-picker-grid').removeEventListener('click', handleCardClick);
    document.getElementById('conversation-phase-cancel').removeEventListener('click', handleCancel);
  }

  modal.querySelector('.phase-picker-grid').addEventListener('click', handleCardClick);
  document.getElementById('conversation-phase-cancel').addEventListener('click', handleCancel);
}
```

- [ ] **Step 2: Update `startConversationShift` to show the modal**

Replace the existing `startConversationShift` function:

```javascript
function startConversationShift() {
  showConversationPhasePicker(function (conversationPhase) {
    State.updateState({ conversationPhase: conversationPhase });
    startShift(null, null, 'conversation', conversationPhase);
  });
}
```

- [ ] **Step 3: Update `startShift` signature to accept `conversationPhase`**

Replace the `startShift` function signature and `playState` construction (lines 32–44):

```javascript
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
  // ...rest of the onShiftEnd callback block is unchanged from the original...
```

- [ ] **Step 4: Open the game in a browser and test manually**

```bash
open /Users/benjaminkneen/Projects/typing-tutor/index.html
```

Verify:
1. Tapping "💬 Conversation" shows the modal with 8 cards (Ph 1–7 + Full Keyboard)
2. Tapping a phase card closes the modal and starts a shift
3. Phased shifts (Ph 1–7) show 9 word strings from the correct phase pool (e.g., Ph 1 produces "ask dad fads..." style phrases)
4. Full Keyboard starts with real natural-language sentences (unchanged behavior)
5. Opening the modal again shows the last-used phase highlighted
6. Cancel closes the modal without starting a shift

- [ ] **Step 5: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add js/main.js
git commit -m "feat: wire conversation phase picker modal into main.js"
```
