import { describe, expect, it } from 'vitest'
import { parseAmount } from './parse'
import { spellCount, spellNumber } from './spell'
import { fromDirham, sayIt, toDirham } from './convert'
import { resolveUnits } from './conventions'

const general = resolveUnits('general')
const dh = (text: string, fallback: Parameters<typeof parseAmount>[1] = 'rial') => {
  const p = parseAmount(text, fallback)
  if (!p) return null
  return toDirham(p.segments, general).dirham
}

describe('conventions', () => {
  it('uses the verified core ratios', () => {
    expect(general.dirham.factor).toBe(1)
    expect(general.rial.factor).toBe(0.05)
    expect(general.santim.factor).toBe(0.01)
    expect(general.million.factor).toBe(10_000)
    expect(general.mlyar.factor).toBe(10_000_000)
  })

  it('leaves doro undefined in the general preset and flags regional values as unverified', () => {
    expect(general.doro.factor).toBeNull()
    const oriental = resolveUnits('oriental')
    expect(oriental.doro.factor).toBe(0.05)
    expect(oriental.doro.verified).toBe(false)
    expect(resolveUnits('north').doro.factor).toBe(0.5)
  })

  it('applies custom factors and marks them unverified', () => {
    const custom = resolveUnits('custom', { doro: 0.25 })
    expect(custom.doro.factor).toBe(0.25)
    expect(custom.doro.verified).toBe(false)
    expect(custom.rial.factor).toBe(0.05)
  })
})

describe('parseAmount — digits', () => {
  it.each([
    ['100 درهم', 100],
    ['1000 ريال', 50],
    ['50dh', 50],
    ['50 DH', 50],
    ['100 د.م.', 100],
    ['250 سنتيم', 2.5],
    ['500 فرنك', 5],
    ['50 000 ريال', 2500],
    ['1.250 dh', 1250],
    ['2,5 dh', 2.5],
    ['٥٠ درهم', 50],
    ['20k ryal', 1000],
    ['100ريال', 5],
  ])('%s → %d DH', (text, expected) => {
    expect(dh(text)).toBeCloseTo(expected, 6)
  })

  it('uses the fallback unit when none is said', () => {
    expect(dh('1000', 'rial')).toBe(50)
    expect(dh('1000', 'dirham')).toBe(1000)
    expect(parseAmount('1000', 'rial')?.segments[0]?.implied).toBe(true)
  })
})

describe('parseAmount — Darija words', () => {
  it.each([
    ['عشرين ريال', 1],
    ['ألف ريال', 50],
    ['الف ريال', 50],
    ['عشرين ألف ريال', 1000],
    ['مية ألف ريال', 5000],
    ['خمسمية درهم', 500],
    ['خمس مية درهم', 500],
    ['تلت آلاف درهم', 3000],
    ['ربع آلاف درهم', 4000],
    ['ربع مية ريال', 20],
    ['ميتين و خمسين ريال', 12.5],
    ['خمسة و عشرين درهم', 25],
    ['ألفين و خمسمية ريال', 125],
    ['بعشرين درهم', 20],
    ['خمسة دراهم', 5],
    ['خمس دراهم', 5],
    ['درهم واحد', 1],
    ['حضاش ألف درهم', 11_000],
  ])('%s → %d DH', (text, expected) => {
    expect(dh(text)).toBeCloseTo(expected, 6)
  })

  it('treats a bare million / milliard as santim (Moroccan convention)', () => {
    expect(dh('مليون')).toBe(10_000)
    expect(dh('جوج د المليون')).toBe(20_000)
    expect(dh('مليونين')).toBe(20_000)
    expect(dh('مليون ونص')).toBe(15_000)
    expect(dh('مليون و ميتين ألف')).toBe(12_000)
    expect(dh('مليار')).toBe(10_000_000)
    expect(dh('نص مليون')).toBe(5_000)
    expect(dh('ربع مليون')).toBe(2_500)
  })

  it('honours an explicit unit after million', () => {
    expect(dh('مليون ريال')).toBe(50_000)
    expect(dh('مليون درهم')).toBe(1_000_000)
  })

  it('handles halves and quarters', () => {
    expect(dh('عشرين درهم ونص')).toBe(20.5)
    expect(dh('خمسة دراهم و نص')).toBe(5.5)
    expect(dh('مليون وربع')).toBe(12_500)
  })

  it('sums mixed-unit phrases and reads trailing centimes', () => {
    expect(dh('عشرين درهم و خمسين سنتيم')).toBe(20.5)
    expect(dh('عشرين درهم و خمسين')).toBe(20.5)
    expect(dh('50 درهم و 20 سنتيم')).toBe(50.2)
  })

  it('accepts Latin Arabizi and French', () => {
    expect(dh('3chrin alf ryal')).toBe(1000)
    expect(dh('alf ryal')).toBe(50)
    expect(dh('jouj dlmelyoun')).toBe(20_000)
    expect(dh('khamsa w 3echrin derham')).toBe(25)
    expect(dh('mitin ryal')).toBe(10)
    expect(dh('melyoun w nss')).toBe(15_000)
    expect(dh('cinquante dirhams')).toBe(50)
    expect(dh('2 millions')).toBe(20_000)
    expect(dh('b3chrin dh')).toBe(20)
  })

  it('returns null when nothing numeric is found', () => {
    expect(parseAmount('salam', 'rial')).toBeNull()
    expect(parseAmount('', 'rial')).toBeNull()
    expect(parseAmount('شحال', 'rial')).toBeNull()
  })

  it('reports doro as missing in a region without a doro value', () => {
    const p = parseAmount('100 دورو', 'rial')!
    expect(toDirham(p.segments, general)).toEqual({ dirham: null, missing: ['doro'] })
    expect(toDirham(p.segments, resolveUnits('oriental')).dirham).toBe(5)
  })
})

describe('spellNumber', () => {
  it.each([
    [1, 'واحد'],
    [25, 'خمسة و عشرين'],
    [100, 'مية'],
    [250, 'ميتين و خمسين'],
    [1000, 'ألف'],
    [2000, 'ألفين'],
    [3000, 'تلت آلاف'],
    [11_000, 'حضاش ألف'],
    [20_000, 'عشرين ألف'],
    [1_000_000, 'مليون'],
    [2_000_000, 'جوج د المليون'],
    [1_500_000, 'مليون و خمسمية ألف'],
  ])('%d → %s', (n, words) => {
    expect(spellNumber(n, 'ar')).toBe(words)
  })

  it('spells Arabizi', () => {
    expect(spellNumber(1000, 'latin')).toBe('alf')
    expect(spellNumber(25, 'latin')).toBe('khamsa w 3echrin')
    expect(spellNumber(2_000_000, 'latin')).toBe('jouj dlmelyoun')
  })

  it('agrees nouns with numbers', () => {
    expect(spellCount(1, 'درهم', 'دراهم')).toBe('درهم واحد')
    expect(spellCount(2, 'درهم', 'دراهم')).toBe('جوج دراهم')
    expect(spellCount(5, 'درهم', 'دراهم')).toBe('خمس دراهم')
    expect(spellCount(20, 'درهم', 'دراهم')).toBe('عشرين درهم')
  })

  it('round-trips through the parser (Arabic and Arabizi)', () => {
    const samples = [1, 7, 12, 19, 21, 99, 100, 101, 200, 345, 999, 1000, 1001, 2000, 2500, 3000, 4000, 9999, 10_000,
      11_000, 45_678, 100_000, 250_000, 999_999, 1_000_000, 2_000_000, 3_400_000, 12_345_678, 1_000_000_000]
    for (const n of samples) {
      for (const script of ['ar', 'latin'] as const) {
        const words = spellNumber(n, script)
        const parsed = parseAmount(`${words} ${script === 'ar' ? 'ريال' : 'ryal'}`, 'rial')
        expect(parsed?.segments[0]?.amount, `${n} ${script}: ${words}`).toBe(n)
      }
    }
  })
})

describe('fromDirham / sayIt', () => {
  it('converts Dirham to every unit', () => {
    expect(fromDirham(50, general)).toEqual({ dirham: 50, rial: 1000, santim: 5000, million: 0.005, mlyar: 0.000005, doro: null })
  })

  it('says amounts like a local', () => {
    const p = sayIt(50, general)
    expect(p.find((x) => x.unit === 'rial')?.ar).toBe('ألف ريال')
    expect(p.find((x) => x.unit === 'dirham')?.ar).toBe('خمسين درهم')
    expect(sayIt(12.5, general).find((x) => x.unit === 'dirham')?.ar).toBe('طناش درهم و نص')
    expect(sayIt(15_000, general).find((x) => x.unit === 'million')?.ar).toBe('مليون و خمسمية ألف')
    expect(sayIt(0, general)).toEqual([])
  })
})
