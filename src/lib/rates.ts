import type { ForeignId } from './conventions.js'

/** Dirham value of ONE unit of each foreign currency. */
export type MadRates = Record<ForeignId, number>

export interface RateState {
  rates: MadRates
  updated: number // epoch ms of the provider's last update
  source: 'live' | 'cache' | 'snapshot'
}

const CODES: Record<ForeignId, string> = { eur: 'EUR', usd: 'USD', gbp: 'GBP', cad: 'CAD', chf: 'CHF', sar: 'SAR', aed: 'AED' }

/**
 * Offline fallback: mid-market rates published by ExchangeRate-API on
 * 10 Oct 2026. Shown as "approximate" with this date until a live fetch works.
 */
export const SNAPSHOT: RateState = {
  rates: { eur: 10.9449, usd: 9.9509, gbp: 12.9308, cad: 6.8527, chf: 11.7636, sar: 2.6536, aed: 2.7096 },
  updated: Date.UTC(2026, 9, 10, 0, 2),
  source: 'snapshot',
}

export const RATES_URL = 'https://open.er-api.com/v6/latest/MAD'
const CACHE_KEY = 'dmc:rates'
export const STALE_MS = 6 * 3_600_000

interface ApiResponse {
  result: string
  time_last_update_unix: number
  rates: Record<string, number>
}

/** Convert the API's "foreign per 1 MAD" into "MAD per 1 foreign". */
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

export async function fetchRates(fetchImpl: typeof fetch = fetch): Promise<RateState | null> {
  try {
    const res = await fetchImpl(RATES_URL)
    if (!res.ok) return null
    const state = fromApi((await res.json()) as ApiResponse)
    if (state) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(state))
      } catch {
        /* storage unavailable */
      }
    }
    return state
  } catch {
    return null
  }
}

/** Best rates available right now without waiting for the network. */
export function initialRates(): RateState {
  const cached = readCache()
  return cached && cached.updated > SNAPSHOT.updated ? cached : SNAPSHOT
}
