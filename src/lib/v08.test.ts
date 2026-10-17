import { describe, expect, it } from 'vitest'
import { parseAmount } from './parse'
import { fromDirham, sayIt, toDirham } from './convert'
import { resolveUnits, type PresetId } from './conventions'
import { nearestCity } from './place'
import { convert } from '../../api/convert'

const dh = (text: string, preset: PresetId) => {
  const p = parseAmount(text, 'rial')
  return p ? toDirham(p.segments, resolveUnits(preset)) : null
}

describe('regional douros and الميا (Rif vs Oujda)', () => {
  it('Rif: 1 DH = 2 douros, الميا = 100 douros = 50 DH', () => {
    expect(dh('100 دورو', 'rif')?.dirham).toBe(50)
    expect(dh('مية دورو', 'rif')?.dirham).toBe(50)
    expect(dh('جوج د الميا', 'rif')?.dirham).toBe(100)
    expect(fromDirham(1, resolveUnits('rif')).doro).toBe(2)
    expect(fromDirham(50, resolveUnits('rif')).rial).toBe(1000)
  })

  it('Oujda: 1 douro = 5 santim, the same as a rial (1 DH = 20 douros)', () => {
    expect(dh('100 دورو', 'oriental')?.dirham).toBe(5)
    expect(fromDirham(1, resolveUnits('oriental')).doro).toBe(20)
    // the Rif douro is worth ten Oujda douros
    expect(resolveUnits('rif').doro.factor! / resolveUnits('oriental').doro.factor!).toBe(10)
  })

  it('الميا only exists in the Rif', () => {
    expect(dh('جوج د الميا', 'general')?.missing).toEqual(['mya'])
    expect(resolveUnits('general').mya.factor).toBeNull()
    expect(resolveUnits('rif').mya.verified).toBe(false)
  })

  it('franc stays a santim everywhere: 10 DH = 1,000 francs, 10,000 DH = a million francs', () => {
    expect(dh('1000 فرنك', 'rif')?.dirham).toBe(10)
    expect(fromDirham(10_000, resolveUnits('north')).franc).toBe(1_000_000)
  })

  it('says amounts the Rif way', () => {
    const phrases = sayIt(100, resolveUnits('rif'))
    expect(phrases.find((p) => p.unit === 'mya')?.ar).toBe('جوج د الميا')
    expect(phrases.find((p) => p.unit === 'doro')).toBeTruthy()
  })

  it('Nador and Al Hoceima detect as Rif, Oujda as Oriental', () => {
    expect(nearestCity(35.1681, -2.9335).city.preset).toBe('rif')
    expect(nearestCity(35.2517, -3.9372).city.preset).toBe('rif')
    expect(nearestCity(34.6814, -1.9086).city.preset).toBe('oriental')
  })

  it('the API takes region=rif', async () => {
    const rates = async () => ({ rates: { EUR: 10.8 }, updated: Date.now(), source: 'test' })
    const r = await convert('https://x/api/convert?q=' + encodeURIComponent('جوج د الميا') + '&region=rif&foreign=0', rates)
    expect((r.body as { dirham: number }).dirham).toBe(100)
  })
})
