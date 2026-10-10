import { spellCount, spellNumber } from './spell'

/* ---------- Haggling ---------- */

export interface Offer {
  pct: number // e.g. 0.8 = offer 80 %
  dirham: number
  ar: string
  latin: string
}

function niceRound(dh: number): number {
  if (dh >= 1000) return Math.round(dh / 50) * 50
  if (dh >= 100) return Math.round(dh / 5) * 5
  if (dh >= 20) return Math.round(dh)
  return Math.round(dh * 2) / 2
}

/** "How would I say this price?" — rial for everyday amounts, Dirham above that. */
export function sayPrice(dh: number): { ar: string; latin: string } {
  const rial = Math.round(dh * 20)
  if (Math.abs(dh * 20 - rial) < 1e-6 && dh <= 1000) return { ar: spellCount(rial, 'ريال', 'ريال', 'ar'), latin: spellCount(rial, 'ryal', 'ryal', 'latin') }
  const whole = Math.round(dh)
  return { ar: spellCount(whole, 'درهم', 'دراهم', 'ar'), latin: spellCount(whole, 'derham', 'drahem', 'latin') }
}

/** Counter-offers at 90/80/70 % of the asking price, rounded the way people round. */
export function offers(dirham: number): Offer[] {
  if (!(dirham >= 2)) return []
  const seen = new Set<number>()
  const out: Offer[] = []
  for (const pct of [0.9, 0.8, 0.7]) {
    const dh = niceRound(dirham * pct)
    if (dh >= dirham || dh <= 0 || seen.has(dh)) continue
    seen.add(dh)
    const said = sayPrice(dh)
    out.push({ pct, dirham: dh, ar: `نعطيك ${said.ar}`, latin: `n3tik ${said.latin}` })
  }
  return out
}

export interface Phrase {
  ar: string
  latin: string
  en: string
  fr: string
}

export const SOUK_PHRASES: Phrase[] = [
  { ar: 'بشحال هادي؟', latin: 'b-chhal hadi?', en: 'How much is this?', fr: 'C’est combien ?' },
  { ar: 'غالية بزاف', latin: 'ghalya bzaf', en: 'That’s too expensive', fr: 'C’est trop cher' },
  { ar: 'نقص شوية', latin: 'nqess chwiya', en: 'Lower it a little', fr: 'Baissez un peu' },
  { ar: 'شنو آخر ثمن؟', latin: 'chnou akhir taman?', en: 'What’s your last price?', fr: 'C’est quoi le dernier prix ?' },
  { ar: 'واخا، غادي ناخدها', latin: 'wakha, ghadi nakhodha', en: 'OK, I’ll take it', fr: 'D’accord, je la prends' },
  { ar: 'شكرا، الله يعاونك', latin: 'choukran, llah y3awnek', en: 'Thanks, good luck to you', fr: 'Merci, bon courage' },
]

/* ---------- Cash breakdown ---------- */

export interface Piece {
  value: number // in DH
  count: number
  kind: 'note' | 'coin'
}

export const NOTES = [200, 100, 50, 20]
export const COINS = [10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05]

/** Fewest notes and coins (current Moroccan series), rounded to 5 santim. */
export function breakdown(dirham: number): Piece[] {
  let santim = Math.round((dirham * 100) / 5) * 5
  if (!(santim > 0)) return []
  const out: Piece[] = []
  for (const [list, kind] of [
    [NOTES, 'note'],
    [COINS, 'coin'],
  ] as const) {
    for (const v of list) {
      const unit = Math.round(v * 100)
      const count = Math.floor(santim / unit)
      if (count > 0) {
        out.push({ value: v, count, kind })
        santim -= count * unit
      }
    }
  }
  return out
}

/* ---------- Learn mode ---------- */

export interface CheatRow {
  dirham: number
  ar: string
  latin: string
}

const CHEAT = [1, 5, 10, 20, 50, 100, 200, 500, 1000, 5000, 10_000, 15_000, 100_000]

export function cheatSheet(): CheatRow[] {
  return CHEAT.map((dh) => {
    if (dh >= 10_000) {
      const santim = dh * 100
      return { dirham: dh, ar: spellNumber(santim, 'ar'), latin: spellNumber(santim, 'latin') }
    }
    const r = dh * 20
    return { dirham: dh, ar: spellCount(r, 'ريال', 'ريال', 'ar'), latin: spellCount(r, 'ryal', 'ryal', 'latin') }
  })
}

export interface QuizQuestion {
  ar: string
  latin: string
  answer: number // DH
  choices: number[]
}

const RIAL_POOL = [100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 5000, 10_000, 20_000, 50_000, 100_000]
const MILLION_POOL = [1_000_000, 1_500_000, 2_000_000, 5_000_000, 10_000_000, 25_000_000]

export function quizQuestion(rand: () => number = Math.random): QuizQuestion {
  const useMillion = rand() < 0.25
  const pool = useMillion ? MILLION_POOL : RIAL_POOL
  const n = pool[Math.floor(rand() * pool.length)]!
  const answer = useMillion ? n / 100 : n / 20
  const ar = useMillion ? spellNumber(n, 'ar') : spellCount(n, 'ريال', 'ريال', 'ar')
  const latin = useMillion ? spellNumber(n, 'latin') : spellCount(n, 'ryal', 'ryal', 'latin')
  // classic confusions: number read as Dirham, as santim, off by ×10
  const wrong = useMillion ? [n / 20, answer * 10, answer / 10, n] : [n, n / 100, answer * 10, answer / 2]
  const choices = [answer]
  for (const w of wrong) if (w > 0 && !choices.includes(w) && choices.length < 4) choices.push(w)
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j]!, choices[i]!]
  }
  return { ar, latin, answer, choices }
}
