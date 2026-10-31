import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Backdrop, ERA_MS } from '../components/Backdrop'
import { GLYPHS } from '../components/money/glyphs'
import { mix } from '../components/money/MoneyArt'
import { ERA_SEQUENCE, ERAS, MOTIFS } from '../data/money'

describe('money through time (background catalogue)', () => {
  it('covers every era from the Hassani rial to the 2023 series, in order', () => {
    expect(ERAS.map((e) => e.id)).toEqual(['rial', 'franc', 'dirham-1960', 'dirham-1987', 'dirham-2002', 'dirham-2013', 'dirham-2023'])
    expect(ERAS[0]?.from).toBe(1882)
    expect(ERAS.at(-1)?.to).toBeNull()
    for (let i = 1; i < ERAS.length; i++) expect(ERAS[i]?.from).toBeGreaterThan(ERAS[i - 1]?.from ?? 0)
  })

  it('gives every era both notes and coins, dated inside the era', () => {
    for (const era of ERAS) {
      expect(era.pieces.some((p) => p.kind === 'note'), era.id).toBe(true)
      expect(era.pieces.some((p) => p.kind === 'coin'), era.id).toBe(true)
      expect(era.pieces.length, era.id).toBeLessThanOrEqual(12) // one backdrop slot per piece
      for (const p of era.pieces) {
        expect(p.year, p.id).toBeGreaterThanOrEqual(era.from - 2) // coins minted just before a series launch
        if (era.to !== null) expect(p.year, p.id).toBeLessThanOrEqual(era.to)
      }
    }
  })

  it('has unique ids, real colours and a drawing for every motif', () => {
    const ids = ERAS.flatMap((e) => e.pieces.map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of MOTIFS) expect(GLYPHS[m], m).toMatch(/^M/)
    for (const p of ERAS.flatMap((e) => e.pieces)) {
      if (p.kind === 'note') {
        expect(p.ink, p.id).toMatch(/^#[0-9a-f]{6}$/)
        expect(p.size[0], p.id).toBeGreaterThan(p.size[1])
      } else {
        expect(p.value !== undefined || p.legend !== undefined, p.id).toBe(true)
      }
    }
  })

  it('includes the current notes and coins people carry today', () => {
    const today = ERAS.at(-1)!.pieces
    const notes = today.filter((p) => p.kind === 'note').map((p) => p.value)
    const coins = today.filter((p) => p.kind === 'coin').map((p) => p.value)
    expect(notes.sort((a, b) => a - b)).toEqual([20, 50, 100, 200])
    expect(coins).toEqual(expect.arrayContaining([10, 5, 1, '½', 20]))
  })

  it('shows today first, then the oldest era forward', () => {
    expect(ERA_SEQUENCE[0]).toBe(ERAS.length - 1)
    expect(ERA_SEQUENCE.slice(1)).toEqual(ERAS.slice(0, -1).map((_, i) => i))
  })

  it('mixes colours', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mix('#3f74c4', '#3f74c4', 0.3)).toBe('#3f74c4')
  })
})

describe('Backdrop', () => {
  afterEach(() => vi.useRealTimers())

  it('starts with the new series and moves to the Hassani rial', () => {
    vi.useFakeTimers()
    const { container } = render(<Backdrop lang="fr" />)
    expect(container.querySelector('.era-still')?.getAttribute('data-era')).toBe('dirham-2023')
    expect(container.textContent).toContain('Nouvelle série')
    expect(container.querySelector('[aria-hidden]')).not.toBeNull()
    act(() => vi.advanceTimersByTime(ERA_MS))
    expect(container.querySelector('.era-in')?.getAttribute('data-era')).toBe('rial')
    expect(container.querySelector('.era-out')?.getAttribute('data-era')).toBe('dirham-2023')
    act(() => vi.advanceTimersByTime(2000))
    expect(container.querySelectorAll('.era-layer')).toHaveLength(1)
    expect(container.querySelector('.era-years')?.textContent).toBe('18821920')
  })

  it('keeps one era still when the user prefers reduced motion', () => {
    vi.useFakeTimers()
    const original = window.matchMedia
    window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia
    try {
      const { container } = render(<Backdrop />)
      act(() => vi.advanceTimersByTime(ERA_MS * 3))
      expect(container.querySelector('.era-layer')?.getAttribute('data-era')).toBe('dirham-2023')
      expect(container.textContent).toContain('السلسلة الجديدة')
    } finally {
      window.matchMedia = original
    }
  })
})
