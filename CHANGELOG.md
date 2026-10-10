# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [Unreleased]

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
