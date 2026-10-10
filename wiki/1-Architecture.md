# 1. Architecture

Client-side only: a React + Vite PWA. No backend, no analytics.

## Data flow
1. `src/data/conventions.json` holds every unit (Dirham factor, names, aliases, verified flag) and the regional presets.
2. `resolveUnits(preset, custom)` applies the active preset on top of the base table.
3. `parseAmount(text, defaultUnit)` normalises the text, tokenises Darija/Arabizi/French/digits and returns `[{amount, unit, implied}]` segments.
4. `toDirham(segments, units)` sums the segments; `fromDirham` and `sayIt` produce every unit and spoken phrases for the reverse direction.
5. The UI renders the result, a share card (canvas + Web Share API) and stores history and settings in localStorage.

## Moroccan conventions encoded in the parser
- A bare "مليون" / "مليار" means millions / milliards of **santim**.
- "عشرين درهم و خمسين" reads the trailing number as santim (20.50 DH).
- "ربع" is 4 before "مية" or "آلاف", and a quarter after "و" or before a singular magnitude ("ربع مليون").
- Clitics are peeled: و (and), ب (for), ال (the), د (of), ل.

## Modules
| File | Role |
|---|---|
| `lib/normalize.ts` | Unicode normalisation (hamza forms, ة/ه, harakat, Eastern digits) |
| `lib/lexicon.ts` | Number words in Arabic and Arabizi, unit aliases |
| `lib/parse.ts` | Text to segments |
| `lib/spell.ts` | Number to Darija words, noun agreement |
| `lib/convert.ts` | Conversions and "say it like a local" |
| `lib/shareCard.ts` | 1080×1350 price card |

## Quality
64 Vitest tests, including a spell → parse round trip in both scripts. CI runs type-check, tests and build on every PR.
