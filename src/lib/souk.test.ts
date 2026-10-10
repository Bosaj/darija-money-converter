import { describe, expect, it } from 'vitest'
import { breakdown, cheatSheet, offers, quizQuestion, sayPrice } from './souk'
import { parseAmount } from './parse'

describe('haggle offers', () => {
  it('offers 90/80/70 % rounded like people round', () => {
    expect(offers(250).map((o) => o.dirham)).toEqual([225, 200, 175])
    expect(offers(37).map((o) => o.dirham)).toEqual([33, 30, 26])
    expect(offers(1).length).toBe(0)
  })

  it('phrases the offer in rial for everyday prices', () => {
    const [first] = offers(50)
    expect(first!.ar).toBe('نعطيك تسعمية ريال')
    expect(first!.latin).toBe('n3tik tes3mya ryal')
    expect(sayPrice(12_000).ar).toBe('طناش ألف درهم')
  })

  it('every offer phrase parses back to its amount', () => {
    for (const price of [7.5, 18, 50, 125, 480, 2_300]) {
      for (const o of offers(price)) {
        const said = o.ar.replace('نعطيك ', '')
        const p = parseAmount(said, 'rial')!
        const s = p.segments[0]!
        expect(s.unit === 'rial' ? s.amount / 20 : s.amount).toBeCloseTo(o.dirham, 6)
      }
    }
  })
})

describe('cash breakdown', () => {
  it('uses the fewest notes and coins', () => {
    expect(breakdown(1_275.5)).toEqual([
      { value: 200, count: 6, kind: 'note' },
      { value: 50, count: 1, kind: 'note' },
      { value: 20, count: 1, kind: 'note' },
      { value: 5, count: 1, kind: 'coin' },
      { value: 0.5, count: 1, kind: 'coin' },
    ])
  })

  it('rounds to 5 santim and handles small change', () => {
    expect(breakdown(0.37)).toEqual([
      { value: 0.2, count: 1, kind: 'coin' },
      { value: 0.1, count: 1, kind: 'coin' },
      { value: 0.05, count: 1, kind: 'coin' },
    ])
    expect(breakdown(0)).toEqual([])
  })
})

describe('learn mode', () => {
  it('cheat sheet uses rial below 10k DH and millions above', () => {
    const rows = cheatSheet()
    expect(rows.find((r) => r.dirham === 50)?.ar).toBe('ألف ريال')
    expect(rows.find((r) => r.dirham === 10_000)?.ar).toBe('مليون')
  })

  it('quiz has 4 unique choices including the answer, and the phrase parses to it', () => {
    let seed = 1
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 40; i++) {
      const q = quizQuestion(rand)
      expect(new Set(q.choices).size).toBe(q.choices.length)
      expect(q.choices.length).toBe(4)
      expect(q.choices).toContain(q.answer)
      const p = parseAmount(q.ar, 'rial')!
      const s = p.segments[0]!
      const dh = s.unit === 'rial' ? s.amount / 20 : s.unit === 'santim' ? s.amount / 100 : s.amount
      expect(dh).toBeCloseTo(q.answer, 6)
    }
  })
})
