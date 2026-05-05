# Handoff: Alice's Gelateria — Visual Redesign

## Overview

Alice's Gelateria is a children's typing-practice game framed as running a Roman gelateria. The existing codebase has working game logic (typing input, customer queue, phases, upgrades, scoring) but the visual layer is bare-bones MVP.

This handoff redesigns the **entire visual layer** — every screen, the keyboard finger-coloring, the customer/upgrade presentation, and the brand identity — in a **Museum-of-Ice-Cream** aesthetic: candy-pink soaked surfaces, hand-painted shop fixtures, italic display type, and diegetic UI (the game UI *is* the shop).

The functional design (game loop, inputs, state shape, customers, upgrades) **stays the same** — this is purely a visual + UX uplift.

---

## About the Design Files

The HTML files in this bundle are **design references**, not production code. They are static prototypes built to show the intended look, layout, copy, color, typography, and interaction states. They use vanilla HTML/CSS with Google Fonts and a small palette stylesheet (`moic.css`).

**The task is to recreate these designs inside the existing Alice's Gelateria codebase**, using its current framework (likely React + a CSS solution — Tailwind, CSS Modules, or styled-components depending on what's there) and its existing data files (`customers.js`, `upgrades.js`, phase config, etc.).

**Do not** copy the HTML wholesale. Do recreate the visual treatment, copy, palette, type, and component patterns described below using the codebase's established conventions.

If something in the prototype conflicts with what's in the codebase (e.g., the prototype shows 12 upgrades but the data file has 8), the **codebase data is the source of truth** — apply the visual treatment to whatever data actually exists. Adjust the design to fit the real data, not the other way around.

---

## Fidelity

**High-fidelity (hi-fi).** The design files specify:

- Exact hex colors (palette below)
- Final typography choices (Fraunces italic for display, JetBrains Mono for body/data)
- Exact spacing, border radius, shadow offsets
- All copy and microcopy (in Italian-flavored English)
- Hover, active, locked, owned, and disabled states
- The full keyboard finger-color map

The developer should recreate the UI pixel-close to the prototypes, swapping placeholder emoji/CSS art for real illustrations (see **Assets** section).

---

## Files in This Bundle

```
design_handoff_alices_gelateria/
├── README.md                          ← this file
├── tokens.md                          ← every design token (colors, type, spacing, finger map)
├── moic.css                           ← reference stylesheet — copy values, not the file
├── 01-hifi-screens.html               ← Setup, Home, Upgrades, Summary, Diary, Map
├── 02-hifi-gameplay.html              ← Gameplay screen (the main play loop)
└── 03-wireframes-exploration.html     ← Earlier wireframes — context, NOT the target
```

`03-wireframes-exploration.html` is included only for context (lower-fidelity exploration of multiple directions). **The hi-fi files (01 and 02) are the implementation target.**

---

## Design System Foundations

### Palette (Museum of Ice Cream)

| Token | Hex | Usage |
|---|---|---|
| `--pink` | `#ff8fc4` | Primary surface — backgrounds, walls |
| `--pink-soft` | `#ffc6dd` | Tints, mini portraits, secondary surfaces |
| `--pink-deep` | `#e91e63` | Brand accent, active states, CTA primary |
| `--yellow` | `#ffd23a` | Counter, sunshine HUD, index-finger keys |
| `--yellow-deep` | `#f5b800` | Yellow shadows, gradients |
| `--mint` | `#9be0c8` | Success, footer ribbon, mint accents, middle-finger keys |
| `--mint-deep` | `#5dc4a0` | Mint depth, success text |
| `--blue` | `#5fb3ff` | Ring-finger keys (4th distinct hue on pink) |
| `--cream` | `#fff5e8` | Card/paper surfaces |
| `--ink` | `#2a1a2e` | Body text, borders, shadows |
| `--ink-soft` | `#6b4f6f` | Secondary text |
| `--ink-faint` | `#a18ba6` | Tertiary text, locked/disabled state |

### Typography

- **Display:** [Fraunces](https://fonts.google.com/specimen/Fraunces) — italic 700/900 for all headlines, customer names, big numbers, button labels
- **Body / data / UI:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — 400/500/700 for body, captions, HUD pills, monospace data

### Borders, Shadows, Corners

- All cards have **2.5–4px solid `--ink` borders** with **3–8px hard offset shadows** (`box-shadow: 4px 4px 0 var(--ink)`) — not soft drop-shadows. This is the core "sticker" feel.
- Border radius: 10–14px on cards, 18–24px on big frames, 999px on pills/CTAs.
- Buttons typically have an extra-thick bottom border (`border-bottom-width: 5px`) to feel tactile.

### Iconography & Emoji

- Emoji are used as **placeholders for customer portraits** (🤓 for Zoe, 👴🏻 for Papa Greg, etc.). These should be **replaced with real illustrated portraits** at implementation time — see **Assets**.
- A few standalone emoji (🔔, 🍦, 🪙, ★, ♥) are used as system glyphs and are fine to keep as-is or replace with simple SVGs.
- **Do not** add new decorative emoji that aren't in the prototype.

### Iconographic Affordances

- **Mini gelato tubs** (rounded-top rectangles with hard borders) appear in shop windows, the case, and upgrade illustrations. Locked tubs use a 135deg cream/pink stripe pattern with `?` overlay.
- **Cones** are CSS-drawn (yellow triangle + circular scoop). At implementation, these can stay as SVG components or become illustrated PNGs.
- **Awning** is a pure-CSS repeating-linear-gradient stripe with a serrated bottom edge.

---

## Screens

### 1. Setup — "The Door of Alice's"

**Purpose:** First-run / new-game name entry.

**Layout:**
- Full pink gradient background with floating cream "clouds"
- Centered card (max-width ~540px) styled as the **shop's front door**:
  - Awning stripe at top (pink-deep / cream repeating)
  - Black sign block with `Alice's ♥ Gelateria` (yellow / mint / pink-deep `♥`), kicker "benvenuti a", "est. 2026 · roma" subtitle
  - Cream body with greeting "Buongiorno! *The shop is yours.*"
  - Italic prompt: "What's your name, gelataio?"
  - Big italic input field, placeholder "type your name…", magenta hard-shadow
  - **Suggestion chips** below the input: Sofia, Marco, Giulia, Luca, Chiara, "Surprise me" — alternating pink-soft / mint / yellow backgrounds
  - **Two preview windows** side-by-side: "your case · 4 / 12" (mini-tubs, some locked) and "first customers" (mini-portraits)
  - Magenta primary CTA: **🔔 Ring the Bell ↵**
  - Helper text: `press [Enter] when ready`

**Behavior:**
- Typing fills the input; Enter submits.
- Suggestion chips populate the input on click.
- "Surprise me" picks a random Italian first name.
- Submitting transitions to **Home**.

**Reference:** `01-hifi-screens.html` → `#setup`

---

### 2. Home — "The Block Plan"

**Purpose:** Hub. Shows the player their shift, lets them open the shop, see growth, navigate to upgrades / diary.

**Layout:** 3-column grid on a pink-gradient background.

- **Top HUD strip:**
  - Left: "shift no. 14 · martedì" kicker + big italic "Buongiorno, Alice!" headline (with player name in yellow)
  - Right: row of HUD pills — coins (`🪙 240`), best streak (`★ best ×12`), wpm (`⌨ 32 wpm`)

- **Column 1 (1.4fr) — APERTO card:**
  - Black card with awning header
  - Big italic neon **APERTO** (88px, yellow with magenta + glow shadow)
  - Subtitle: "Time to get behind the counter. Today's phase: home row."
  - Magenta line ticker: "⏰ 3 customers in line"
  - Massive italic CTA button: **Open the Shop →**
  - Below CTA: 3 mini portraits of the customers in line

- **Column 2 (1fr) — Two stacked shop windows:**
  - **Il Banco**: 6×2 grid of mini-tubs, owned filled with flavor color, locked striped with `?`. Header "5 / 12".
  - **Familiar Faces**: row of customer mini-portraits (some met, some `?` locked). Header "8 / 25 met".

- **Column 3 (1fr) — Side rail:**
  - **Phase card** (black, magenta shadow): "1 — Home Row" with progress bar, key glyphs `A S D F · J K L`, "18 / 30 customers"
  - **Tip jar card** (yellow): big italic "240 lire", "+18 from yesterday"
  - **New in shop card** (mint): "Notte Stellata unlocked! starry wallpaper · +1 patience"
  - **Two small buttons:** Upgrades / Diary

**Behavior:**
- "Open the Shop" → Gameplay screen.
- "Upgrades" → Upgrades screen.
- "Diary" → Progress screen.

**Reference:** `01-hifi-screens.html` → `#home`

---

### 3. Gameplay — "Behind the Counter"

**Purpose:** The core typing loop. The screen *is* the shop interior.

**Layout:** A single shop frame, top-to-bottom:

1. **Ceiling** (pink, 56px tall) with 6 dome lights (yellow radial gradient) and bunting pennants (yellow/mint/magenta).
2. **Sign bar** (black, 14px padding):
   - Brand: italic `Alice's 🍦 Gelateria` (yellow / cream / mint)
   - HUD pills: `⌨ 32 wpm` (mint) · `🪙 240` (yellow) · `★ ×7` (magenta) · lives (3 hearts, last one dim)
3. **Awning** (22px, magenta + cream stripes with serrated bottom)
4. **Shop interior** (pink, 22px padding):
   - **Gelato case** at top (cream wall with hex-tile pattern, 8 mini-tubs labeled by flavor — owned filled, locked striped — yellow ledge under the tubs)
   - **3-column play row** (230 / 1fr / 220):

     **Left — La Fila (queue):** dark "la fila — up next" pill label, then 4 customer cards stacked. The active card has a yellow background and double-shadow (magenta + ink). Each card has portrait, italic name, "→ flavor" want line, and a patience bar (mint / yellow-warn / magenta-danger).

     **Center — Stage:**
       - **Order ticket** (cream card with green/yellow tape corners): customer portrait + name + meta on left ("9 yrs · glasses, curly brown"), italic Italian quote in the middle ("Vorrei un cono di **fragola**, per favore!" — target word underlined in magenta wavy), letter row below as individual key boxes (typed=mint, current=magenta with double shadow + lift, pending=cream/faint).
       - **Counter / keyboard** (yellow with magenta/cream stripe accent, magenta highlight on left edge): "Il banco — keyboard" title, hint "next: G right index" (with the next key inline-styled in the next-finger color), then a 3-row keyboard with **finger-coded keys** (see Finger Map below). Color legend underneath.

     **Right — Register:**
       - **Tip jar** (yellow card): 5 coin slots, filled ones with `$`, "3 / 5 · keep typing!"
       - **Streak** (cream card): big italic ×7 with "in a row" unit, magenta bonus line "↑ +50% tips!"
       - **On deck** (mint card): mini cone preview of the next customer's order ("Papa Greg / limone cone")

5. **Footer ribbon** (mint, 12px):
   - Left: phase name "Fase 1 · home row" + 8 phase dots (done=magenta, active=yellow ringed, pending=cream) + "3 / 8 served"
   - Right: `[Esc]` pause · `[Tab]` skip

**Behavior:**
- Real-time typing: each correct keypress advances the letter row, plays a soft chime, drips a coin into the tip jar at milestones.
- Wrong key: flash the current letter box magenta-shake, decrement a heart slot, decay the patience bar faster.
- Order complete: confetti from the cone scoop, customer card slides off-screen, on-deck slides into active.
- Patience timer drains the active card's bar continuously; when it hits 0, customer leaves angry → -1 heart, no tip, streak resets.

**Reference:** `02-hifi-gameplay.html`

---

### 4. Upgrades — "Wall of Goods"

**Purpose:** Spend lire on flavors, shop decor, customers, boosts.

**Layout:**
- Black header bar with "il magazzino · est. 2026" kicker + "Upgrades & Toppings" h2 on the left, big yellow `🪙 240` pill on the right
- Cream tab strip below: All / Flavors / Shop Decor / Customers / Boosts (each with a count badge)
- 3-column grid of upgrade cards on a pink background with subtle yellow + mint radial spotlights

**Card anatomy:**
- 110px illustration frame at top (each upgrade has its **own custom illustration** — see Upgrade Card Catalog below)
- Magenta uppercase type label (`★ flavor unlock`, `⌂ shop upgrade`, `♥ new customer`, `⚡ boost`)
- Big italic name
- Mono description with bolded effect (`+2 sec patience`, `+25% tip`, etc.)
- Dashed-top buy footer: italic price (`L120`) on the left, magenta "Buy →" pill on the right

**Card states:**
- **Default**: cream background, "Buy →" magenta button
- **Owned**: mint background, "✓ Owned" pill (ink), "installed" tag rotated -3° at top-right
- **Locked**: 0.62 opacity, grayed art, button replaced with `L500 · 🔒` or `need phase 3`
- **New**: magenta "new!" tag rotated -3° at top-right

**Upgrade Card Catalog** *(map these to your real `upgrades.js`; rename/recolor if your data differs):*

| Type | Name | Effect | Illustration |
|---|---|---|---|
| Flavor | Caramello Salato | Adds caramello to case + orders from Phase 2 | 3 caramel-toned tubs on yellow gradient |
| Flavor | Stracciatella | Cream base + chocolate flakes | One large tub with radial chocolate-fleck dots |
| Flavor | Pistacchio di Bronte | Sicilian pistachio. Nonna Rosa's favorite. | 3 mint-toned tubs on mint gradient |
| Decor | Carrara Counter | +2 sec patience for new customers | Marble-veined panel (CSS gradient) |
| Decor | Notte Stellata | +1 sec patience. Starry wallpaper. | Black sky + radial yellow stars + italic "notte" overlay |
| Decor | Campanella d'Ottone | +5 lire on new customer's first order | Big 🔔 on yellow→bronze gradient |
| Customer | Macchia, the Cat | Always orders fior di latte | Black cat emoji on mint, holding 🍦 |
| Customer | Bruno il Cane | Loves cioccolato. +25% tip on perfect orders | Dog emoji on yellow |
| Boost | Toppings Bar | Adds 2nd word to orders for 2× tips | 6 mini topping jars in a grid |
| Boost | Doppio Cono | Two-flavor orders for ×3 streak multiplier | Two stacked cones (mint + yellow + magenta scoops) |
| Boost | Nonna's Recipe Book | Reveals next 2 customers' orders | Lined paper with handwritten flavor list |
| Boost | La Ciliegina | Zero-mistake shift = 2× tips | Big 🍒 on pink-soft |

**Behavior:**
- Clicking "Buy →" on an affordable item: deduct lire, animate card flip to "owned" mint state, refresh case/customer pools.
- Clicking a locked card: shake + show lock reason in a tooltip ("Reach Phase 3 to unlock").
- Tab clicks filter the grid.

**Reference:** `01-hifi-screens.html` → `#upgrades`

---

### 5. Summary — "End-of-Shift Story"

**Purpose:** End-of-shift recap, framed as a children's-book page.

**Layout:**
- Pink-gradient background with yellow + mint radial spotlights
- Centered cream "page" card (max ~1080px) with 4px ink border + 8px hard shadow:
  - **Black header bar:** "shift no. 14 · martedì 23 marzo" + magenta "— chiuso —" pill
  - **Hero block** (centered, dashed-bottom border): italic lead "Today, Alice…", giant italic h2 "**served 8 customers**" (number in magenta)
  - **Stat chips row**: 4 chips — accuracy (mint), best streak (yellow), wpm peak (pink-soft), lire earned (cream) — each with big italic number + uppercase mono label
  - **Story section** ("— Tre momenti dolci —"): 3-column grid of "moment" cards. Each is a small cream card with **yellow tape** at the top, customer portrait + italic name + magenta tag (e.g. "first ×7 streak"), italic quote, and a dashed-top stat line (good in mint-deep, bad in magenta).
  - **Mint footer:** italic "earned today: L 86" (number magenta) on left, three buttons on right: Diary (cream) / Upgrades (yellow) / **Tomorrow →** (magenta primary)

**Behavior:**
- "Tomorrow →" returns to Home, increments shift number.
- Diary / Upgrades route to those screens.
- The 3 moments are **dynamically picked** from shift events: best streak, flavor unlock, near-miss / heart loss — fall back gracefully if a category is empty.

**Reference:** `01-hifi-screens.html` → `#summary`

---

### 6. Progress A — "Il Diario del Gelataio" (Diary)

**Purpose:** Persistent progress + customer collection, framed as a paper diary.

**Layout:** Two-page book spread on a pink-gradient background.

- **Diary book**: cream card with 4px ink border, ink gutter line down the middle.
- **Left page** ("page 1 · phases"):
  - Header: "Lessons learned" + kicker
  - **Speed card** (black w/ magenta shadow): "today's pace · 32 wpm" with a mini SVG sparkline trending up, "+4 wpm this week · 92% accuracy"
  - **Curriculum list** of phases. Each phase row is a hard-shadow card:
    - **Done** (mint): num + italic name + key glyphs + ✓
    - **Active** (yellow with magenta shadow): num + italic name + "18/30" + percentage
    - **Locked** (cream, 0.55 opacity): num + name + "locked" + 🔒
- **Right page** ("page 2 · faces"):
  - Header: "Customers met · 11 / 25"
  - Italic narrator copy: "Each smudge is a regular. Open the locked ones by playing the phases that bring them in."
  - 5×3 grid of customer cells: round portrait, mono name, mint "×N served" count
  - Locked cells: dark portrait with `?`, tagged with the phase that unlocks them ("phase 2", "phase 3")

**Reference:** `01-hifi-screens.html` → `#diary`

---

### 7. Progress B — "The Block Map"

**Purpose:** Alternative view of phase progression — shown as stops on a candy-road map. Pick **one** of the two Progress views (A or B); ideally A is the player-facing screen and B is an end-of-phase celebration / cutscene.

**Layout:**
- Black background with magenta + yellow + mint radial bloom and a faint white-dot grid pattern
- Header: yellow kicker "la mappa · stagione 1" + cream h2 "Through the Phases" + yellow "★ stop 4 of 8" position chip
- **Map track**:
  - Horizontal `--white/18` line across the middle
  - Yellow trail (with yellow glow) from the start to the active stop
  - 8 stops in a `repeat(8, 1fr)` grid
  - Each stop: 56px circle dot + uppercase mono label below
  - **Done**: mint dot with ✓
  - **Active**: magenta dot, yellow ring, ink ring, magenta glow, scaled 1.15, with a cream tooltip below ("you are here · 62%")
  - **Locked**: 0.4 opacity ink dot
- **Detail row** below the map (3 columns):
  - **Current stop card** (cream, magenta ring): italic stop name, description, magenta key tiles for the current phase's keys
  - **Progress card** (translucent white): italic "18 / 30" in mint with bar
  - **Unlocks at next stop**: 4 mini-rows showing what drops at the next stop (flavor / decor / customer / boost) — each with a colored circular icon and the item name

**Reference:** `01-hifi-screens.html` → `#map`

---

## Keyboard Finger Color Map (CRITICAL)

The keyboard color-codes each key by **which finger should hit it**. Four hues, all distinct against pink:

| Finger | Color (var) | Hex | Keys |
|---|---|---|---|
| Pinky | `--f-pinky` | `#ff7aab` (white text) | `Q A Z` · `P ; / [ ] \\` `1 0 -` |
| Ring | `--f-ring` | `#5fb3ff` | `W S X` · `O L .` `2 9` |
| Middle | `--f-middle` | `#9be0c8` | `E D C` · `I K ,` `3 8` |
| Index | `--f-index` | `#ffd23a` | `R F V T G B` · `Y H N U J M` `4 5 6 7` |
| Thumb | `--f-thumb` | `#fff5e8` | `Space` |

**The "next key" highlight** (the key the player should press right now) is rendered with:
- Original finger color preserved
- Yellow outer ring + ink ring + soft magenta glow
- 3px translateY lift
- A small `▼` arrow above the key

A legend strip should appear under the keyboard with 4 dots + finger-name labels.

This map is the **single most important reusable pattern** in the redesign. Build it as a `<KeyboardKey letter={…} finger={…} isNext={…} />` component (or equivalent) and use it everywhere a keyboard is shown.

---

## Customers (Real Portraits Required)

The codebase's `customers.js` contains specific descriptions (Hazel — Vietnamese, dark hair; Uncle Brennan — shaved head, red goatee, freckles; Nonna Rosa — etc.). Current prototypes use **emoji as placeholders** because real illustrated portraits don't exist yet.

**Implementation requires**:
- An illustrated portrait per customer (~25 portraits total) matching the description in `customers.md` / `customers.js`
- Style direction: cute stylized vector / "Cuphead-meets-Animal-Crossing"; flat fills, ink outlines, no gradients
- Same dimensions across all portraits (suggested: 320×320 PNG @ 2x, transparent background)
- A neutral fallback portrait for any customer without an illustration yet

Until illustrations are commissioned, **fall back to a colored circle with a single letter initial** in Fraunces italic (NOT emoji — emoji read as "MVP").

The customer's `Customer` component should accept `{ id, name, description, want, patience, portraitUrl? }` and render the portrait if present, the fallback initial otherwise.

---

## Copy & Voice

- Italian-flavored English. **Buongiorno**, **gelataio**, **il banco**, **la fila**, **chiuso**, **vorrei un cono di…**, **per favore**, **martedì**.
- Keep customer quotes as full Italian sentences; translate via subtle subtitle if needed for kids who don't read Italian.
- Friendly, never patronizing. No "Great job!" — instead: "Mira forgave you. Mostly."
- Numbers + lire feel old-world: `L 86`, not `$86` or `86 coins` (use `🪙` glyph for HUD compactness only).

---

## Interactions & Behavior

### Animations
- **Sticker shadow** is the visual baseline. No soft drop-shadows; everything has hard offset shadows.
- **Card hover lift**: `transform: translate(-1px, -1px)` + extend shadow by 1px.
- **Letter type**: typed letter snaps to mint with a 120ms ease-out scale 1 → 1.08 → 1.
- **Mistake**: current letter shake (3 cycles, 60ms each, ±4px), brief magenta flash.
- **Coin earned**: small coin sprite arcs from the order ticket to the tip jar, 400ms cubic-bezier(.5,1.5,.5,1).
- **Streak crossed milestone (×3, ×5, ×10)**: brief overlay with italic "×5 streak!" in yellow with magenta shadow, 600ms.
- **Customer arrives**: card slides in from right, settles with 1 elastic bounce.
- **Customer leaves angry**: card desaturates, shakes, slides off left.
- **Phase complete**: full-screen mint flash + map zoom (Progress B) celebrating the new stop.

### Hover/Active States
- Buttons: `translate(-1px, -1px)` + shadow `+1px` on hover; `translate(0, 0)` + shadow `-1px` on active.
- Tabs: underline slides between tabs (300ms ease).

### Responsive
- The play screen is designed at **1200px wide max**. Below ~960px, the 3-column play row should reflow to a single column with the keyboard sticky at the bottom.
- Mobile (≤640px) is **out of scope** for v1 — typing game is keyboard-first.

---

## State Management

**No new state is introduced by this redesign.** Reuse the existing game state. Visual changes only consume:

- `currentCustomer` (active card)
- `customerQueue` (3 dim cards behind active)
- `currentLetter`, `typedLetters`, `pendingLetters` (letter row state)
- `nextKey` (which key letter to highlight; derive `nextFinger` from the finger map)
- `coins`, `streak`, `lives`, `wpm`, `accuracy`
- `phaseIndex`, `customersServedThisPhase`, `customersToServe`
- `ownedFlavors[]`, `ownedDecor[]`, `ownedCustomers[]`, `ownedBoosts[]`
- `customersMet[]` with `{ id, timesServed }`
- `shiftNumber`, `shiftMoments[]` (computed end-of-shift)

If `shiftMoments` is not currently computed, add a small reducer at end-of-shift that picks 3 highlights: best streak, first new flavor used, and a tense moment (lowest patience save OR a heart loss).

---

## Design Tokens

See `tokens.md` in this bundle for the complete token list as both CSS variables and a JSON dump (suitable for Tailwind config or a theme file).

---

## Assets To Acquire

1. **~25 customer portraits** — illustrated, transparent PNG, 640×640 @2x, matching descriptions in `customers.js`/`customers.md`. Highest priority.
2. **~12 gelato tub photos or illustrations** — top-down, transparent, 200×160. (Optional — current CSS tubs work.)
3. **~12 upgrade illustrations** — most are buildable in CSS today (see Upgrade Card Catalog above); commission only the ones that don't read well as CSS (Macchia/Bruno benefit from real art; tubs and marble are fine).
4. **Fonts**: Fraunces and JetBrains Mono — both free on Google Fonts. Self-host or use the Google Fonts CDN.
5. **Sound effects** (out of scope for visual handoff but worth flagging): coin-clink, key-click, customer-bell, mistake-buzz, level-up-cheer.

---

## Implementation Order (Suggested)

1. **Tokens + base styles** — drop `moic.css` values into the codebase's theme/Tailwind config. Pull in Fraunces + JetBrains Mono.
2. **Reusable primitives** — `Card`, `Button`, `HUDPill`, `KeyboardKey`, `MiniTub`, `CustomerPortrait` (with emoji-fallback for now), `AwningStripe`, `CeilingDomes`.
3. **Gameplay screen** — biggest payoff, uses every primitive.
4. **Home screen** — second-most-visible.
5. **Upgrades** — all 12 cards using primitives + per-card illustration component.
6. **Setup, Summary, Diary/Map** — these reuse primitives heavily; should go fast once foundations are in place.
7. **Animations pass** — coin arcs, letter snap, mistake shake, streak overlays.
8. **Replace emoji with real portraits** as illustrations are delivered.

Estimated effort: ~1.5–2 weeks for a single React engineer with the existing game logic intact.

---

## Questions / Ambiguities

If anything is unclear, the **prototype HTML files are the source of truth** for visual decisions. For data shape, copy in customer/upgrade lists, and game logic, the **codebase is the source of truth**. When the two conflict, the developer should preserve the *visual treatment* and apply it to the real data.
