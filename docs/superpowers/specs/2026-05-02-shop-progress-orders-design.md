# Design: English Orders, WPM Chart, Shop Redesign

**Date:** 2026-05-02
**Project:** Alice's Gelateria — typing tutor

---

## 1. English Orders

### What changes
Replace Italian request phrases with English equivalents in `js/gameplay.js`.

### Implementation
- Replace `ITALIAN_QUOTES` array (line 334) with six English phrases:
  ```js
  var ORDER_QUOTES = [
    "I'd love a scoop of", "Can I get a", "Could I please have",
    "Ooh, I'll take a", "May I have a", "I'd like a"
  ];
  ```
- Change ticket line suffix from `, per favore!"` to `!"`.

### Scope
- **In:** `js/gameplay.js` only — the quotes array and the ticket line template.
- **Out:** Italian flavor names in the gelato case display (fior di latte, fragola, etc.) are untouched. Italian UI copy elsewhere is untouched.

---

## 2. WPM Chart (Progress Screen)

### What changes
The "Recent Accuracy" bar chart in the Progress screen becomes a "Recent Speed" WPM chart.

### Implementation (`js/progress.js`)
- **Data:** Use `entry.wpm` instead of `entry.accuracy`. Both fields already exist in `accuracyHistory` objects.
- **Scaling:** `maxWpm = Math.max(...entries.map(e => e.wpm))`. Bar height = `Math.round((entry.wpm / maxWpm) * 76)`. If all entries are 0, show flat bars.
- **Colors (relative to personal best):**
  - Top 10% of personal best (`wpm >= maxWpm * 0.9`) → gold `#ffd23a`
  - Top 50% (`wpm >= maxWpm * 0.5`) → mint `#9be0c8`
  - Below 50% → `var(--ink-faint)`
- **Personal best callout:** The tallest bar gets a `★` label above it.
- **Heading:** "Recent Accuracy" → "Recent Speed (WPM)"; y-axis label → personal best WPM value (e.g. "42 wpm best").

### Scope
- **In:** `js/progress.js`, minor `style.css` update if gold color not already a variable (it is: `#ffd23a` used in HUD).
- **Out:** The `accuracyHistory` data structure is unchanged. No state migration needed.

---

## 3. Shop Redesign

### What changes
- Tab bar added: **All · Flavors · Shop Decor · Customers**
- Upgrade catalog refreshed with richer Italian-named items
- Card visual polish: type badges, CSS art frames, updated Buy button copy

### Tab UI (`js/shop.js`)
- Module-level `var activeTab = 'all'` tracks current tab.
- Tab bar renders above the grid. Each tab shows item count (unowned items in that category).
- Clicking a tab sets `activeTab` and calls `Shop.render(state)` — full re-render, no show/hide tricks.
- Active tab: `border-bottom: 4px solid var(--pink-deep)`. Inactive: transparent border.

### Catalog refresh (`data/upgrades.js`)
Replace all 12 existing items with the following. Each item: `{ id, name, desc, type, price, emoji }`.

**Flavors** (`type: 'flavor'`)
| id | name | desc | price |
|----|------|------|-------|
| `flavor-caramello` | Caramello Salato | Sea-salt caramel — sweet and salty perfection | 120 |
| `flavor-stracciatella` | Stracciatella | Creamy fior di latte with dark chocolate shards | 140 |
| `flavor-pistacchio` | Pistacchio di Bronte | Rich Sicilian pistachio, slightly sweet | 180 |
| `flavor-fragola` | Fragola | Fresh strawberry, bright and summery | 80 |
| `flavor-limone` | Limone Sfusato | Tart Amalfi lemon sorbet, no cream | 90 |

**Shop Decor** (`type: 'decor'`)
| id | name | desc | price |
|----|------|------|-------|
| `decor-counter` | Carrara Counter | Marble counter — cool white with grey veins | 180 |
| `decor-wallpaper` | Notte Stellata | Deep blue starry-night wall tiles | 200 |
| `decor-bell` | Campanella d'Ottone | Brass door bell — ding! | 90 |
| `decor-sign` | Insegna Rosa | Pastel pink hand-painted shop sign | 110 |

**Customers** (`type: 'customer'`)
| id | name | desc | price |
|----|------|------|-------|
| `cust-cat` | Macchia the Cat | A tuxedo cat who orders two scoops | 110 |
| `cust-dog` | Bruno il Cane | A golden retriever, always cheerful | 160 |
| `cust-nonna` | Nonna Concetta | Local legend, has opinions about gelato | 130 |

### Card visual design (`js/shop.js` + `style.css`)
- **Type badge:** `★ flavor unlock` / `⌂ shop upgrade` / `♥ new customer` — small pill above card name.
- **Art frame:** Colored gradient `<div class="up-art-frame">` with emoji centered. Gradient colors per type:
  - Flavor: warm cream → pink
  - Decor: mint → teal  
  - Customer: lavender → soft purple
- **Buy button:** "Buy →" (replacing "Compra!"). Owned items show "Installed ✓" (disabled, muted style).
- **Price:** `🪙 120` format, unchanged.

### New CSS needed (`style.css`)
```css
.up-tabs { display:flex; gap:4px; margin-bottom:20px; border-bottom:2px solid var(--ink-faint); }
.up-tab { background:none; border:none; border-bottom:4px solid transparent; padding:8px 16px;
          font-family:var(--mono); font-size:13px; cursor:pointer; margin-bottom:-2px; }
.up-tab.active { border-bottom-color:var(--pink-deep); color:var(--ink); font-weight:700; }
.up-tab .count { font-size:11px; background:var(--ink-faint); border-radius:99px;
                 padding:1px 6px; margin-left:4px; }
.up-tag { font-size:11px; color:var(--ink-faint); margin-bottom:4px; }
.up-art-frame { /* existing styles extended with gradient variants per type */ }
```

### Scope
- **In:** `data/upgrades.js` (catalog), `js/shop.js` (tab logic + render), `style.css` (tab + badge CSS).
- **Out:** No Boosts tab. No purchase side-effects beyond what currently exists. No catalog items removed from player save data on upgrade (old IDs simply won't match new catalog — treated as unowned, which is acceptable since this is a child's local game with no real economy at stake).

---

## Files touched summary

| File | Change |
|------|--------|
| `js/gameplay.js` | Replace `ITALIAN_QUOTES` array + ticket suffix |
| `js/progress.js` | Switch to WPM data, relative scaling + coloring |
| `js/shop.js` | Tab state, tab render, re-render on click, card template updates |
| `data/upgrades.js` | Full catalog replacement (12 → 12 new items) |
| `style.css` | Tab bar styles, type badge styles |
