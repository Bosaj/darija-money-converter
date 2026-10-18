# Developer Setup & Contribution Guide

This guide provides instructions for configuring a local development environment for **حسبلي Hsabli** (`Bosaj/darija-money-converter`).

## Prerequisites

- Node.js 20+ (recommended: Node.js 22 LTS)
- npm 10+
- Modern browser with Web Speech API and Service Worker support

## Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Bosaj/darija-money-converter.git
cd darija-money-converter

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run test suite
npm test

# 5. Build production PWA
npm run build
```

## Continuous Integration & Quality Standards

- **Linting:** ESLint + TypeScript strict checks.
- **Testing:** Vitest unit test suite covering Darija tokenizer, regex parsing, Arabizi numerals, and conversion tables.
- **PWA Audit:** Lighthouse 100/100 PWA score.
