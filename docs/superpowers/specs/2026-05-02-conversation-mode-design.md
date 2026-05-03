# Conversation Mode — Design Spec
**Date:** 2026-05-02
**Project:** Alice's Gelateria! Typing Tutor

---

## Overview

Add a standalone "Conversation Mode" to Alice's Gelateria where players type full natural sentences from the perspective of a friendly gelato shopkeeper. Unlike the word-based phase levels, this mode is always unlocked, uses the full keyboard, and covers a wide range of small-talk topics beyond ice cream orders.

---

## Data & Content

**File:** `data/conversations.js`
**Export:** `CONVERSATION_SENTENCES` — a flat array of strings

Sentence guidelines:
- Written from the shopkeeper's perspective
- Topics: order responses, weather, the shop, weekend plans, who the customer is with, regulars, compliments
- Length: 40–70 characters per sentence (comfortable for a child, meaningfully longer than single words)
- ~40–50 sentences in the initial set; more can be added without touching game code

Examples:
- "I'd be happy to scoop that for you — any toppings today?"
- "It's such a perfect day for gelato, don't you think?"
- "Big weekend coming up? We just got fresh pistachio in!"
- "We've been open since my grandmother's time — this recipe is hers."
- "Are you two on a date? That's the sweetest thing!"
- "I thought that was you! The usual?"

The game picks sentences randomly each order.

---

## Game Loop & Mechanics

Conversation mode reuses the existing shift loop with minimal changes:

**What stays the same:**
- Customer queue (1–3 concurrent customers based on tier equivalent)
- Patience timers and decay rates
- Lives system (3 lives, lose one when a customer times out)
- Coins (10 per completed sentence)
- Shift end conditions (orders-to-win count, clearance threshold)
- Summary screen (reuses existing layout, "sentences" replaces "words" in copy)

**What changes:**

| Aspect | Word Mode | Conversation Mode |
|--------|-----------|-------------------|
| Prompt source | `PHASE_WORDS[phase]` | `CONVERSATION_SENTENCES` |
| Ticket format | Quote prefix + word | Sentence is the full prompt (no prefix) |
| Input handling | Keypress → letter box advance | Free-type `<input>` field |
| Completion trigger | All letters typed correctly | Full sentence length reached at ≥90% accuracy |
| Phase gating | Requires phase unlock | Always available |

**Accuracy threshold:** An order completes when the player has typed the full sentence length and ≥90% of characters are correct. This avoids frustrating restarts on a single missed apostrophe while still penalising careless typing in the accuracy score.

**Shift configuration:** Conversation mode uses fixed difficulty equivalent to Medium tier — 20 sentences to win, 2 concurrent customers, 40s patience. No easy/medium/hard sub-tiers in v1.

---

## UI Changes

### Home Screen
- Add a "Conversation Mode" button to the existing navigation row alongside "Open the Shop"
- Same button styling as existing nav buttons

### Game Screen — Order Stage (expanded)
The order stage area is the only part of the game screen that changes:

1. **Sentence display** — replaces letter boxes
   - Each character rendered as a `<span>`
   - States: neutral (cream, not yet typed), correct (green), incorrect (red)
   - Text wraps naturally across 1–2 lines
   - Stage area grows slightly taller than word mode to accommodate wrapping

2. **Input field** — below the sentence display
   - Single `<input type="text">` element
   - Auto-focused when an order becomes active
   - Styled: cream background, ink border, JetBrains Mono font
   - Read-only visual; sentence display above provides all feedback

3. **Customer portrait and name** — unchanged, stay at top of stage

4. **On-screen keyboard** — hidden in conversation mode (finger-zone highlighting not needed)

All other game screen elements (ceiling, HUD, gelato case, customer queue, register) are unchanged.

### Progress Screen
Add a "Conversation" stats section below the existing level stats:
- Total sentences served
- Best WPM in conversation mode
- (Reuses existing `accuracyHistory[]` shape for the WPM bar chart)

---

## State

No new localStorage key. Add `conversationStats` to the existing state object via the schema-merge pattern in `state.js`:

```js
conversationStats: {
  totalSentences: 0,
  bestWPM: 0,
  accuracyHistory: [],   // same shape as existing accuracyHistory entries
}
```

Coins earned in conversation mode flow into the shared `state.coins` wallet. Upgrades remain shared across all modes.

---

## Out of Scope (v1)

- Difficulty sub-tiers for conversation mode (always Medium equivalent)
- Conversation-specific upgrades or unlocks
- Sentence categories or filtering by topic
- Per-sentence stats or history
