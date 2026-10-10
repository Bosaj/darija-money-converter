/**
 * GET /api/rates: Moroccan Dirham exchange rates with daily change and a
 * 30-day history, merged from two free sources and cached at the CDN.
 *
 *   ?symbols=EUR,USD   subset of currencies (default: all supported)
 *   ?days=30           history length, 2..60 (default 30)
 *
 * Response values are "MAD per 1 unit of the foreign currency".
 * Open to other sites (CORS *); attribution: ExchangeRate-API, fawazahmed0/currency-api.
 */

export const SUPPORTED = ['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'SAR', 'AED'] as const
export type Code = (typeof SUPPORTED)[number]

export interface RatesPayload {
  base: 'MAD'
  updated: number // epoch ms of the latest rate
  source: string
  rates: Record<string, { mad: number; change: number | null }>
  history: { dates: string[]; series: Record<string, (number | null)[]> }
}

type Fetch = typeof fetch

async function getJson<T>(url: string, f: Fetch, ms = 4500): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await f(url, { signal: ctrl.signal, headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

const round = (n: number) => Math.round(n * 1e4) / 1e4
const invert = (perMad: number | undefined) => (perMad && perMad > 0 ? round(1 / perMad) : null)

/** Today's MAD-per-unit from ExchangeRate-API, falling back to the fawazahmed0 API. */
export async function latest(codes: readonly string[], f: Fetch = fetch): Promise<{ rates: Record<string, number>; updated: number; source: string }> {
  try {
    const j = await getJson<{ result: string; time_last_update_unix: number; rates: Record<string, number> }>('https://open.er-api.com/v6/latest/MAD', f)
    if (j.result !== 'success') throw new Error('er-api')
    const rates: Record<string, number> = {}
    for (const c of codes) {
      const v = invert(j.rates[c])
      if (v) rates[c] = v
    }
    if (Object.keys(rates).length === codes.length) return { rates, updated: j.time_last_update_unix * 1000, source: 'exchangerate-api.com' }
  } catch {
    /* fall through */
  }
  const j = await fawaz('latest', f)
  const rates: Record<string, number> = {}
  for (const c of codes) {
    const v = invert(j.mad[c.toLowerCase()])
    if (v) rates[c] = v
  }
  return { rates, updated: Date.parse(`${j.date}T00:00:00Z`), source: 'fawazahmed0/currency-api' }
}

/** One day of the fawazahmed0 API (jsDelivr first, Cloudflare Pages mirror second). */
export async function fawaz(date: string, f: Fetch = fetch): Promise<{ date: string; mad: Record<string, number> }> {
  try {
    return await getJson(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/mad.min.json`, f)
  } catch {
    return await getJson(`https://${date}.currency-api.pages.dev/v1/currencies/mad.min.json`, f)
  }
}

export function lastDates(days: number, from = Date.now()): string[] {
  const out: string[] = []
  const d = new Date(from)
  for (let i = days - 1; i >= 0; i--) out.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - i)).toISOString().slice(0, 10))
  return out
}

export async function history(codes: readonly string[], days: number, f: Fetch = fetch, now = Date.now()) {
  const dates = lastDates(days, now)
  const results = await Promise.allSettled(dates.map((d) => fawaz(d, f)))
  const series: Record<string, (number | null)[]> = {}
  for (const c of codes) series[c] = results.map((r) => (r.status === 'fulfilled' ? invert(r.value.mad[c.toLowerCase()]) : null))
  return { dates, series }
}

/** Change of the last known point against the one before it, in %. */
export function dailyChange(points: (number | null)[]): number | null {
  const known = points.filter((p): p is number => p !== null)
  if (known.length < 2) return null
  const [prev, last] = known.slice(-2) as [number, number]
  return Math.round(((last - prev) / prev) * 1e4) / 100
}

export async function buildPayload(codes: readonly string[], days: number, f: Fetch = fetch, now = Date.now()): Promise<RatesPayload> {
  const [today, hist] = await Promise.all([latest(codes, f), history(codes, days, f, now)])
  const rates: RatesPayload['rates'] = {}
  for (const c of codes) if (today.rates[c]) rates[c] = { mad: today.rates[c]!, change: dailyChange(hist.series[c] ?? []) }
  return { base: 'MAD', updated: today.updated, source: today.source, rates, history: hist }
}

export function parseQuery(url: string): { codes: Code[]; days: number } {
  const u = new URL(url)
  const wanted = (u.searchParams.get('symbols') ?? '').toUpperCase().split(',').filter(Boolean)
  const codes = (wanted.length ? SUPPORTED.filter((c) => wanted.includes(c)) : [...SUPPORTED]) as Code[]
  const days = Math.min(60, Math.max(2, Number(u.searchParams.get('days')) || 30))
  return { codes: codes.length ? codes : [...SUPPORTED], days }
}

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS' }

export async function GET(request: Request): Promise<Response> {
  const { codes, days } = parseQuery(request.url)
  try {
    const payload = await buildPayload(codes, days)
    return new Response(JSON.stringify(payload), {
      headers: {
        ...CORS,
        'content-type': 'application/json; charset=utf-8',
        // fresh for 5 min in browsers, 1 h at the CDN, served stale for a day while revalidating
        'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'upstream', message: 'Rate providers are unreachable right now.' }), {
      status: 502,
      headers: { ...CORS, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    })
  }
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS })
}
