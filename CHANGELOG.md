# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [Unreleased]

## [0.9.1] - 2026-10-17
### Fixed
- The page language and direction (rtl/ltr) are set by an inline script before the first paint, using the same rule as the app. The French/English flip from the Arabic default used to move the whole page (CLS 0.8 on desktop).
- The coin's flip button is a transparent overlay, so its accessible name is clean (the embossed inscription is drawn three times).
- The "درهم / DH" unit next to the result is no longer dimmed (contrast 3.97:1 → 7:1).

## [0.9.0] - 2026-10-17
### Changed
- "Read the result aloud" speaks the interface language: Darija in Arabic, a French voice in French ("Cela fait 1 000 dirhams."), an English voice in English. The saved Arabic voice is only used for Arabic; Darija phrases stay Darija. (#24)

### Fixed
- Layout shift (CLS 0.81 → ~0) from the background glow: it was sized to the window, so the scrollbar appearing moved it. Glows are painted on the fixed layer and the scrollbar gutter is reserved. (#24)
- Secondary text contrast now passes WCAG AA in both themes (light 5.5:1, dark 5.7:1); the result label is no longer dimmed. (#24)
- The coin button's accessible name includes its visible inscription. (#24)

### Added
- `npm run e2e:voice`: end-to-end voice check with a fake microphone and speaker. It covers typed text, all four mic languages (Darija, Standard Arabic, French, English) with live words, read-aloud voices per interface language, Darija phrases and mic-permission errors in Arabic, French and English: 25 checks. (#24)

## [0.8.0] - 2026-10-17
### Added
- Rif region preset (Nador, Al Hoceima, Driouch, Zaio, Imzouren): 1 douro = 50 santim = 10 rial (1 DH = 2 douros), and the new unit **الميا** (short for مية دورو) = 50 DH = 1,000 rial, so `جوج د الميا` = 100 DH. "Say it like a local" adds the الميا phrase there. Both values are flagged unverified. (#22)
- `GET /api/convert?region=rif`.

### Changed
- Oriental preset is now Oujda, Berkane, Taourirt, Jerada (douro = 5 santim, the same as a rial); Nador, Al Hoceima and Driouch detect as Rif.
- The equivalents grid shows الميا only where it exists, and an odd last cell spans the full row.

## [0.7.0] - 2026-10-10
### Added
- The franc is its own unit: `500 فرنك` = 5 DH, with a "What is a franc?" switch in the region dialog (franc = centime by default, or franc = dirham, flagged as unconfirmed). The equivalents grid names the franc next to the santim, and `GET /api/convert` takes `franc=santim|dirham`. (#19)
- A page background built from the app's subject: a faint zellige field, flag-green and coin-gold glows, and slowly drifting 10 DH coins, 20/50/100/200 DH note silhouettes and the words people say. It is decorative, still under reduced motion, and lighter on phones. (#20)

### Fixed
- Example chips wrap instead of being cut off at the screen edge, and the result card's buttons move below the amount instead of covering it on narrow phones. (#18)

## [0.6.0] - 2026-10-10
### Added
- `GET /api/rates`: latest MAD rates merged with a 30-day history and the daily change, CDN-cached and CORS-open. `GET /api/convert`: the Darija parser as a JSON API. The app shows ▲/▼ change, 30-day sparklines and a live indicator, and refreshes every 15 minutes. (#13)
- Coin logo with a raised, green-enamelled, interlaced Moroccan star; favicon and PWA icons regenerated. (#14)
- Voice: mic language picker (Darija / Standard Arabic / French / English), live interim text, a level meter and clear error states. The parser now understands Standard Arabic, French and English number words. Text-to-speech prefers Moroccan Arabic voices and adds a voice and speed picker plus "read the result". (#15)
- Detect my place: offline nearest-city matching sets the region preset; abroad, bare numbers switch to the home currency; a time-zone hint works without permission. (#16)

### Fixed
- Shared parser modules use explicit `.js` import extensions and a JSON import attribute, so Vercel's Node ESM functions can load them.

## [0.5.0] - 2026-10-10
### Added
- Euro, US dollar and optional GBP, CAD, CHF, SAR, AED as parser units: words, symbols (`50€`, `$20`) and two-word names that don't clash with the Moroccan rial or franc. Live mid-market rates from ExchangeRate-API, a device cache, a dated offline snapshot, attribution, and an "approximate" note on converted totals. (#6)
- Bimetallic coin logo (brass ring, nickel centre, reeded edge, zellige star, struck inscription) with a 3D flip and a light sweep. PWA icons, favicon and share card were regenerated from it. (#7)
- Souk kit, haggle tab: −10/−20/−30% counter-offers spoken in Darija, plus useful phrases with text-to-speech. (#8)
- Souk kit, pay tab: the fewest Moroccan notes and coins to hand over. (#9)
- Souk kit, learn tab: a cheat sheet of common amounts and a price quiz with a streak counter. (#10)
- Calculator quantities: `3 x 15 dh`, `500 ريال × 4`. (#11)

### Changed
- Spoken phrases round to 5 santim, so converted amounts read naturally.
- The hero number scales with its length instead of truncating on small phones.
- Souk kit sits below the results on phones.

## [0.4.0] - 2026-10-10
First working release: all four roadmap milestones (v0.1–v0.4).

### Added
- Darija parser for Arabic script, Latin Arabizi, French and digits, with Moroccan conventions (bare "مليون" = million santim, "عشرين درهم و خمسين" = 20.50 DH, halves/quarters, mixed units). (#1)
- External conversion table `src/data/conventions.json` with verified core ratios and flagged, unverified regional values. (#1)
- Regional presets (general, Oriental, North, custom) and reverse conversion: every unit at once plus "say it like a local" phrases in Arabic and Arabizi, with text-to-speech. (#2)
- Voice input through the Web Speech API (`ar-MA`), parsed by the same engine. (#3)
- Installable offline PWA (service worker, self-hosted Readex Pro font, generated icons), shareable `?q=` links and 1080×1350 share cards via the Web Share API. (#4)
- Arabic (RTL), French and English UI; light/dark/system theme; conversion history.
- "Regional value" issue form so locals can correct unverified values.
- CI (type-check, 64 tests, build) and Vercel config with security and caching headers.

### Changed
- Replaced the local Streamlit prototype with the client-side React + Vite app described in the architecture.

## [0.0.0] - 2026-10-04
### Added
- Initial repository scaffold: README (with architecture, roadmap and an LLM-handoff section), LICENSE, .gitignore, CONTRIBUTING, issue/PR templates, and wiki pages.

[Unreleased]: https://github.com/Bosaj/darija-money-converter/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/Bosaj/darija-money-converter/releases/tag/v0.6.0
[0.5.0]: https://github.com/Bosaj/darija-money-converter/releases/tag/v0.5.0
[0.4.0]: https://github.com/Bosaj/darija-money-converter/releases/tag/v0.4.0
