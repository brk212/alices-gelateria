# Shop, Progress & Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three independent changes to Alice's Gelateria: English order quotes, WPM bar chart on progress screen, and shop redesign with tabs + refreshed catalog.

**Architecture:** Vanilla JS SPA — all modules are IIFEs in separate script tags. No build step; changes take effect on browser refresh. DOM rendering is done by direct `innerHTML` assignment inside each module's `render()` function.

**Tech Stack:** Vanilla JS (ES5), HTML5, CSS custom properties, localStorage for state.

---

## File Map

| File | Change |
|------|--------|
| `js/gameplay.js` | Replace `ITALIAN_QUOTES` array + remove `, per favore!` suffix |
| `js/progress.js` | Switch bar chart from accuracy to WPM, relative scaling + coloring |
| `style.css` | Add `.prog-wpm-best`, `.up-body`, `.up-tabs`, `.up-tab`, `.up-tag`; strip padding/bg from `.up-grid` |
| `data/upgrades.js` | Full catalog replacement (12 new items) |
| `js/shop.js` | Add `activeTab` state, tab render, re-render on click, updated card template |
| `index.html` | Change `class="up-grid"` → `class="up-body"` on `#upgrades-list` |

---

## Task 1: English Order Quotes

**Files:**
- Modify: `js/gameplay.js:334-337` (quotes array)
- Modify: `js/gameplay.js:362` (ticket quote template)

- [ ] **Step 1: Replace the quotes array**

In `js/gameplay.js`, find this block (around line 334):
```js
var ITALIAN_QUOTES = [
  'Vorrei un cono di', 'Per favore, posso avere', 'Buongiorno! Vorrei',
  'Un gelato di', 'Mi dà un', 'Vorrei assaggiare il'
];
```
Replace with:
```js
var ORDER_QUOTES = [
  "I'd love a scoop of", "Can I get a", "Could I please have",
  "Ooh, I'll take a", "May I have a", "I'd like a"
];
```

- [ ] **Step 2: Update the variable reference in renderOrderArea**

In `js/gameplay.js`, find the `renderOrderArea` function. Locate this line (around line 350):
```js
var quote = ITALIAN_QUOTES[Math.floor(ws.word.charCodeAt(0) % ITALIAN_QUOTES.length)];
```
Replace with:
```js
var quote = ORDER_QUOTES[Math.floor(ws.word.charCodeAt(0) % ORDER_QUOTES.length)];
```

- [ ] **Step 3: Remove the Italian suffix from the ticket template**

In the same function, find (around line 362):
```js
+ '<div class="ticket-quote">"' + quote + ' <span class="word">' + ws.word + '</span>, per favore!"</div>'
```
Replace with:
```js
+ '<div class="ticket-quote">"' + quote + ' <span class="word">' + ws.word + '</span>!"</div>'
```

- [ ] **Step 4: Manual verify**

Open `index.html` in a browser. Start a shift. The active order card should show an English request like `"I'd love a scoop of WORD!"` — no Italian phrases, no "per favore".

- [ ] **Step 5: Commit**

```bash
git add js/gameplay.js
git commit -m "feat: switch order quotes from Italian to English"
```

---

## Task 2: WPM Bar Chart

**Files:**
- Modify: `js/progress.js:49-60` (bar chart section)
- Modify: `style.css` (add `.prog-wpm-best` rule after `.acc-bar`)

- [ ] **Step 1: Replace the bar chart block in progress.js**

In `js/progress.js`, find and replace this entire block (lines 49–60):
```js
if (state.accuracyHistory.length > 0) {
  html += '<div class="prog-card">'
    + '<div class="prog-card-title">Recent Accuracy</div>'
    + '<div class="accuracy-bars">';
  var last = state.accuracyHistory.slice(-20);
  last.forEach(function (entry) {
    var h = Math.round(entry.accuracy * 76);
    var bg = entry.accuracy >= 0.85 ? 'var(--mint-deep)' : entry.accuracy >= 0.7 ? 'var(--yellow-deep)' : 'var(--pink-deep)';
    html += '<div class="acc-bar" style="height:' + h + 'px;background:' + bg + '" title="' + Math.round(entry.accuracy * 100) + '%"></div>';
  });
  html += '</div></div>';
}
```

Replace with:
```js
if (state.accuracyHistory.length > 0) {
  var last = state.accuracyHistory.slice(-20);
  var maxWpm = Math.max.apply(null, last.map(function (e) { return e.wpm || 0; }));
  html += '<div class="prog-card">'
    + '<div class="prog-card-title">Recent Speed (WPM)</div>'
    + '<div class="accuracy-bars">';
  last.forEach(function (entry) {
    var wpm = entry.wpm || 0;
    var h = maxWpm > 0 ? Math.round((wpm / maxWpm) * 76) : 4;
    var bg = (maxWpm > 0 && wpm >= maxWpm * 0.9) ? '#ffd23a'
           : (maxWpm > 0 && wpm >= maxWpm * 0.5) ? 'var(--mint-deep)'
           : 'var(--ink-faint)';
    var label = wpm + ' wpm' + (maxWpm > 0 && wpm === maxWpm ? ' ★ best' : '');
    html += '<div class="acc-bar" style="height:' + h + 'px;background:' + bg + '" title="' + label + '"></div>';
  });
  html += '</div>'
    + (maxWpm > 0 ? '<div class="prog-wpm-best">★ ' + maxWpm + ' wpm personal best</div>' : '')
    + '</div>';
}
```

- [ ] **Step 2: Add the .prog-wpm-best CSS rule**

In `style.css`, find the `.acc-bar` rule (around line 1337). After the closing `}` of `.acc-bar`, add:
```css
.prog-wpm-best {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-faint);
  text-align: right;
  margin-top: 4px;
}
```

- [ ] **Step 3: Manual verify**

Open the Progress screen. The bar chart should be titled "Recent Speed (WPM)". Bars should vary in height relative to each other (gold for sessions near your best, mint for moderate, faint for low). Hovering a bar shows the WPM value. A "★ N wpm personal best" label appears below the chart.

If `accuracyHistory` is empty (new player), the bar chart section is hidden — this is correct existing behavior.

- [ ] **Step 4: Commit**

```bash
git add js/progress.js style.css
git commit -m "feat: replace accuracy chart with WPM chart on progress screen"
```

---

## Task 3: Upgrade Catalog Refresh

**Files:**
- Modify: `data/upgrades.js` (full replacement of catalog array)

- [ ] **Step 1: Replace UPGRADE_CATALOG**

In `data/upgrades.js`, replace the entire `UPGRADE_CATALOG` array (lines 1–14) with:
```js
var UPGRADE_CATALOG = [
  // Flavors
  { id: 'flavor-fragola',       name: 'Fragola',              cost: 80,  type: 'flavor',   description: 'Fresh strawberry, bright and summery.' },
  { id: 'flavor-limone',        name: 'Limone Sfusato',       cost: 90,  type: 'flavor',   description: 'Tart Amalfi lemon sorbet, no cream.' },
  { id: 'flavor-caramello',     name: 'Caramello Salato',     cost: 120, type: 'flavor',   description: 'Sea-salt caramel — sweet and salty perfection.' },
  { id: 'flavor-stracciatella', name: 'Stracciatella',        cost: 140, type: 'flavor',   description: 'Creamy fior di latte with dark chocolate shards.' },
  { id: 'flavor-pistacchio',    name: 'Pistacchio di Bronte', cost: 180, type: 'flavor',   description: 'Rich Sicilian pistachio, slightly sweet.' },
  // Decor
  { id: 'decor-bell',           name: "Campanella d'Ottone",  cost: 90,  type: 'decor',    description: 'A brass door bell — ding!' },
  { id: 'decor-sign',           name: 'Insegna Rosa',         cost: 110, type: 'decor',    description: 'Pastel pink hand-painted shop sign.' },
  { id: 'decor-counter',        name: 'Carrara Counter',      cost: 180, type: 'decor',    description: 'Marble counter — cool white with grey veins.' },
  { id: 'decor-wallpaper',      name: 'Notte Stellata',       cost: 200, type: 'decor',    description: 'Deep blue starry-night wall tiles.' },
  // Customers
  { id: 'cust-cat',             name: 'Macchia the Cat',      cost: 110, type: 'customer', description: 'A tuxedo cat who always orders two scoops.' },
  { id: 'cust-nonna',           name: 'Nonna Concetta',       cost: 130, type: 'customer', description: 'Local legend, has opinions about gelato.' },
  { id: 'cust-dog',             name: 'Bruno il Cane',        cost: 160, type: 'customer', description: 'A golden retriever, always cheerful.' }
];
```

Keep the `module.exports` block at the bottom unchanged.

- [ ] **Step 2: Manual verify**

Open the Shop screen. All 12 items should be visible (until tabs are added in Task 4, all render in a flat grid). New names, descriptions, and prices should be correct.

- [ ] **Step 3: Commit**

```bash
git add data/upgrades.js
git commit -m "feat: refresh upgrade catalog with Italian-named items"
```

---

## Task 4: Shop Tab UI

**Files:**
- Modify: `index.html:224` (change `up-grid` → `up-body` on `#upgrades-list`)
- Modify: `style.css` (add `.up-body`, `.up-tabs`, `.up-tab`, `.up-tag`; strip padding/bg from `.up-grid`)
- Modify: `js/shop.js` (full rewrite of module)

- [ ] **Step 1: Update index.html**

In `index.html`, find (around line 224):
```html
<div class="up-grid" id="upgrades-list"></div>
```
Replace with:
```html
<div class="up-body" id="upgrades-list"></div>
```

- [ ] **Step 2: Update .up-grid CSS and add new rules**

In `style.css`, find the `.up-grid` rule (around line 1144):
```css
.up-grid {
  padding: 24px 28px 32px;
  background: radial-gradient(circle at 10% 10%, rgba(255,210,58,0.2) 0 80px, transparent 100px),
              radial-gradient(circle at 90% 90%, rgba(155,224,200,0.25) 0 80px, transparent 100px),
              var(--pink);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```
Replace with:
```css
.up-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

Then, directly after the closing `}` of `.up-buy-btn.owned-tag` (around line 1240), add:
```css
.up-body {
  padding: 24px 28px 32px;
  background: radial-gradient(circle at 10% 10%, rgba(255,210,58,0.2) 0 80px, transparent 100px),
              radial-gradient(circle at 90% 90%, rgba(155,224,200,0.25) 0 80px, transparent 100px),
              var(--pink);
}

.up-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--ink-faint);
}

.up-tab {
  background: none;
  border: none;
  border-bottom: 4px solid transparent;
  padding: 8px 16px;
  font-family: var(--mono);
  font-size: 13px;
  cursor: pointer;
  margin-bottom: -2px;
  color: var(--ink-faint);
  transition: color 0.1s;
}

.up-tab.active {
  border-bottom-color: var(--pink-deep);
  color: var(--ink);
  font-weight: 700;
}

.up-tab .count {
  font-size: 11px;
  background: var(--ink-faint);
  color: var(--cream);
  border-radius: 99px;
  padding: 1px 6px;
  margin-left: 4px;
}

.up-tab.active .count {
  background: var(--pink-deep);
}

.up-tag {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
  margin-bottom: 3px;
}
```

- [ ] **Step 3: Rewrite shop.js**

Replace the entire contents of `js/shop.js` with:
```js
var Shop = (function () {

  var activeTab = 'all';

  var TYPE_LABELS = {
    flavor: '★ flavor unlock',
    decor: '⌂ shop upgrade',
    customer: '♥ new customer'
  };

  var ART_BG = {
    flavor: 'linear-gradient(135deg, #fff0d4 0%, #ffcce0 100%)',
    decor: 'linear-gradient(135deg, #d4f0e8 0%, #9be0c8 100%)',
    customer: 'linear-gradient(135deg, #e8d4f0 0%, #c8a8e0 100%)'
  };

  var TABS = [
    { id: 'all',      label: 'All' },
    { id: 'flavor',   label: 'Flavors' },
    { id: 'decor',    label: 'Shop Decor' },
    { id: 'customer', label: 'Customers' }
  ];

  function render(state) {
    var coinsEl = document.getElementById('upgrades-coins');
    if (coinsEl) coinsEl.textContent = '🪙 ' + state.coins;

    var list = document.getElementById('upgrades-list');
    if (!list) return;

    var html = '<div class="up-tabs">';
    TABS.forEach(function (tab) {
      var count = UPGRADE_CATALOG.filter(function (u) {
        return (tab.id === 'all' || u.type === tab.id) && state.unlocks.indexOf(u.id) === -1;
      }).length;
      html += '<button class="up-tab' + (activeTab === tab.id ? ' active' : '') + '" data-tab="' + tab.id + '">'
        + tab.label + ' <span class="count">' + count + '</span></button>';
    });
    html += '</div>';

    var items = UPGRADE_CATALOG.filter(function (u) {
      return activeTab === 'all' || u.type === activeTab;
    });

    html += '<div class="up-grid">';
    items.forEach(function (upgrade) {
      var owned = state.unlocks.indexOf(upgrade.id) !== -1;
      var canAfford = state.coins >= upgrade.cost;
      var cardCls = 'up-card' + (owned ? ' owned' : '') + (!canAfford && !owned ? ' locked' : '');
      var artBg = ART_BG[upgrade.type] || 'var(--pink-soft)';

      html += '<div class="' + cardCls + '">'
        + '<div class="up-art-frame" style="background:' + artBg + '">' + _iconFor(upgrade.type) + '</div>'
        + '<div class="up-tag">' + (TYPE_LABELS[upgrade.type] || upgrade.type) + '</div>'
        + '<div class="up-name">' + upgrade.name + '</div>'
        + '<div class="up-desc">' + upgrade.description + '</div>'
        + '<div class="up-buy">'
        + '<div class="up-price">🪙 ' + upgrade.cost + '</div>';

      if (owned) {
        html += '<button class="up-buy-btn owned-tag" disabled>Installed ✓</button>';
      } else {
        html += '<button class="up-buy-btn' + (!canAfford ? '" disabled' : '"') + ' data-id="' + upgrade.id + '">Buy →</button>';
      }

      html += '</div></div>';
    });
    html += '</div>';

    list.innerHTML = html;

    list.querySelectorAll('button[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        render(state);
      });
    });

    list.querySelectorAll('button[data-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        purchase(btn.getAttribute('data-id'));
      });
    });
  }

  function purchase(upgradeId) {
    var state = State.loadState();
    var upgrade = UPGRADE_CATALOG.find(function (u) { return u.id === upgradeId; });
    if (!upgrade) return;
    if (state.unlocks.indexOf(upgradeId) !== -1) return;
    if (state.coins < upgrade.cost) return;

    State.updateState({
      coins: state.coins - upgrade.cost,
      unlocks: state.unlocks.concat([upgradeId])
    });
    render(State.loadState());
  }

  function _iconFor(type) {
    var icons = { flavor: '🍦', decor: '🎨', customer: '🧑' };
    return icons[type] || '⭐';
  }

  return { render, purchase };
})();
```

- [ ] **Step 4: Manual verify**

Open the Shop screen. You should see:
- A tab bar: **All · Flavors · Shop Decor · Customers** with count badges
- All tab shows all 12 items in a 3-column grid
- Clicking "Flavors" shows only the 5 flavor items
- Clicking "Shop Decor" shows only the 4 decor items
- Clicking "Customers" shows only the 3 customer items
- Each card has a type badge ("★ flavor unlock" etc.), Italian name, English description
- Art frames have colored gradients (warm pink for flavors, mint for decor, lavender for customers)
- Buy button says "Buy →"; owned items show "Installed ✓"
- Buying an item deducts coins and re-renders on the current tab

- [ ] **Step 5: Commit**

```bash
git add index.html js/shop.js style.css
git commit -m "feat: add tab UI and visual polish to shop screen"
```
