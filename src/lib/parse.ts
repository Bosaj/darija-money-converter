import { normalize } from './normalize.js'
import { hasAndPrefix, lookup, lookupPhrase, type Token } from './lexicon.js'
import type { UnitId } from './conventions.js'

export interface Segment {
  amount: number
  unit: UnitId
  /** true when the unit was not said and was inferred (default unit, "مليون" ⇒ santim, …). */
  implied: boolean
}

export interface ParseResult {
  segments: Segment[]
  unknown: string[]
  /** Quantity from "3 x 15 dh" / "500 ريال × 4"; segment amounts already include it. */
  multiplier: number
}

type Tok = (Token | { kind: 'lit'; value: number }) & { raw: string }

const NUMERIC = /^\d+(?:\.\d+)?$/

function toNumber(raw: string): number | null {
  // 1.250 / 1,250 / 12,500,000 → thousands separators (prices); 2,5 / 2.5 → decimal
  if (/^[1-9]\d{0,2}(?:[.,]\d{3})+$/.test(raw)) return Number(raw.replace(/[.,]/g, ''))
  const s = raw.replace(',', '.')
  return NUMERIC.test(s) ? Number(s) : null
}

function tokenize(text: string): { toks: Tok[]; unknown: string[] } {
  let s = normalize(text)
  s = s.replace(/د\.\s?م\.?/g, ' درهم ') // "100 د.م." abbreviation
  s = s.replace(/(\d)[\s  ](?=\d{3}(?!\d))/g, '$1') // "50 000" → "50000"
  const words = s
    .split(/[\s!?؟;:()"'«»\-–—/|*]+/)
    .map((w) => w.replace(/^[.,]+|[.,]+$/g, ''))
    .filter(Boolean)
  const toks: Tok[] = []
  const unknown: string[] = []
  for (let i = 0; i < words.length; i++) {
    const phrase = lookupPhrase(words, i)
    if (phrase) {
      toks.push({ ...phrase.token, raw: words.slice(i, i + phrase.len).join(' ') })
      i += phrase.len - 1
      continue
    }
    const raw = words[i]!
    const hit = lookup(raw)
    if (hit) {
      toks.push({ ...hit, raw })
      continue
    }
    const n = toNumber(raw)
    if (n !== null) {
      toks.push({ kind: 'lit', value: n, raw })
      continue
    }
    // "$20", "€50", "£10": symbol before the number
    const sym = /^([$€£])(\d+(?:[.,]\d+)?)(k?)$/i.exec(raw)
    if (sym) {
      const value = toNumber(sym[2]!)
      if (value !== null) {
        toks.push({ ...(lookup(sym[1]!) as Token), raw: sym[1]! }, { kind: 'lit', value: sym[3] ? value * 1000 : value, raw })
        continue
      }
    }
    const glued = /^(\d+(?:[.,]\d+)?)(.+)$/.exec(raw)
    if (glued) {
      const value = toNumber(glued[1]!)
      const rest = glued[2]!
      if (value !== null && (rest === 'k' || rest === 'K')) {
        toks.push({ kind: 'lit', value: value * 1000, raw })
        continue
      }
      const restHit = lookup(rest)
      if (value !== null && restHit) {
        toks.push({ kind: 'lit', value, raw }, { ...restHit, raw: rest })
        continue
      }
    }
    unknown.push(raw)
  }
  return { toks, unknown }
}

const QTY_BEFORE = /^\s*(\d+(?:[.,]\d+)?)\s*[x×*]\s*(?=\S)(.+)$/i
const QTY_AFTER = /^(.+?\S)\s*[x×*]\s*(\d+(?:[.,]\d+)?)\s*$/i

/** Split "3 x 15 dh" / "500 ريال × 4" into a quantity and the price phrase. */
export function splitQuantity(text: string): { qty: number; rest: string } {
  const t = normalize(text)
  const before = QTY_BEFORE.exec(t)
  if (before) return { qty: Number(before[1]!.replace(',', '.')), rest: before[2]! }
  const after = QTY_AFTER.exec(t)
  if (after && /\D/.test(after[1]!)) return { qty: Number(after[2]!.replace(',', '.')), rest: after[1]! }
  return { qty: 1, rest: text }
}

function nextSignificant(toks: Tok[], i: number): Tok | undefined {
  for (let j = i + 1; j < toks.length; j++) {
    const t = toks[j]!
    if (t.kind !== 'skip' && t.kind !== 'and') return t
  }
  return undefined
}

/**
 * Parse free text such as "عشرين ألف ريال", "جوج د المليون", "3chrin alf ryal",
 * "50 درهم و 20 سنتيم" or "مليون ونص" into amount/unit segments.
 * `fallbackUnit` is used when the phrase names no unit.
 */
export function parseAmount(text: string, fallbackUnit: UnitId = 'dirham'): ParseResult | null {
  const { qty, rest } = splitQuantity(text)
  const multiplier = qty > 0 && Number.isFinite(qty) ? qty : 1
  const { toks, unknown } = tokenize(rest)
  const segments: Segment[] = []

  let total = 0
  let current = 0
  let lastSmall: number | null = null // 1..9 just added, so a following "مية" multiplies it
  let lastMag = 0
  let santimDefault = false
  let sawNumber = false
  let unitBefore: UnitId | null = null
  let pendingAnd = false
  let startedWithAnd = false
  let lastSegment: (Segment & { lastMag: number }) | null = null

  const reset = () => {
    total = 0
    current = 0
    lastSmall = null
    lastMag = 0
    santimDefault = false
    sawNumber = false
    unitBefore = null
    startedWithAnd = false
  }

  const addNumber = (value: number, small: boolean) => {
    if (!sawNumber) startedWithAnd = pendingAnd
    current += value
    lastSmall = small && value >= 1 && value <= 9 ? value : null
    sawNumber = true
  }

  const addFraction = (f: number) => {
    if (current > 0) current += f
    else if (lastMag > 0) total += f * lastMag
    else if (!sawNumber && lastSegment) lastSegment.amount += f * (lastSegment.lastMag || 1)
    else current += f
    if (sawNumber || current > 0) sawNumber = true
    lastSmall = null
  }

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!
    if (t.kind === 'skip') continue
    if (t.kind === 'and') {
      pendingAnd = true
      continue
    }
    pendingAnd ||= hasAndPrefix(t.raw)
    const andBefore = pendingAnd
    switch (t.kind) {
      case 'lit':
        addNumber(t.value, false)
        break
      case 'num':
        addNumber(t.value, true)
        break
      case 'hundred':
        if (lastSmall !== null) current += lastSmall * 99
        else addNumber(100, false)
        lastSmall = null
        sawNumber = true
        break
      case 'mag': {
        if (!sawNumber) startedWithAnd = pendingAnd
        const amount = t.count && current === 0 ? t.count * t.value : (current || 1) * t.value
        total += amount
        current = 0
        lastSmall = null
        lastMag = t.value
        santimDefault ||= Boolean(t.santimDefault)
        sawNumber = true
        break
      }
      case 'half':
        addFraction(0.5)
        break
      case 'quarter': {
        const next = nextSignificant(toks, i)
        if (next?.kind === 'hundred' || (next?.kind === 'mag' && next.plural)) addNumber(4, true)
        else if (next?.kind === 'mag' && !next.count) addNumber(0.25, false) // ربع مليون = 250 000
        else if (andBefore && (sawNumber || lastSegment)) addFraction(0.25)
        else addNumber(4, true)
        break
      }
      case 'unit':
        if (sawNumber) {
          lastSegment = { amount: total + current, unit: t.unit, implied: false, lastMag }
          segments.push(lastSegment)
          reset()
        } else if (segments.length === 0) {
          unitBefore = t.unit
        }
        break
    }
    pendingAnd = false
  }

  if (sawNumber) {
    const amount = total + current
    let unit: UnitId
    let implied = true
    if (unitBefore) {
      unit = unitBefore
      implied = false
    } else if (santimDefault) unit = 'santim'
    else if (lastSegment?.unit === 'dirham' && startedWithAnd && amount < 100) unit = 'santim' // "عشرين درهم و خمسين" = 20.50 DH
    else unit = fallbackUnit
    segments.push({ amount, unit, implied })
  }

  if (segments.length === 0) return null
  return {
    segments: segments.map(({ amount, unit, implied }) => ({ amount: round(amount * multiplier), unit, implied })),
    unknown,
    multiplier,
  }
}

function round(n: number): number {
  return Math.round(n * 1e6) / 1e6
}
