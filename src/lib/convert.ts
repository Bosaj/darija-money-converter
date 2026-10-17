import { UNIT_IDS, type ResolvedUnits, type UnitId } from './conventions.js'
import type { Segment } from './parse.js'
import { spellCount, spellNumber } from './spell.js'

export interface Conversion {
  dirham: number | null
  /** Units used in the input that have no value in the active region (e.g. doro in "general"). */
  missing: UnitId[]
}

export function toDirham(segments: Segment[], units: ResolvedUnits): Conversion {
  const missing: UnitId[] = []
  let dirham = 0
  for (const s of segments) {
    const factor = units[s.unit].factor
    if (factor === null) missing.push(s.unit)
    else dirham += s.amount * factor
  }
  return { dirham: missing.length ? null : round(dirham, 6), missing }
}

export function fromDirham(dirham: number, units: ResolvedUnits): Record<UnitId, number | null> {
  const out = {} as Record<UnitId, number | null>
  for (const id of UNIT_IDS) {
    const factor = units[id].factor
    out[id] = factor === null ? null : round(dirham / factor, 6)
  }
  return out
}

export interface Phrase {
  unit: UnitId
  ar: string
  latin: string
}

const isWhole = (n: number) => Math.abs(n - Math.round(n)) < 1e-6

/** How a local would say this Dirham amount out loud, in each sensible unit. */
export function sayIt(exact: number, units: ResolvedUnits): Phrase[] {
  if (!(exact > 0) || exact >= 1e12) return []
  // Cash stops at 5 santim, so spoken prices do too (matters for euro/dollar conversions)
  const dirham = exact >= 0.05 ? Math.round(exact * 20) / 20 : exact
  const phrases: Phrase[] = []

  // Rial: everyday prices (souk, taxi, café) up to ~100k DH
  const rial = units.rial.factor ? dirham / units.rial.factor : null
  if (rial !== null && isWhole(rial) && dirham <= 100_000) {
    const r = Math.round(rial)
    phrases.push({ unit: 'rial', ar: spellCount(r, 'ريال', 'ريال', 'ar'), latin: spellCount(r, 'ryal', 'ryal', 'latin') })
  }

  // Dirham, with centimes ("و نص" for .50)
  const whole = Math.floor(dirham + 1e-9)
  const cents = Math.round((dirham - whole) * 100)
  if (whole > 0 || cents > 0) {
    const ar: string[] = []
    const latin: string[] = []
    if (whole > 0) {
      ar.push(spellCount(whole, 'درهم', 'دراهم', 'ar'))
      latin.push(spellCount(whole, 'derham', 'drahem', 'latin'))
    }
    if (cents === 50 && whole > 0) {
      ar.push('و نص')
      latin.push('w nss')
    } else if (cents > 0) {
      ar.push(`${whole > 0 ? 'و ' : ''}${spellNumber(cents, 'ar')} سنتيم`)
      latin.push(`${whole > 0 ? 'w ' : ''}${spellNumber(cents, 'latin')} santim`)
    }
    phrases.push({ unit: 'dirham', ar: ar.join(' '), latin: latin.join(' ') })
  }

  // Millions of santim: cars, rent, property (≥ 10 000 DH)
  if (dirham >= 10_000) {
    const santim = Math.round(dirham * 100)
    phrases.push({ unit: 'million', ar: spellNumber(santim, 'ar'), latin: spellNumber(santim, 'latin') })
  }

  // الميا (a hundred douros), Rif only: 100 DH = جوج د الميا
  const mya = units.mya.factor ? dirham / units.mya.factor : null
  if (mya !== null && isWhole(mya) && mya >= 1 && mya <= 1e5) {
    const n = Math.round(mya)
    phrases.push({
      unit: 'mya',
      ar: n === 1 ? 'ميا' : n === 2 ? 'جوج د الميا' : `${spellNumber(n, 'ar')} د الميا`,
      latin: n === 1 ? 'mya' : n === 2 ? 'jouj d lmya' : `${spellNumber(n, 'latin')} d lmya`,
    })
  }

  // Doro, only where the region defines it
  const doro = units.doro.factor ? dirham / units.doro.factor : null
  if (doro !== null && isWhole(doro) && doro <= 1e7) {
    const d = Math.round(doro)
    phrases.push({ unit: 'doro', ar: spellCount(d, 'دورو', 'دورو', 'ar'), latin: spellCount(d, 'douro', 'douro', 'latin') })
  }
  return phrases
}

export function round(n: number, digits = 2): number {
  const f = 10 ** digits
  return Math.round(n * f) / f
}
