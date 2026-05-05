# Design Tokens — Alice's Gelateria

Drop these into your theme file (Tailwind config, CSS variables, styled-components theme, etc.).

## CSS Custom Properties

```css
:root {
  /* Surfaces */
  --pink:        #ff8fc4;
  --pink-soft:   #ffc6dd;
  --pink-deep:   #e91e63;
  --yellow:      #ffd23a;
  --yellow-deep: #f5b800;
  --mint:        #9be0c8;
  --mint-deep:   #5dc4a0;
  --blue:        #5fb3ff;
  --cream:       #fff5e8;

  /* Ink */
  --ink:         #2a1a2e;
  --ink-soft:    #6b4f6f;
  --ink-faint:   #a18ba6;

  /* Finger colors (keyboard) */
  --f-pinky:  #ff7aab;
  --f-ring:   #5fb3ff;
  --f-middle: #9be0c8;
  --f-index:  #ffd23a;
  --f-thumb:  #fff5e8;

  /* Type */
  --display: 'Fraunces', serif;       /* italic 700/900 */
  --mono:    'JetBrains Mono', monospace;

  /* Shadows — hard offset, NOT blurred */
  --shadow-sm: 2px 2px 0 var(--ink);
  --shadow-md: 4px 4px 0 var(--ink);
  --shadow-lg: 6px 6px 0 var(--ink);
  --shadow-xl: 8px 8px 0 var(--ink);

  /* Borders */
  --border:        2.5px solid var(--ink);
  --border-thick:  3px solid var(--ink);
  --border-bottom-thick: 5px;  /* applied to bottom border on tactile cards/keys */

  /* Radii */
  --radius-key:    7px;
  --radius-pill:   999px;
  --radius-card:   14px;
  --radius-frame:  18px;
  --radius-frame-lg: 24px;
}
```

## Tailwind Config (excerpt)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pink:       { DEFAULT: '#ff8fc4', soft: '#ffc6dd', deep: '#e91e63' },
        yellow:     { DEFAULT: '#ffd23a', deep: '#f5b800' },
        mint:       { DEFAULT: '#9be0c8', deep: '#5dc4a0' },
        blue:       { DEFAULT: '#5fb3ff' },
        cream:      '#fff5e8',
        ink:        { DEFAULT: '#2a1a2e', soft: '#6b4f6f', faint: '#a18ba6' },
        finger: {
          pinky:  '#ff7aab',
          ring:   '#5fb3ff',
          middle: '#9be0c8',
          index:  '#ffd23a',
          thumb:  '#fff5e8',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        sm: '2px 2px 0 #2a1a2e',
        md: '4px 4px 0 #2a1a2e',
        lg: '6px 6px 0 #2a1a2e',
        xl: '8px 8px 0 #2a1a2e',
      },
      borderRadius: {
        card:    '14px',
        frame:   '18px',
        'frame-lg': '24px',
      },
    },
  },
};
```

## JSON (theme file / design-tokens schema)

```json
{
  "color": {
    "pink":      { "default": "#ff8fc4", "soft": "#ffc6dd", "deep": "#e91e63" },
    "yellow":    { "default": "#ffd23a", "deep": "#f5b800" },
    "mint":      { "default": "#9be0c8", "deep": "#5dc4a0" },
    "blue":      "#5fb3ff",
    "cream":     "#fff5e8",
    "ink":       { "default": "#2a1a2e", "soft": "#6b4f6f", "faint": "#a18ba6" },
    "finger": {
      "pinky":  "#ff7aab",
      "ring":   "#5fb3ff",
      "middle": "#9be0c8",
      "index":  "#ffd23a",
      "thumb":  "#fff5e8"
    }
  },
  "font": {
    "display": "Fraunces, serif",
    "mono":    "JetBrains Mono, monospace"
  },
  "shadow": {
    "sm": "2px 2px 0 #2a1a2e",
    "md": "4px 4px 0 #2a1a2e",
    "lg": "6px 6px 0 #2a1a2e",
    "xl": "8px 8px 0 #2a1a2e"
  },
  "radius": {
    "key":      "7px",
    "pill":     "999px",
    "card":     "14px",
    "frame":    "18px",
    "frame-lg": "24px"
  }
}
```

## Finger Map (keyboard → finger)

```js
// src/lib/fingerMap.js
export const FINGER_BY_KEY = {
  // Left hand
  Q: 'pinky',  A: 'pinky',  Z: 'pinky',
  W: 'ring',   S: 'ring',   X: 'ring',
  E: 'middle', D: 'middle', C: 'middle',
  R: 'index',  F: 'index',  V: 'index',
  T: 'index',  G: 'index',  B: 'index',
  // Right hand
  Y: 'index',  H: 'index',  N: 'index',
  U: 'index',  J: 'index',  M: 'index',
  I: 'middle', K: 'middle', ',': 'middle',
  O: 'ring',   L: 'ring',   '.': 'ring',
  P: 'pinky',  ';': 'pinky', '/': 'pinky',
  // Numbers
  '1':'pinky','2':'ring','3':'middle','4':'index','5':'index',
  '6':'index','7':'index','8':'middle','9':'ring','0':'pinky',
  // Other
  ' ': 'thumb',
};

export const FINGER_COLORS = {
  pinky:  '#ff7aab',
  ring:   '#5fb3ff',
  middle: '#9be0c8',
  index:  '#ffd23a',
  thumb:  '#fff5e8',
};

export function fingerForKey(key) {
  return FINGER_BY_KEY[(key || '').toUpperCase()] || 'thumb';
}
```

## Spacing Scale

Use 4px base. Cards typically have 12–18px internal padding; sections 22–32px.

| Step | Value | Used for |
|---|---|---|
| 1 | 4px | gap between letters in a row, mini-tub gaps |
| 2 | 6–8px | card sub-elements |
| 3 | 10–14px | inter-card spacing inside a panel |
| 4 | 16–22px | between major panels |
| 5 | 28–40px | screen padding, hero blocks |

## Type Scale

| Use | Family | Size | Weight | Style |
|---|---|---|---|---|
| Display hero (APERTO, "served 8 customers") | Fraunces | 56–88px | 900 | italic |
| Section / card title | Fraunces | 22–32px | 900 | italic |
| Customer name | Fraunces | 16–18px | 900 | italic |
| Italian quote on order ticket | Fraunces | 18px | 700 | italic |
| Big stat number | Fraunces | 28–38px | 900 | italic |
| HUD pill / button label | JetBrains Mono | 12–14px | 700 | regular |
| Body / description | JetBrains Mono | 11–12px | 400/500 | regular |
| Mono label / kicker (UPPERCASE) | JetBrains Mono | 9.5–11px | 700 | uppercase, letter-spacing 0.14–0.18em |

## Border / Shadow Recipes

```css
/* Sticker card */
.sticker-card {
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  box-shadow: 4px 4px 0 var(--ink);
  background: var(--cream);
}

/* Active / lifted */
.sticker-card.is-active {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 var(--pink-deep), 5px 5px 0 3px var(--ink);
}

/* Tactile button (thicker bottom border) */
.tactile-btn {
  border: 3px solid var(--ink);
  border-bottom-width: 6px;
  border-radius: 999px;
  box-shadow: 4px 4px 0 var(--ink);
}

/* Keyboard key */
.kb-key {
  border: 2px solid var(--ink);
  border-bottom-width: 4px;
  border-radius: 7px;
  box-shadow: 1px 1px 0 var(--ink);
}

/* Next-key highlight (added on top of finger color) */
.kb-key.is-next {
  box-shadow:
    0 0 0 3px var(--ink),
    0 0 0 5px var(--yellow),
    0 0 18px rgba(233, 30, 99, 0.7);
  transform: translateY(-3px);
}
```
