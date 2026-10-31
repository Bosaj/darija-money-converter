import { useEffect, useState } from 'react'
import { ERA_SEQUENCE, eraAtStep, type Era, type Piece } from '../data/money'
import type { Lang } from '../lib/conventions'
import { Banknote, Coin, MoneyDefs } from './money/MoneyArt'

/**
 * Page background: a full-page zellige field, warm glows in the flag's green and the coin's gold,
 * and the notes and coins of one era of Moroccan money drifting slowly. The era changes every few
 * seconds, today's series first, then from the Hassani rial (1882) forward (src/data/money.ts).
 * Purely decorative: fixed, aria-hidden, no pointer events; one still era under prefers-reduced-motion.
 */

export const ERA_MS = 14_000
const FADE_MS = 1_600

/** px per mm: notes near life size, coins enlarged so their faces read. */
const NOTE_SCALE = 1
const COIN_SCALE = 2.1

/* Positions in % of the viewport, mostly in the side gutters where the cards don't cover them.
   Phones only show the slots without `wide`, so they stay calm. */
const SLOTS: { x: number; y: number; r: number; dur: number; delay: number; wide?: boolean }[] = [
  { x: 5, y: 18, r: -12, dur: 22, delay: 0 },
  { x: 95, y: 12, r: 14, dur: 28, delay: -6, wide: true },
  { x: 96, y: 40, r: -8, dur: 26, delay: -3 },
  { x: 4, y: 44, r: -18, dur: 30, delay: -12, wide: true },
  { x: 94, y: 66, r: 16, dur: 24, delay: -9 },
  { x: 7, y: 66, r: 10, dur: 34, delay: -2, wide: true },
  { x: 52, y: 3, r: 4, dur: 29, delay: -20, wide: true },
  { x: 97, y: 89, r: -10, dur: 32, delay: -4, wide: true },
  { x: 50, y: 98, r: 0, dur: 23, delay: -11 },
  { x: 10, y: 31, r: -14, dur: 31, delay: -7, wide: true },
  { x: 90, y: 25, r: 8, dur: 27, delay: -15, wide: true },
  { x: 91, y: 53, r: -6, dur: 25, delay: -18, wide: true },
]

function PieceArt({ piece }: { piece: Piece }) {
  return piece.kind === 'note' ? (
    <Banknote note={piece} width={piece.size[0] * NOTE_SCALE} />
  ) : (
    <Coin coin={piece} size={piece.d * COIN_SCALE} />
  )
}

function EraLayer({ era, lang, phase }: { era: Era; lang: Lang; phase: 'in' | 'out' | 'still' }) {
  return (
    <div className={`era-layer era-${phase}`} data-era={era.id}>
      {SLOTS.map(({ x, y, r, dur, delay, wide }, i) => {
        const piece = era.pieces[i]
        if (!piece) return null
        return (
          <div
            key={piece.id}
            className={`backdrop-float absolute ${wide ? 'hidden sm:block' : ''}`}
            style={{ left: `${x}%`, top: `${y}%`, ['--r' as string]: `${r}deg`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
          >
            <PieceArt piece={piece} />
          </div>
        )
      })}
      <div className="era-caption">
        <div className="era-years" dir="ltr">
          <span>{era.from}</span>
          {era.to !== null && <span>{era.to}</span>}
        </div>
        <div className="era-name">{era.name[lang]}</div>
      </div>
    </div>
  )
}

const stillPreferred = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true

/** The era on screen and the one fading out. */
function useEra() {
  const [state, setState] = useState<{ step: number; leaving: Era | null }>({ step: 0, leaving: null })
  useEffect(() => {
    if (stillPreferred()) return
    let fade: ReturnType<typeof setTimeout> | undefined
    const tick = setInterval(() => {
      if (document.hidden) return
      setState((s) => ({ step: (s.step + 1) % ERA_SEQUENCE.length, leaving: eraAtStep(s.step) }))
      clearTimeout(fade)
      fade = setTimeout(() => setState((s) => ({ ...s, leaving: null })), FADE_MS)
    }, ERA_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(fade)
    }
  }, [])
  return { era: eraAtStep(state.step), leaving: state.leaving, changed: state.step !== 0 || state.leaving !== null }
}

export function Backdrop({ lang = 'ar' }: { lang?: Lang }) {
  const { era, leaving, changed } = useEra()
  return (
    <div aria-hidden className="backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="backdrop-tiles" />
      <MoneyDefs />
      {leaving && <EraLayer key={leaving.id} era={leaving} lang={lang} phase="out" />}
      <EraLayer key={era.id} era={era} lang={lang} phase={changed ? 'in' : 'still'} />
    </div>
  )
}
