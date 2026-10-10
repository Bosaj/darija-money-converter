import type { ForeignId } from './conventions.js'

/** Dirham value of ONE unit of each foreign currency. */
export type MadRates = Record<ForeignId, number>

export interface RateState {
  rates: MadRates
  updated: number // epoch ms of the provider's last update
  source: 'live' | 'cache' | 'snapshot'
  change?: Partial<Record<ForeignId, number | null>> // % vs previous day
  history?: { dates: string[]; series: Partial<Record<ForeignId, (number | null)[]>> }
  fetchedAt?: number
}

const CODES: Record<ForeignId, string> = { eur: 'EUR', usd: 'USD', gbp: 'GBP', cad: 'CAD', chf: 'CHF', sar: 'SAR', aed: 'AED' }
const IDS = Object.keys(CODES) as ForeignId[]

/**
 * Offline fallback: mid-market rates published by ExchangeRate-API on
 * 10 Oct 2026. Shown as "approximate" with this date until a live fetch works.
 */
export const SNAPSHOT: RateState = {
  rates: { eur: 10.9449, usd: 9.9509, gbp: 12.9308, cad: 6.8527, chf: 11.7636, sar: 2.6536, aed: 2.7096 },
  updated: Date.UTC(2026, 9, 10, 0, 2),
  source: 'snapshot',
}

export const API_URL = '/api/rates'
export const RATES_URL = 'https://open.er-api.com/v6/latest/MAD'
const CACHE_KEY = 'dmc:rates'
export const STALE_MS = 15 * 60_000
export const REFRESH_MS = 15 * 60_000

interface ApiResponse {
  result: string
  time_last_update_unix: number
  rates: Record<string, number>
}

interface OwnApiResponse {
  base: 'MAD'
  updated: number
  rates: Record<string, { mad: number; change: number | null }>
  history?: { dates: string[]; series: Record<string, (number | null)[]> }
}

/** Convert ExchangeRate-API's "foreign per 1 MAD" into "MAD per 1 foreign". */
export function fromApi(json: ApiResponse): RateState | null {
  if (json.result !== 'success' || !json.rates) return null
  const rates = {} as MadRates
  for (const [id, code] of Object.entries(CODES) as [ForeignId, string][]) {
    const perMad = json.rates[code]
    if (!perMad || perMad <= 0) return null
    rates[id] = Math.round((1 / perMad) * 1e4) / 1e4
  }
  return { rates, updated: json.time_last_update_unix * 1000, source: 'live' }
}

/** Map this app's /api/rates payload (rates + daily change + history). */
export function fromOwnApi(json: OwnApiResponse): RateState | null {
  if (json.base !== 'MAD' || !json.rates) return null
  const rates = {} as MadRates
  const change: RateState['change'] = {}
  for (const id of IDS) {
    const r = json.rates[CODES[id]]
    if (!r?.mad) return null
    rates[id] = r.mad
    change[id] = r.change
  }
  const series: NonNullable<RateState['history']>['series'] = {}
  if (json.history) for (const id of IDS) series[id] = json.history.series[CODES[id]] ?? []
  return { rates, change, updated: json.updated, source: 'live', history: json.history ? { dates: json.history.dates, series } : undefined }
}

export function readCache(): RateState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as RateState
    return v && v.rates && v.updated ? { ...v, source: 'cache' } : null
  } catch {
    return null
  }
}

function writeCache(state: RateState) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable */
  }
}

/** Own API first (history + change), then the provider directly (rates only). */
export async function fetchRates(fetchImpl: typeof fetch = fetch): Promise<RateState | null> {
  try {
    const res = await fetchImpl(API_URL)
    if (res.ok) {
      const state = fromOwnApi((await res.json()) as OwnApiResponse)
      if (state) {
        const out = { ...state, fetchedAt: Date.now() }
        writeCache(out)
        return out
      }
    }
  } catch {
    /* fall back to the provider */
  }
  try {
    const res = await fetchImpl(RATES_URL)
    if (!res.ok) return null
    const state = fromApi((await res.json()) as ApiResponse)
    if (state) {
      const prev = readCache()
      const out = { ...state, history: prev?.history, change: prev?.change, fetchedAt: Date.now() }
      writeCache(out)
      return out
    }
    return null
  } catch {
    return null
  }
}

/** Best rates available right now without waiting for the network. */
export function initialRates(): RateState {
  const cached = readCache()
  return cached && cached.updated >= SNAPSHOT.updated ? cached : SNAPSHOT
}
