# 1. Architecture

1. A config table of regional conventions mapping each slang unit to a Dirham factor.
2. Region selector (defaults to a common convention) overrides the factors.
3. Input a number + unit → output Dirham (and the other slang equivalents).
4. Offline-first PWA so it works in a market with no signal.

## Proposed stack
- Pure logic: a multiplier/rules engine + regional presets (no backend needed)
- Web: React + Vite, installable PWA, works offline
- i18n: Arabic / Darija / French, with voice or keypad number input
- Reverse conversion (Dirham → local slang) too

## Open bases to fork
- **(none — new)** — No dominant open repo; this is a small rules-engine + UI you build fresh.
