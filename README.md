# Darija Money Converter

> Convert Moroccan everyday money slang — rial, franc/santim, doro — into standard Dirham, with regional presets.

**Status:** pre-alpha scaffold (no code yet). **Feasibility rating:** 8/10 — genuinely Morocco-specific niche, very buildable.
**Author:** Oussama EL HADJI. Part of the Bosaj ideas portfolio (sibling repo: `dual_portfolio_hub`).

---

## Problem

In Morocco people quote prices in rial, franc/santim, or doro, and the convention changes by region/city — yet it is all Dirham. Visitors and even locals from other regions get confused. This is a dialectal-numbering problem, not a currency exchange.

## Why build it (gap analysis)

General currency converters do not touch this because no exchange rate is involved — it is a fixed multiplier that depends on the regional convention. No dedicated tool was found.

## Prior art & open bases to fork

- **(none — new)** — No dominant open repo; this is a small rules-engine + UI you build fresh.

## Proposed architecture

1. A config table of regional conventions mapping each slang unit to a Dirham factor.
2. Region selector (defaults to a common convention) overrides the factors.
3. Input a number + unit → output Dirham (and the other slang equivalents).
4. Offline-first PWA so it works in a market with no signal.

## Tech stack (proposed)

- Pure logic: a multiplier/rules engine + regional presets (no backend needed)
- Web: React + Vite, installable PWA, works offline
- i18n: Arabic / Darija / French, with voice or keypad number input
- Reverse conversion (Dirham → local slang) too

## Roadmap

- v0.1 — core converter for the most common conventions (rial, franc, Dirham).
- v0.2 — regional presets (per city/region) + reverse conversion.
- v0.3 — Darija voice / spoken-number input.
- v0.4 — polished PWA, shareable price cards.

---

## For LLM agents & contributors continuing this project

This repo is a **scaffold**: README + standard files, no implementation yet. If you are an AI agent asked to "continue developing", read this section first.

- VERIFY the ratios before shipping — they are commonly cited as: 1 rial ≈ 1/20 Dirham (5 santim), 1 franc = 1 santim = 1/100 Dirham, doro ≈ 5 santim in some regions — but these vary by region and MUST be confirmed with locals per city. Treat the ratio table as data to validate, not as fact baked into code.
- Keep the conversion table as an external JSON config, not hard-coded, so regional corrections are one-line edits.
- The whole app can be client-side; do not add a backend.

**Ground rules:** keep this README in sync with reality as you build; prefer forking/reusing the bases above over greenfield code; write tests for anything correctness-critical; never commit secrets (see `.gitignore`); follow Conventional Commits (see `CONTRIBUTING.md`).

## Getting started

```bash
# nothing to run yet — this is a scaffold.
# npm install && npm run dev   # once code lands
```

## License

[MIT](LICENSE) — © 2026 Oussama EL HADJI
