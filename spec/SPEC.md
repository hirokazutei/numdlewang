# numdlewang — Game Specification

## Overview

A daily word-game parody in the style of Wordle/e6dle, where players "guess" numbers each day. The game is entirely seed-driven: all randomness is derived deterministically from the current date so every player has the same experience on a given day.

---

## Seed

- Seed = today's date string in `YYYY-MM-DD` format (user's local timezone).
- All probabilistic outcomes (round count, guess count per round, number types, correctness, score display glitch, timer glitch) are derived from a seeded PRNG using this date string.
- Seed resets at local midnight.

---

## Rounds

The number of rounds for a given day is determined by the seed:

| Probability | Outcome |
|-------------|---------|
| 2%          | 0 rounds — skip to results; show "Everyone has numberwon!" |
| 2%          | 1 round |
| 91%         | 6 rounds (standard) |
| 5%          | Random integer between 7 and 1000 (inclusive) |

---

## Guesses Per Round

Each round asks the player to confirm numbers. The count of numbers shown per round is:

| Probability | Outcome |
|-------------|---------|
| 2%          | 1 number |
| 93%         | 2 numbers (standard) |
| 5%          | Random integer between 3 and 256 (inclusive) |

---

## Number / Symbol Types

Each individual "number" shown is one of:

| Probability | Type |
|-------------|------|
| 3%          | Mathematical symbol (√, ∛, !, ∑, ∏, ∂, ∫, ∞, ≈, ±, ÷, ×) |
| 3%          | Single random ASCII letter (a–z or A–Z) |
| 2%          | Single Unicode hieroglyphic character (U+13000–U+1342E range) |
| 92%         | Random integer (range: 0–9999) |

Type and value for each number are seeded — they are the same for all players on a given day.

---

## Round Correctness

Whether a player gets a round right or wrong is purely random (50/50), determined by the seed + round index. The player has no actual input — they just press a button to reveal the result.

(The "game" is entirely about reading the chaotic output, not skill.)

---

## Player Interaction Flow

1. Player arrives at the page and sees the day's puzzle number (days since epoch, e.g. `#42`).
2. For each round (1 to N):
   - Show the number(s) for that round.
   - Player clicks "Submit" / taps to confirm their guess.
   - Reveal ✓ or ✗ for that round.
3. After all rounds, show the Results screen.
4. Special case: 0 rounds → skip directly to "Everyone has numberwon!" results.

---

## Results Screen

### Score Display

- Shows "numdlewang #{day} {correct}/{total}"
- **10% chance** (seeded): the displayed correct and/or total values are replaced with random wrong numbers.

### Round Indicators

- Each round is represented by a circle:
  - Correct: ⬣ (filled hexagon)
  - Incorrect: ⬡ (empty hexagon)
- Displayed in order. For very long rounds (>50), truncate display with `…` and show count.

### Share Button

Clicking "Copy to clipboard" copies:

```
numdlewang #{day} {correct}/{total}: {circles}
https://numdlewang.vercel.app
```

(Same potentially-glitched correct/total as displayed.)

---

## Storage

- Results for the current day are stored in a **cookie** named `numdlewang_result`.
- Cookie value is a JSON string: `{ date: "YYYY-MM-DD", results: boolean[], seen: boolean }`.
- Cookie expires at end of the day (set `expires` to the next midnight).
- If user revisits on the same day and `seen: true`, jump directly to Results screen.
- If user revisits on the same day and `seen: false`, resume from where they left off (restore `results` array as completed rounds).

---

## Countdown Timer

- Displayed at the bottom of results: "Next Puzzle available in {HH:MM:SS}"
- Counts down to local midnight.
- **6% chance** (seeded): the displayed countdown is replaced with a random nonsense time string (e.g. `47:91:03` or `-12:00:99`).

---

## Puzzle Number

- Calculated as days elapsed since a fixed epoch: `2024-01-01`.
- Displayed as `#N` (e.g. `#532`).

---

## UI / Style

- Dark background, monospace/retro feel, inspired by e6dle.
- Hex/circle motif for round indicators.
- Responsive: works on mobile and desktop.
- No frameworks beyond React + CSS modules (or Tailwind).
- Animate round reveals (flip or fade).

---

## Edge Cases

- **0 rounds**: show "Everyone has numberwon!" immediately, still store result, show share button.
- **Very many rounds (e.g. 500)**: paginate or scroll; show summary only in share text.
- **Hieroglyphics**: ensure font fallback supports Unicode block `𓀀`–`𓐮`.
