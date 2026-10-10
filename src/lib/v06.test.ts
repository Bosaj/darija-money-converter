import { describe, expect, it } from 'vitest'
import { parseAmount } from './parse'
import { toDirham } from './convert'
import { resolveUnits } from './conventions'
import { fromOwnApi, fetchRates } from './rates'
import { countryFor, nearestCity, placeFor, timezoneCurrency } from './place'
import { mapSttError, rankVoices } from '../hooks/voice'
import { buildPayload, dailyChange, lastDates, parseQuery } from '../../api/rates'
import { convert } from '../../api/convert'

const general = resolveUnits('general')
const dh = (text: string) => {
  const p = parseAmount(text, 'rial')
  return p ? toDirham(p.segments, general).dirham : null
}

describe('speech-engine wording (Standard Arabic, French, English)', () => {
  it.each([
    ['عشرون ألف ريال', 1000],
    ['عشرون درهما', 20],
    ['ثلاثمائة درهم', 300],
    ['ثلاث مائة درهم', 300],
    ['مئتان درهم', 200],
    ['خمسة عشر درهما', 15],
    ['ألفان درهم', 2000],
    ['خمسون ألف ريال', 2500],
    ['اثنان مليون', 20_000],
    ['vingt mille rials', 1000],
    ['quatre-vingt-dix dirhams', 90],
    ['quatre vingts euros', null],
    ['deux cents dirhams', 200],
    ['cent cinquante dirhams', 150],
    ['twenty five dirhams', 25],
    ['fifteen thousand rial', 750],
    ['two hundred dirhams', 200],
  ])('%s → %s DH', (text, expected) => {
    if (expected === null) expect(parseAmount(text, 'rial')?.segments[0]).toMatchObject({ amount: 80, unit: 'eur' })
    else expect(dh(text)).toBeCloseTo(expected, 6)
  })
})

describe('place detection (offline)', () => {
  it('finds the nearest Moroccan city and its preset', () => {
    expect(nearestCity(34.68, -1.91).city.name).toBe('Oujda')
    expect(placeFor(35.77, -5.8)).toMatchObject({ kind: 'morocco', city: { name: 'Tangier', preset: 'north' } })
    expect(placeFor(34.93, -2.33)).toMatchObject({ kind: 'morocco', city: { preset: 'oriental' } })
    expect(placeFor(33.58, -7.6)).toMatchObject({ kind: 'morocco', city: { preset: 'general' } })
  })

  it('maps people abroad to their home currency', () => {
    expect(placeFor(48.85, 2.35)).toEqual({ kind: 'abroad', country: 'FR', currency: 'eur' })
    expect(placeFor(46.2, 6.14)).toEqual({ kind: 'abroad', country: 'CH', currency: 'chf' })
    expect(placeFor(45.5, -73.57)).toEqual({ kind: 'abroad', country: 'CA', currency: 'cad' })
    expect(placeFor(40.71, -74.0)).toEqual({ kind: 'abroad', country: 'US', currency: 'usd' })
    expect(countryFor(-33.9, 151.2)).toBeNull()
  })

  it('guesses a currency from the time zone without asking for location', () => {
    expect(timezoneCurrency('Europe/Paris')).toBe('eur')
    expect(timezoneCurrency('Europe/London')).toBe('gbp')
    expect(timezoneCurrency('America/Toronto')).toBe('cad')
    expect(timezoneCurrency('America/New_York')).toBe('usd')
    expect(timezoneCurrency('Africa/Casablanca')).toBeNull()
  })
})

describe('voice helpers', () => {
  it('maps recognition errors to friendly states', () => {
    expect(mapSttError('not-allowed')).toBe('permission')
    expect(mapSttError('no-speech')).toBe('silence')
    expect(mapSttError('network')).toBe('network')
    expect(mapSttError('weird')).toBe('unknown')
  })

  it('ranks Moroccan, then natural Arabic voices first and drops non-Arabic ones', () => {
    const v = (name: string, lang: string, localService = true) => ({ name, lang, localService, voiceURI: name, default: false }) as SpeechSynthesisVoice
    const ranked = rankVoices([v('Google US', 'en-US'), v('Maged', 'ar-SA'), v('Microsoft Hamed Online (Natural)', 'ar-SA', false), v('Microsoft Jamal Online (Natural)', 'ar-MA', false)])
    expect(ranked.map((x) => x.name)).toEqual(['Microsoft Jamal Online (Natural)', 'Microsoft Hamed Online (Natural)', 'Maged'])
  })
})

describe('live rates API', () => {
  const day = (date: string, eur: number, usd: number) => ({ date, mad: { eur, usd, gbp: 0.077, cad: 0.146, chf: 0.085, sar: 0.377, aed: 0.369 } })
  const fake = (async (url: string) => {
    if (url.includes('open.er-api.com')) return new Response(JSON.stringify({ result: 'success', time_last_update_unix: 1791590400, rates: { EUR: 0.1, USD: 0.1, GBP: 0.077, CAD: 0.146, CHF: 0.085, SAR: 0.377, AED: 0.369 } }))
    const m = /@(\d{4}-\d{2}-\d{2})\//.exec(url)
    if (m) return new Response(JSON.stringify(day(m[1]!, m[1]!.endsWith('10') ? 0.1 : 0.098, 0.1)))
    return new Response('', { status: 404 })
  }) as unknown as typeof fetch

  it('computes the change against the previous known day', () => {
    expect(dailyChange([10, null, 10.5])).toBe(5)
    expect(dailyChange([null, 10])).toBeNull()
  })

  it('lists the last N UTC dates', () => {
    expect(lastDates(3, Date.UTC(2026, 9, 10, 12))).toEqual(['2026-10-08', '2026-10-09', '2026-10-10'])
  })

  it('parses ?symbols and clamps ?days', () => {
    expect(parseQuery('https://x/api/rates?symbols=usd,eur,xxx&days=999')).toEqual({ codes: ['EUR', 'USD'], days: 60 })
    expect(parseQuery('https://x/api/rates').codes).toHaveLength(7)
  })

  it('merges latest rates with history and daily change', async () => {
    const p = await buildPayload(['EUR', 'USD'], 3, fake, Date.UTC(2026, 9, 10, 12))
    expect(p.rates.EUR).toEqual({ mad: 10, change: expect.closeTo(-2, 1) })
    expect(p.history.dates).toEqual(['2026-10-08', '2026-10-09', '2026-10-10'])
    expect(p.history.series.EUR).toEqual([10.2041, 10.2041, 10])
    expect(p.source).toBe('exchangerate-api.com')
  })

  it('the app maps its own API payload and falls back to the provider', async () => {
    const own = { base: 'MAD' as const, updated: 1, rates: Object.fromEntries(['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'SAR', 'AED'].map((c) => [c, { mad: 10, change: 0.5 }])), history: { dates: ['d'], series: { EUR: [10] } } }
    expect(fromOwnApi(own)).toMatchObject({ rates: { eur: 10 }, change: { usd: 0.5 }, history: { series: { eur: [10] } } })
    const viaOwn = await fetchRates((async (url: string) => (url === '/api/rates' ? new Response(JSON.stringify(own)) : new Response('', { status: 500 }))) as unknown as typeof fetch)
    expect(viaOwn?.change?.eur).toBe(0.5)
    const viaProvider = await fetchRates(fake)
    expect(viaProvider?.rates.eur).toBe(10)
  })
})

describe('convert API', () => {
  const rates = async () => ({ rates: { EUR: 10, USD: 9, GBP: 13, CAD: 7, CHF: 12, SAR: 2.6, AED: 2.7 }, updated: 1, source: 'test' })

  it('converts a Darija phrase with foreign units', async () => {
    const r = await convert('https://x/api/convert?q=' + encodeURIComponent('100 euro w jouj dlmelyoun'), rates)
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({ dirham: 21_000, multiplier: 1, missing: [] })
  })

  it('reports missing and unparseable input', async () => {
    expect((await convert('https://x/api/convert', rates)).status).toBe(400)
    expect((await convert('https://x/api/convert?q=salam', rates)).status).toBe(422)
    const doro = await convert('https://x/api/convert?q=100%20doro&region=oriental', rates)
    expect(doro.body).toMatchObject({ dirham: 5 })
  })
})
