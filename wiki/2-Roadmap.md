# 2. Roadmap

- [x] v0.1 — core converter for the most common conventions (rial, franc, Dirham) — #1
- [x] v0.2 — regional presets (per city/region) + reverse conversion — #2
- [x] v0.3 — Darija voice / spoken-number input — #3
- [x] v0.4 — polished PWA, shareable price cards — #4 (released as v0.4.0)
- [x] v0.5 — euro/dollar and foreign currencies (live rates), coin logo, souk kit (haggle, pay, learn), calculator — #6–#11 (released as v0.5.0)

## Next
- Confirm the doro value city by city (use the "Regional value" issue form).
- Collect other local terms if they exist.
- Offline speech recognition for browsers without the Web Speech API.

## Notes for contributors / LLM agents
- Ratios live only in `src/data/conventions.json`. Unconfirmed values keep `"verified": false`.
- Parser changes need test cases in `src/lib/darija.test.ts`.
- Keep the app client-side.
