/**
 * GET /api/convert?q=عشرين ألف ريال: the Darija money parser as a public JSON API.
 *
 *   q        the phrase (Arabic script, Arabizi, French, English or digits)
 *   unit     unit to assume when none is said: dirham | rial | santim | eur | usd … (default rial)
 *   region   general | oriental | rif | north (default general)
 *   franc    santim | dirham: what "franc" means (default santim, 1/100 DH)
 */
import { parseAmount } from '../src/lib/parse.js'
import { FOREIGN_IDS, resolveUnits, UNIT_IDS, type FrancMode, type ForeignId, type PresetId, type UnitId } from '../src/lib/conventions.js'
import { fromDirham, sayIt, toDirham } from '../src/lib/convert.js'
import { latest } from './rates.js'

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS' }
const json = (status: number, data: unknown, cache = 'public, max-age=60, s-maxage=600') =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'content-type': 'application/json; charset=utf-8', 'cache-control': cache } })

export async function convert(url: string, getRates = () => latest(FOREIGN_IDS.map((id) => id.toUpperCase()))) {
  const u = new URL(url)
  const q = (u.searchParams.get('q') ?? '').slice(0, 200)
  const unit = (UNIT_IDS as readonly string[]).includes(u.searchParams.get('unit') ?? '') ? (u.searchParams.get('unit') as UnitId) : 'rial'
  const region = (['general', 'oriental', 'rif', 'north'] as const).find((r) => r === u.searchParams.get('region')) ?? 'general'
  const franc: FrancMode = u.searchParams.get('franc') === 'dirham' ? 'dirham' : 'santim'
  if (!q.trim()) return { status: 400, body: { error: 'missing_q', message: 'Pass the phrase as ?q=' } }

  const parsed = parseAmount(q, unit)
  if (!parsed) return { status: 422, body: { error: 'not_understood', message: 'No amount found in the phrase.', q } }

  let rates: Partial<Record<ForeignId, number>> = {}
  let ratesUpdated: number | null = null
  if (parsed.segments.some((s) => (FOREIGN_IDS as readonly string[]).includes(s.unit)) || u.searchParams.get('foreign') !== '0') {
    try {
      const r = await getRates()
      rates = Object.fromEntries(Object.entries(r.rates).map(([code, v]) => [code.toLowerCase(), v]))
      ratesUpdated = r.updated
    } catch {
      /* foreign units stay null */
    }
  }
  const units = resolveUnits(region as PresetId, {}, rates as Record<ForeignId, number>, franc)
  const { dirham, missing } = toDirham(parsed.segments, units)
  return {
    status: 200,
    body: {
      q,
      region,
      franc,
      segments: parsed.segments,
      multiplier: parsed.multiplier,
      dirham,
      missing,
      values: dirham === null ? null : fromDirham(dirham, units),
      sayIt: dirham === null ? [] : sayIt(dirham, units),
      ratesUpdated,
    },
  }
}

export async function GET(request: Request): Promise<Response> {
  const { status, body } = await convert(request.url)
  return json(status, body, status === 200 ? undefined : 'no-store')
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS })
}
