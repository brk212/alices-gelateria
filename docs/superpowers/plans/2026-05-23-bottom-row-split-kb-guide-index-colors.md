# Bottom Row Sub-levels, Conversation KB Guide, Index Finger Colors — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the bottom row into three progressive phases (v+m → b+n → full), add a toggleable keyboard guide to conversation mode, and distinguish left vs right index fingers with slightly different colors.

**Architecture:** Three independent feature tracks — all changes are additive or small replacements in existing data objects, no new files needed. Feature 1 (phase split) touches `keyboard.js`, `gameplay.js`, `data/words.js`, and `index.html`. Feature 2 (kb toggle) extends `keyboard.js` and `gameplay.js`. Feature 3 (index colors) touches `keyboard.js` and `style.css`.

**Tech Stack:** Vanilla JS (IIFE modules), HTML, CSS — no build step, no test framework.

---

## File Map

| File | Changes |
|------|---------|
| `js/keyboard.js` | PHASE_KEYS renumbered, KEY_FINGER index→index-l/index-r, FINGER_DISPLAY map added, renderToggle() added, render() handles 'full' phase |
| `js/gameplay.js` | PHASE_LETTER_LABELS updated for new phase numbers, startShift() conversation branch calls Keyboard.render + renderToggle |
| `data/words.js` | PHASE_WORDS phases 7/8 replaced with new pools, old 7→9, old 8→10 |
| `index.html` | Conversation phase picker modal: update phase 7 card, add phase 8 + 9 cards |
| `style.css` | Replace `--f-index` with `--f-index-l` and `--f-index-r`, update key rules |

---

## Task 1: Left/right index finger color split

**Files:**
- Modify: `js/keyboard.js:2-13` (KEY_FINGER) and `js/keyboard.js:80-90` (highlightKey)
- Modify: `style.css:19` and `style.css:1040`

- [ ] **Step 1: Update KEY_FINGER in keyboard.js**

Replace lines 2–13:

```javascript
  var KEY_FINGER = {
    'q':'pinky','a':'pinky','z':'pinky',
    'w':'ring', 's':'ring', 'x':'ring',
    'e':'middle','d':'middle','c':'middle',
    'r':'index-l','f':'index-l','v':'index-l',
    't':'index-l','g':'index-l','b':'index-l',
    'y':'index-r','h':'index-r','n':'index-r',
    'u':'index-r','j':'index-r','m':'index-r',
    'i':'middle','k':'middle',',':'middle',
    'o':'ring',  'l':'ring', '.':'ring',
    'p':'pinky', ';':'pinky','/':'pinky'
  };
```

- [ ] **Step 2: Add FINGER_DISPLAY map just after KEY_FINGER**

Insert after the closing `};` of KEY_FINGER (before PHASE_KEYS):

```javascript
  var FINGER_DISPLAY = {
    'pinky':   'pinky',
    'ring':    'ring',
    'middle':  'middle',
    'index-l': 'left index',
    'index-r': 'right index'
  };
```

- [ ] **Step 3: Update highlightKey to use FINGER_DISPLAY**

In `highlightKey()`, replace:
```javascript
    var fingerLabel = finger ? finger + ' finger' : '';
```
with:
```javascript
    var fingerLabel = finger ? (FINGER_DISPLAY[finger] || finger) + ' finger' : '';
```

- [ ] **Step 4: Update style.css — replace --f-index variable**

Replace line 19:
```css
  --f-index:  #ffd23a;
```
with:
```css
  --f-index-l: #ffd23a;
  --f-index-r: #ffb347;
```

- [ ] **Step 5: Update style.css — replace key color rule**

Replace line 1040:
```css
.key.f-index  { background: var(--f-index);  color: var(--ink); }
```
with:
```css
.key.f-index-l { background: var(--f-index-l); color: var(--ink); }
.key.f-index-r { background: var(--f-index-r); color: var(--ink); }
```

- [ ] **Step 6: Verify manually**

Open `index.html` in a browser. Start any level. In the keyboard guide, confirm:
- f, g, r, t keys are warm yellow (#ffd23a)
- j, h, y, u keys are slightly amber (#ffb347)
- All other finger colors unchanged (pinky=pink, ring=blue, middle=mint)

- [ ] **Step 7: Commit**

```bash
git add js/keyboard.js style.css
git commit -m "feat: split index finger colors into left (yellow) and right (amber)"
```

---

## Task 2: Renumber PHASE_KEYS for bottom row split

**Files:**
- Modify: `js/keyboard.js:15-24` (PHASE_KEYS)

- [ ] **Step 1: Replace PHASE_KEYS block**

Replace lines 15–24 entirely:

```javascript
  var PHASE_KEYS = {
    1: ['a','s','d','f','j','k','l',';'],
    2: ['a','s','d','f','g','h','j','k','l',';'],
    3: ['a','s','d','e','f','g','h','i','j','k','l',';'],
    4: ['a','s','d','e','f','g','h','i','j','k','l','r','u',';'],
    5: ['a','s','d','e','f','g','h','i','j','k','l','r','t','u','y',';'],
    6: ['a','d','e','f','g','h','i','j','k','l','o','p','q','r','s','t','u','w','y',';'],
    7: ['a','d','e','f','g','h','i','j','k','l','m','o','p','q','r','s','t','u','v','w','y',';'],
    8: ['a','b','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','y',';'],
    9: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',';',',','.'],
    10: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',';',',','.','/']
  };
```

- [ ] **Step 2: Add 'full' phase handling to render()**

In `render()`, replace:
```javascript
    var unlocked = PHASE_KEYS[currentPhase] || PHASE_KEYS[1];
```
with:
```javascript
    var unlocked = currentPhase === 'full'
      ? ROWS.reduce(function(a, r) { return a.concat(r); }, [])
      : (PHASE_KEYS[currentPhase] || PHASE_KEYS[1]);
```

- [ ] **Step 3: Verify manually**

Open the app. Navigate to Level Select. Confirm phases 1–6 keyboard guides are unchanged. Start phase 7 — keyboard should show v and m unlocked (plus all phases 1–6 keys). Phase 7 keys NOT yet unlocked: b, n, c, x, z.

- [ ] **Step 4: Commit**

```bash
git add js/keyboard.js
git commit -m "feat: split bottom row into phases 7 (v/m), 8 (b/n), 9 (full bottom row)"
```

---

## Task 3: Update PHASE_LETTER_LABELS in gameplay.js

**Files:**
- Modify: `js/gameplay.js:53-61` (PHASE_LETTER_LABELS)

- [ ] **Step 1: Replace PHASE_LETTER_LABELS block**

Replace lines 53–61:

```javascript
  var PHASE_LETTER_LABELS = {
    1: { letters: 'a s d f j k l', label: 'home row' },
    2: { letters: '+ g h',         label: 'left stretch' },
    3: { letters: '+ i e',         label: 'top row vowels' },
    4: { letters: '+ u r',         label: 'right vowel + reach' },
    5: { letters: '+ t y',         label: 'top row center' },
    6: { letters: '+ w o p',       label: 'outer ring' },
    7: { letters: '+ v m',         label: 'index fingers' },
    8: { letters: '+ b n',         label: 'outer index' },
    9: { letters: '+ z x c , .',   label: 'full bottom row' }
  };
```

- [ ] **Step 2: Verify manually**

In the app, open Level Select. Check that phases 7, 8, 9 show correct letter labels (v m / b n / z x c , .) and correct descriptive labels below.

- [ ] **Step 3: Commit**

```bash
git add js/gameplay.js
git commit -m "feat: add phase labels for phases 7/8/9 (bottom row sub-levels)"
```

---

## Task 4: Replace PHASE_WORDS with new pools

**Files:**
- Modify: `data/words.js:1-33` (PHASE_WORDS)

- [ ] **Step 1: Replace PHASE_WORDS**

Replace the entire PHASE_WORDS object (lines 1–33):

```javascript
var PHASE_WORDS = {
  1: ['ask','sad','lad','dad','fall','all','add','fad','lass',
      'flask','flak','salad','falls','asks','alas','dads','lads','fads','adds'],
  2: ['flag','glad','half','flash','slash','lash','gash','hash',
      'dash','had','has','lag','sag','gal','flags','gals','hag',
      'shag','glads','halfs','jags','lags'],
  3: ['slide','files','like','side','hide','life','field','held',
      'self','else','flesh','shelf','deal','heal','idea','ideal',
      'deals','heals','eagle','shield','diesel','liked','ailed',
      'aside','sailed','failed','aisle','hiked'],
  4: ['sugar','fluid','rug','fur','sure','ride','fire','hire',
      'lure','rule','rude','read','real','red','risk','disk',
      'fudge','judge','surge','dusk','ruled','girls','rusk',
      'dried','urged','ruler','laser','dagger','eager','ideas',
      'fried','rides','lures','fires'],
  5: ['tasty','trust','dusty','rusty','study','salty','fruit',
      'flurry','stuff','drift','shift','tidy','dairy','daily',
      'fairy','truly','ready','dirty','thrill','thirst','rustle',
      'gust','gusts','drills','frills','thrust','guilty','grits',
      'fifty','tidily','starlight'],
  6: ['waffle','frosted','drip','pops','soft','swirl','twist',
      'whisk','frost','sport','world','words','tower','power',
      'flower','trowel','stoop','troop','droop','worth',
      'swirls','waffles','trophy','strips','prowl','afford',
      'effort','toffee','worthy','upward','growth'],
  7: ['move','movie','improve','olive','valve','glove','drive',
      'revive','vivid','motive','warm','swim','trim','strum',
      'moody','slime','mauve','motif','ivory','swarm','yam',
      'item','stove','ovum','vim'],
  8: ['blend','brown','born','bond','brand','grin','burn','bundle',
      'border','wander','robin','narrow','bridge','binder','render',
      'blind','drawn','inform','urban','modern','broken','robe',
      'mend','bend','turban'],
  9: ['sprinkle','vanilla','caramel','rainbow','coconut','blizzard',
      'freezing','amazing','brownie','crumble','marshmallow','whipped',
      'cinnamon','banana','delicious','butterscotch','chocolate',
      'sundae','bubbly','vibrant','carnival','zesty'],
  10: ['flavor','gelato','sorbet','parfait','milkshake','toppings',
       'delightful','wonderful','exciting','together','favorite',
       'birthday','alphabet','keyboard','practice','perfect']
};
```

- [ ] **Step 2: Verify word pools are letter-correct**

For phases 7 and 8, manually spot-check that no word uses letters outside its available set:
- Phase 7 forbidden: b, n, c, x, z (only v, m are new; phases 1–6 letters are allowed)
  - Check: 'move' ✓, 'ivory' ✓, 'improve' ✓
- Phase 8 forbidden: c, x, z (b and n are now allowed)
  - Check: 'blend' ✓, 'broken' ✓, 'drawn' ✓

- [ ] **Step 3: Verify in app**

Start a phase 7 shift. Confirm words only use letters visible (unlocked) in the keyboard guide.

- [ ] **Step 4: Commit**

```bash
git add data/words.js
git commit -m "feat: split phase 7 word pool — phases 7 (v/m words) and 8 (b/n words)"
```

---

## Task 5: Update conversation phase picker modal

**Files:**
- Modify: `index.html:337-356` (conversation-phase-modal phase 7 card + new 8/9 cards)

- [ ] **Step 1: Update the phase 7 picker card**

Replace lines 337–346 (the existing phase 7 card):

```html
        <button class="picker-card" data-phase="7">
          <div class="picker-card__header">
            <span class="picker-card__badge">7</span>
            <span class="picker-card__name">Phase 7</span>
          </div>
          <div class="picker-card__glyphs">
            <span class="plus">+</span><span class="glyph">v</span><span class="glyph">m</span>
          </div>
          <span class="picker-card__label">index fingers</span>
        </button>
```

- [ ] **Step 2: Add phase 8 and 9 cards**

Insert these two cards immediately after the updated phase 7 card (before the "Full Keys" card at line 347):

```html
        <button class="picker-card" data-phase="8">
          <div class="picker-card__header">
            <span class="picker-card__badge">8</span>
            <span class="picker-card__name">Phase 8</span>
          </div>
          <div class="picker-card__glyphs">
            <span class="plus">+</span><span class="glyph">b</span><span class="glyph">n</span>
          </div>
          <span class="picker-card__label">outer index</span>
        </button>
        <button class="picker-card" data-phase="9">
          <div class="picker-card__header">
            <span class="picker-card__badge">9</span>
            <span class="picker-card__name">Phase 9</span>
          </div>
          <div class="picker-card__glyphs">
            <span class="plus">+</span><span class="glyph">z</span><span class="glyph">x</span><span class="glyph">c</span>
          </div>
          <span class="picker-card__label">full bottom row</span>
        </button>
```

- [ ] **Step 3: Verify manually**

Open the app. Click Conversation Mode. Confirm the phase picker shows phases 1–9 plus Full Keys. Confirm phase 7 card now shows v/m, phase 8 shows b/n, phase 9 shows z/x/c.

Select phase 7 and play — confirm only v/m words appear.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add phases 8 and 9 to conversation phase picker"
```

---

## Task 5b: Update PHASE_LETTER_LABELS test

**Files:**
- Modify: `tests/gameplay.test.js:104-110`

- [ ] **Step 1: Update phase range in test**

Replace lines 104–110:
```javascript
test('PHASE_LETTER_LABELS has entries for phases 1 through 9', () => {
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
    expect(PHASE_LETTER_LABELS[p]).toBeDefined();
    expect(typeof PHASE_LETTER_LABELS[p].letters).toBe('string');
    expect(typeof PHASE_LETTER_LABELS[p].label).toBe('string');
  });
});
```

- [ ] **Step 2: Run tests and confirm they pass**

```bash
npx jest tests/gameplay.test.js
```

Expected: all tests pass (PHASE_LETTER_LABELS now has phases 1–9).

- [ ] **Step 3: Commit**

```bash
git add tests/gameplay.test.js
git commit -m "test: update PHASE_LETTER_LABELS test to cover phases 1-9"
```

---

## Task 6: Keyboard guide toggle in conversation mode

**Files:**
- Modify: `js/keyboard.js:92-98` (add renderToggle, update exports)
- Modify: `js/gameplay.js:144-149` (conversation branch in startShift)

- [ ] **Step 1: Add renderToggle() to keyboard.js**

Insert the following function after `getFingerForKey()` (after line 95, before the `return` statement):

```javascript
  function renderToggle() {
    var head = document.querySelector('#keyboard-hint .counter-head');
    if (!head || head.querySelector('.kb-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'kb-toggle';
    btn.textContent = '▼';
    btn.title = 'Toggle keyboard guide';

    btn.addEventListener('click', function() {
      var kb = document.querySelector('#keyboard-hint .kb');
      var hint = document.getElementById('kb-next-hint');
      var isVisible = kb && kb.style.display !== 'none';
      if (kb) kb.style.display = isVisible ? 'none' : '';
      if (hint) hint.style.display = isVisible ? 'none' : '';
      btn.textContent = isVisible ? '▶' : '▼';
    });

    head.appendChild(btn);
  }
```

- [ ] **Step 2: Add renderToggle to the module exports**

Replace line 97:
```javascript
  return { render, highlightKey, getFingerForKey, PHASE_KEYS };
```
with:
```javascript
  return { render, highlightKey, getFingerForKey, renderToggle, PHASE_KEYS };
```

- [ ] **Step 3: Update startShift() conversation branch in gameplay.js**

Replace lines 144–149:
```javascript
    if (session.mode !== 'conversation') {
      Keyboard.render(state.phase, true);
    } else {
      var kbEl = document.getElementById('keyboard-hint');
      if (kbEl) kbEl.innerHTML = '';
    }
```
with:
```javascript
    if (session.mode !== 'conversation') {
      Keyboard.render(state.phase);
    } else {
      var convPhase = session.conversationPhase === 'full' ? 'full' : session.conversationPhase;
      Keyboard.render(convPhase);
      Keyboard.renderToggle();
    }
```

- [ ] **Step 4: Style the toggle button in style.css**

Add the following after the `.key.next` block (around line 1048):

```css
.kb-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  color: var(--ink-faint);
  padding: 2px 4px;
  margin-left: auto;
  line-height: 1;
}
.kb-toggle:hover { color: var(--ink); }
```

- [ ] **Step 5: Verify manually**

Open the app. Start a Conversation Mode shift. Confirm:
- Keyboard guide is visible by default
- The ▼ button appears in the keyboard widget header
- Clicking ▼ collapses the keyboard, button changes to ▶
- Clicking ▶ expands it again
- Selecting "Full Keys" phase shows all keys unlocked

- [ ] **Step 6: Commit**

```bash
git add js/keyboard.js js/gameplay.js style.css
git commit -m "feat: add toggleable keyboard guide to conversation mode (visible by default)"
```
