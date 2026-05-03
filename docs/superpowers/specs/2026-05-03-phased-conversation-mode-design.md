# Phased Conversation Mode — Design Spec

**Date:** 2026-05-03
**Status:** Approved

## Overview

Players at early phases want to experience the free-typing conversation format before they know all the letters. This feature adds a phase picker to Conversation Mode so players can constrain the letter set. Phased shifts use randomly generated word strings from the existing phase word pools rather than natural-language sentences.

## Behavior

When a player taps **💬 Conversation** on the home screen, a phase picker modal appears before the shift starts. The player picks a phase (1–7) or Full Keyboard, then the shift begins. All shift mechanics are unchanged — same `CONVERSATION_CONFIG` (10 sentences to win, 2 concurrent customers, 40s patience timer), same 90% accuracy threshold, same coin rewards, same WPM calculation.

## Modal UI

- Triggered by the existing "💬 Conversation" button on the home screen
- 2-column grid of 8 cards: Phase 1–7 + Full Keyboard
- Each phase card shows:
  - Phase number
  - New letters added in that phase (not cumulative)
  - Short spatial label (e.g. "home row", "bottom row")
- Full Keyboard card: visually distinct color, label "Real gelato shop sentences — all keys"
- Cancel button closes the modal without starting a shift
- Last-used selection persisted as `state.conversationPhase` via the game's existing `saveState()` mechanism (default: `'full'`)

### Phase letter labels

| Phase | New letters | Label |
|---|---|---|
| 1 | a s d f j k l | home row |
| 2 | + g h | left stretch |
| 3 | + i e | top row vowels |
| 4 | + u r | right vowel + reach |
| 5 | + t y | top row center |
| 6 | + w o p | outer ring |
| 7 | + n b m c z v | bottom row |
| Full | all keys | real sentences |

## Phrase Generation

For phases 1–7, each order draws a phrase from `generatePhrase(phase)`:

1. Shuffle a copy of `PHASE_WORDS[phase]`
2. Take the first 8–10 words (target length comparable to a real conversation sentence)
3. Join with single spaces — all lowercase, no punctuation
4. If the pool has fewer than 8 words, cycle through it to reach the minimum length

For Full Keyboard, the existing `CONVERSATION_SENTENCES` pool is used unchanged.

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add phase picker modal markup |
| `style.css` | Modal overlay, backdrop, and phase card styles |
| `js/main.js` | `startConversationShift()` shows modal; passes `conversationPhase` into `startShift()` |
| `js/gameplay.js` | Add `generatePhrase(phase)` function; add `PHASE_LETTER_LABELS` constant; wire `conversationPhase` into `refillActiveOrders` so phased shifts draw from `generatePhrase` instead of `CONVERSATION_SENTENCES` |
| `js/state.js` | Add `conversationPhase` to session state (default: `'full'`) |

No new data files. Phrase generation is fully dynamic from existing `PHASE_WORDS` data.

## Out of Scope

- No new difficulty tiers for phased conversation
- No separate stats tracking per phase (all conversation shifts roll into existing `conversationStats`)
- No changes to the summary screen — "Sentences Served" label applies to all conversation shifts
- No keyboard visual shown during phased shifts (consistent with existing conversation mode)
