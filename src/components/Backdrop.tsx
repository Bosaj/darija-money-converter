/**
 * Page background: a full-page zellige field, warm glows in the flag's green and the coin's gold,
 * and slowly drifting Moroccan money (10 DH coins, 20/50/100/200 DH notes, the words people say).
 * Purely decorative: fixed, aria-hidden, no pointer events, still under prefers-reduced-motion.
 */

const STAR = 'M0 -10 L5.9 8.1 L-9.5 -3.1 L9.5 -3.1 L-5.9 8.1 Z'

function Coin({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48">
      <circle r="23" fill="var(--bd-silver)" />
      <circle r="16.5" fill="var(--bd-gold)" />
      <circle r="16.5" fill="none" stroke="var(--bd-line)" strokeWidth="0.8" />
      <circle r="21" fill="none" stroke="var(--bd-line)" strokeWidth="0.6" strokeDasharray="1.2 1.6" />
      <path d={STAR} fill="none" stroke="var(--bd-line)" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

/** Banknote silhouettes in the 2013-series colours (20 violet, 50 green, 100 brown, 200 blue). */
const NOTE_TINT: Record<number, string> = { 20: '#8a63c9', 50: '#3f9a6b', 100: '#b0743a', 200: '#3f74c4' }

function Note({ value, width }: { value: 20 | 50 | 100 | 200; width: number }) {
  const tint = NOTE_TINT[value]
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 120 60">
      <rect x="1" y="1" width="118" height="58" rx="6" fill={tint} fillOpacity="0.55" stroke={tint} strokeWidth="1.5" />
      <rect x="7" y="7" width="106" height="46" rx="3" fill="none" stroke="var(--bd-paper)" strokeOpacity="0.7" strokeDasharray="2 2" />
      <circle cx="88" cy="30" r="14" fill="var(--bd-paper)" fillOpacity="0.35" />
      <path d={STAR} transform="translate(88 30) scale(0.9)" fill="none" stroke="var(--bd-paper)" strokeWidth="1.6" />
      <text x="14" y="38" fontSize="20" fontWeight="700" fill="var(--bd-paper)" fontFamily="system-ui, sans-serif">
        {value}
      </text>
    </svg>
  )
}

type Item =
  | { kind: 'coin'; size: number }
  | { kind: 'note'; value: 20 | 50 | 100 | 200; width: number }
  | { kind: 'word'; text: string; size: number }

/* Positions in % of the viewport; `wide` items only show from the sm breakpoint so phones stay calm. */
const ITEMS: { item: Item; x: number; y: number; r: number; dur: number; delay: number; wide?: boolean }[] = [
  { item: { kind: 'coin', size: 64 }, x: 6, y: 16, r: -12, dur: 22, delay: 0 },
  { item: { kind: 'note', value: 200, width: 150 }, x: 82, y: 10, r: 14, dur: 28, delay: -6, wide: true },
  { item: { kind: 'word', text: 'ريال', size: 46 }, x: 88, y: 38, r: -8, dur: 26, delay: -3 },
  { item: { kind: 'note', value: 50, width: 130 }, x: 2, y: 52, r: -18, dur: 30, delay: -12, wide: true },
  { item: { kind: 'coin', size: 44 }, x: 92, y: 66, r: 20, dur: 24, delay: -9 },
  { item: { kind: 'word', text: 'شحال؟', size: 54 }, x: 10, y: 82, r: 6, dur: 27, delay: -15, wide: true },
  { item: { kind: 'note', value: 100, width: 140 }, x: 72, y: 86, r: -10, dur: 32, delay: -4, wide: true },
  { item: { kind: 'word', text: 'فرنك', size: 34 }, x: 46, y: 94, r: 4, dur: 25, delay: -18 },
  { item: { kind: 'note', value: 20, width: 110 }, x: 40, y: 4, r: 8, dur: 29, delay: -20, wide: true },
  { item: { kind: 'word', text: 'درهم', size: 38 }, x: 24, y: 34, r: -14, dur: 31, delay: -7, wide: true },
  { item: { kind: 'coin', size: 36 }, x: 60, y: 58, r: 0, dur: 23, delay: -11, wide: true },
  { item: { kind: 'word', text: 'مليون', size: 32 }, x: 64, y: 24, r: 10, dur: 34, delay: -2, wide: true },
]

export function Backdrop() {
  return (
    <div aria-hidden className="backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="backdrop-tiles" />
      {ITEMS.map(({ item, x, y, r, dur, delay, wide }, i) => (
        <div
          key={i}
          className={`backdrop-float absolute ${wide ? 'hidden sm:block' : ''}`}
          style={{ left: `${x}%`, top: `${y}%`, ['--r' as string]: `${r}deg`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
        >
          {item.kind === 'coin' && <Coin size={item.size} />}
          {item.kind === 'note' && <Note value={item.value} width={item.width} />}
          {item.kind === 'word' && (
            <span dir="rtl" className="block font-bold leading-none text-[var(--bd-word)]" style={{ fontSize: item.size }}>
              {item.text}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
