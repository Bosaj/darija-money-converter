import { describe, expect, it } from 'vitest'
import { parseAmount } from './parse'
import { toDirham } from './convert'
import { resolveUnits, UNITS } from './conventions'
import { convert } from '../../api/convert'

const dh = (text: string, franc: 'santim' | 'dirham' = 'santim') => {
  const p = parseAmount(text, 'rial')
  return p ? toDirham(p.segments, resolveUnits('general', {}, undefined, franc)).dirham : null
}

describe('franc', () => {
  it('is its own unit, worth one santim by default', () => {
    expect(UNITS.franc.factor).toBe(0.01)
    expect(UNITS.santim.aliases).not.toContain('فرنك')
    expect(parseAmount('500 فرنك', 'rial')?.segments[0]?.unit).toBe('franc')
    expect(parseAmount('1000 frank', 'rial')?.segments[0]?.unit).toBe('franc')
    expect(dh('500 فرنك')).toBe(5)
    expect(dh('alf frank')).toBe(10)
    expect(dh('2000 francs')).toBe(20)
    expect(resolveUnits('general').franc.verified).toBe(true)
  })

  it('can mean a whole dirham, flagged as unconfirmed', () => {
    expect(dh('500 فرنك', 'dirham')).toBe(500)
    const units = resolveUnits('north', {}, undefined, 'dirham')
    expect(units.franc.factor).toBe(1)
    expect(units.franc.verified).toBe(false)
    expect(units.franc.note).toBe('franc-dirham')
    // santim itself never moves
    expect(units.santim.factor).toBe(0.01)
  })

  it('keeps the Swiss franc separate', () => {
    expect(parseAmount('50 فرنك سويسري', 'dirham')?.segments[0]?.unit).toBe('chf')
    expect(parseAmount('20 franc suisse', 'dirham')?.segments[0]?.unit).toBe('chf')
  })

  it('is exposed by the public API', async () => {
    const rates = async () => ({ rates: { EUR: 10.8 }, updated: Date.now(), source: 'test' })
    const a = await convert('https://x/api/convert?q=' + encodeURIComponent('500 فرنك') + '&foreign=0', rates)
    expect(a.status).toBe(200)
    expect((a.body as { dirham: number }).dirham).toBe(5)
    expect((a.body as { franc: string }).franc).toBe('santim')
    const b = await convert('https://x/api/convert?q=' + encodeURIComponent('500 فرنك') + '&franc=dirham&foreign=0', rates)
    expect((b.body as { dirham: number }).dirham).toBe(500)
  })
})
