# 2. Roadmap

- v0.1 — core converter for the most common conventions (rial, franc, Dirham).
- v0.2 — regional presets (per city/region) + reverse conversion.
- v0.3 — Darija voice / spoken-number input.
- v0.4 — polished PWA, shareable price cards.

## Notes for contributors / LLM agents
- VERIFY the ratios before shipping — they are commonly cited as: 1 rial ≈ 1/20 Dirham (5 santim), 1 franc = 1 santim = 1/100 Dirham, doro ≈ 5 santim in some regions — but these vary by region and MUST be confirmed with locals per city. Treat the ratio table as data to validate, not as fact baked into code.
- Keep the conversion table as an external JSON config, not hard-coded, so regional corrections are one-line edits.
- The whole app can be client-side; do not add a backend.
