# Design: Bottom Row Sub-levels, Conversation Keyboard Guide, Index Finger Colors

**Date:** 2026-05-23

---

## Feature 1: Bottom Row Sub-levels

### Goal

Split the single "bottom row" phase into three progressive sub-levels so learners introduce new keys gradually instead of all at once.

### New Phase Structure

Old phases 7 and 8 shift to 9 and 10. Two new phases inserted:

| Phase | New keys added | Label | Key pool cumulative additions |
|-------|---------------|-------|-------------------------------|
| 7 | v, m | index fingers | Phases 1–6 + v, m |
| 8 | b, n | outer index | Phase 7 + b, n |
| 9 | z, x, c, `,`, `.` | full bottom row | Phase 8 + z, x, c, comma, period |
| 10 | `/` | (was phase 8) | Phase 9 + / |

### File Changes

**`js/keyboard.js` — `PHASE_KEYS`**

- Phase 7: phase 6 keys + `v`, `m`
- Phase 8: phase 7 keys + `b`, `n`
- Phase 9: phase 8 keys + `z`, `x`, `c`, `,`, `.` (was old phase 7)
- Phase 10: phase 9 keys + `/` (was old phase 8)

**`js/gameplay.js` — `PHASE_LETTER_LABELS`**

- Phase 7: `{ letters: '+ v m', label: 'index fingers' }`
- Phase 8: `{ letters: '+ b n', label: 'outer index' }`
- Phase 9: `{ letters: '+ z x c , .', label: 'full bottom row' }` (was phase 7)
- Phase 10: `{ letters: '+ /', label: 'full keyboard' }` (was phase 8)

**`data/words.js` — `PHASE_WORDS`**

Split and reassign words so each phase only uses letters available in that phase:

- Phase 7 pool: words using letters from phases 1–6 plus v and m (no b, n, c, x, z). Examples: `move`, `improve`, `olive`, `valve`, `glove`, `drive`, `revive`, `vivid`, `motive`, `storm`, `warm`, `item`, `swim`, `trim`, `yam`, `strum`.
- Phase 8 pool: words that introduce b and n (no c, x, z). Examples: `blend`, `brown`, `born`, `bond`, `brand`, `grin`, `burn`, `bundle`, `border`, `blanket`, `wander`, `robin`.
- Phase 9 pool: words using c, x, z, commas, periods — the current phase 7 ice-cream-themed words (`sprinkle`, `vanilla`, `caramel`, `blizzard`, etc.) belong here.
- Phase 10 pool: keep current phase 8 pool unchanged.

---

## Feature 2: Toggleable Keyboard Guide in Conversation Mode

### Goal

Conversation mode currently hides the keyboard guide entirely. Add it back as a collapsible widget — visible by default, user can toggle it off.

### Behaviour

- On session start, keyboard renders at its usual position (below the order card) using the conversation phase's key set.
- A toggle button sits inside the keyboard widget's `.counter-head` row, right-aligned alongside the "Keyboard" title.
- Button label: `▼ Hide` when visible, `▶ Keyboard` when collapsed.
- When collapsed, the `.kb` div is hidden (`display:none`) and the next-key hint clears. The `.counter-head` row (with the toggle button) remains visible so users can re-expand.
- Toggle state lives on `session.kbVisible` (boolean, default `true`).

### File Changes

**`js/gameplay.js`**

- In `startShift()`, set `session.kbVisible = true`.
- Replace the conversation-mode branch that clears `#keyboard-hint` (lines 144–149) with a call to `Keyboard.render(session.conversationPhase)` followed by `Keyboard.renderToggle(session)`.
- Add `Keyboard.renderToggle(session)` call whenever the keyboard needs to re-render (e.g. after a new order loads).

**`js/keyboard.js`**

- Add `renderToggle(session)` function: injects the toggle button into `.counter-head` and binds a click handler that flips `session.kbVisible`, shows/hides `.kb`, and updates the button label.

---

## Feature 3: Left vs Right Index Finger Colors

### Goal

Distinguish left-hand index finger keys from right-hand index finger keys in the keyboard guide using two slightly different warm tones.

### Key Assignments

| Class | Keys | Color |
|-------|------|-------|
| `f-index-l` | f, g, r, t, v, b | `#ffd23a` (warm yellow — current index color) |
| `f-index-r` | j, h, y, u, n, m | `#ffb347` (slightly amber/orange) |

Both colors stay in the warm yellow/amber family so the guide reads as "same finger type, different hand."

### File Changes

**`js/keyboard.js` — `KEY_FINGER`**

Change all left-hand index keys from `'index'` to `'index-l'` and right-hand index keys to `'index-r'`:

```
Left index:  f → index-l, g → index-l, r → index-l, t → index-l, v → index-l, b → index-l
Right index: j → index-r, h → index-r, y → index-r, u → index-r, n → index-r, m → index-r
```

**`style.css`**

- Add CSS variables: `--f-index-l: #ffd23a` and `--f-index-r: #ffb347`
- Remove or repurpose old `--f-index`
- Add rules: `.key.f-index-l { background: var(--f-index-l); color: var(--ink); }` and `.key.f-index-r { background: var(--f-index-r); color: var(--ink); }`

---

## Scope

No changes to: number row, game mechanics, WPM/accuracy logic, conversation sentence matching, shop/upgrades, progress screens.
