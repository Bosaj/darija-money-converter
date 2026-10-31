import { useId } from 'react'
import { ISSUER_LABEL, UNIT_LABEL, type CoinDef, type Metal, type Motif, type NoteDef } from '../../data/money'
import { GLYPHS } from './glyphs'

/** Light and shadow tone of each coin metal (radial gradient). */
const METALS: Record<Metal, [string, string]> = {
  silver: ['#f4f3ef', '#a7a8a4'],
  nickel: ['#eceeee', '#9a9fa2'],
  alu: ['#f6f7f8', '#c3c7ca'],
  brass: ['#f6d985', '#b5862c'],
  bronze: ['#e0a878', '#8c5532'],
}
const METAL_INK: Record<Metal, string> = {
  silver: '#55585c',
  nickel: '#4f5357',
  alu: '#6a6e72',
  brass: '#6e4c12',
  bronze: '#5b3118',
}

/** Blend hex colour `a` toward `b` by `t` (0 keeps a, 1 gives b). */
export function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * t).toString(16).padStart(2, '0')).join('')}`
}

/** Shared paint servers for every coin (rendered once, in the backdrop). */
export function MoneyDefs() {
  return (
    <svg width="0" height="0" className="absolute" focusable="false">
      <defs>
        {Object.entries(METALS).map(([m, [light, dark]]) => (
          <radialGradient key={m} id={`bd-metal-${m}`} cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>
        ))}
        <mask id="bd-hole" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="white" />
          <circle cx="0.5" cy="0.5" r="0.104" fill="black" />
        </mask>
      </defs>
    </svg>
  )
}

function Glyph({ motif, x, y, size, color, width }: { motif: Motif; x: number; y: number; size: number; color: string; width: number }) {
  const s = size / 24
  return (
    <path
      d={GLYPHS[motif]}
      transform={`translate(${x} ${y}) scale(${s})`}
      fill="none"
      stroke={color}
      strokeWidth={width / s}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

/** A gentle guilloche wave across the note, `n` crests over the width. */
function wave(w: number, y: number, amp: number, n: number): string {
  const step = w / n
  let d = `M0 ${y}`
  for (let i = 0; i < n; i++) d += ` q${step / 2} ${i % 2 ? amp : -amp} ${step} 0`
  return d
}

export function Banknote({ note, width }: { note: NoteDef; width: number }) {
  const gradient = `bd-note-${useId().replace(/[^\w-]/g, '')}`
  const [W, H] = note.size
  const ink = note.ink
  const paper = mix(ink, '#fffdf6', 0.84)
  const tint = mix(ink, '#fffdf6', 0.5)
  const motif = H * 0.62
  return (
    <svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} fontWeight="700">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={paper} />
          <stop offset="0.55" stopColor={tint} />
          <stop offset="1" stopColor={paper} />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="3" fill={`url(#${gradient})`} stroke={ink} />
      {[0.3, 0.46, 0.62, 0.78].map((f, i) => (
        <path key={f} d={wave(W, H * f, H * 0.05, 7 + i)} fill="none" stroke={ink} strokeOpacity="0.28" strokeWidth="0.5" />
      ))}
      <rect x="4" y="4" width={W - 8} height={H - 8} rx="2" fill="none" stroke={ink} strokeOpacity="0.55" strokeWidth="0.6" strokeDasharray="1.5 1.2" />
      {note.polymer ? (
        <rect x={W * 0.07} y={H * 0.2} width={W * 0.13} height={H * 0.6} rx="2" fill="#ffffff" fillOpacity="0.35" stroke={ink} strokeOpacity="0.6" />
      ) : (
        <ellipse cx={W * 0.17} cy={H * 0.5} rx={H * 0.2} ry={H * 0.27} fill="#ffffff" fillOpacity="0.5" stroke={ink} strokeOpacity="0.35" strokeWidth="0.6" />
      )}
      <Glyph motif="star" x={W * 0.17 - H * 0.08} y={H * 0.42} size={H * 0.16} color={ink} width={0.7} />
      <Glyph motif={note.motif} x={W * 0.52 - motif / 2} y={(H - motif) / 2 + H * 0.04} size={motif} color={ink} width={1.6} />
      <text x={W * 0.4} y={H * 0.17} fontSize={H * 0.08} fill={ink} textAnchor="middle">
        {ISSUER_LABEL[note.issuer]}
      </text>
      <text x={W - 8} y={H * 0.34} fontSize={H * (String(note.value).length > 3 ? 0.19 : 0.24)} fill={ink} textAnchor="end">
        {note.value}
      </text>
      <text x={W - 8} y={H * 0.47} fontSize={H * 0.1} fill={ink} textAnchor="end">
        {UNIT_LABEL[note.unit].ar}
      </text>
      <text x="8" y={H - 8} fontSize={H * 0.13} fill={ink}>
        {note.value}
      </text>
      <text x={W - 8} y={H - 7} fontSize={H * 0.075} fill={ink} fillOpacity="0.8" textAnchor="end">
        {note.year}
      </text>
      {note.overprint && (
        <text x={W / 2} y={H * 0.56} fontSize={H * 0.15} fill="#b8322a" textAnchor="middle" transform={`rotate(-14 ${W / 2} ${H / 2})`} letterSpacing="1">
          {note.overprint}
        </text>
      )}
    </svg>
  )
}

export function Coin({ coin, size }: { coin: CoinDef; size: number }) {
  const ring = METAL_INK[coin.metal]
  const ink = METAL_INK[coin.center ?? coin.metal]
  const value = coin.value === undefined ? '' : String(coin.value)
  const unit = coin.unit === 'franc' ? 'FRANCS' : coin.unit === 'centime' ? 'CENTIMES' : UNIT_LABEL[coin.unit].ar
  return (
    <svg width={size} height={size} viewBox="-25 -25 50 50" fontWeight="700">
      <g mask={coin.holed ? 'url(#bd-hole)' : undefined}>
        <circle r="24" fill={`url(#bd-metal-${coin.metal})`} stroke={ring} strokeWidth="0.9" />
        {coin.center && <circle r="15.5" fill={`url(#bd-metal-${coin.center})`} stroke={ring} strokeWidth="0.6" />}
        <circle r="21.6" fill="none" stroke={ring} strokeOpacity="0.65" strokeWidth="1" strokeDasharray="0.1 2" strokeLinecap="round" />
        {coin.legend ? (
          <>
            <Glyph motif={coin.motif ?? 'hexagram'} x={-18} y={-18} size={36} color={ink} width={1.1} />
            <text y="1.5" fontSize={coin.legend.length > 5 ? 4.6 : 6} fill={ink} textAnchor="middle">
              {coin.legend}
            </text>
            <text y="8.5" fontSize="5" fill={ink} textAnchor="middle">
              {coin.date}
            </text>
          </>
        ) : coin.holed ? (
          <>
            <text y="-8" fontSize="10" fill={ink} textAnchor="middle">
              {value}
            </text>
            <text y="15" fontSize="4.4" fill={ink} textAnchor="middle" letterSpacing="0.3">
              {unit}
            </text>
          </>
        ) : (
          <>
            {coin.motif && <Glyph motif={coin.motif} x={-6.5} y={-19} size={13} color={ink} width={1} />}
            <text y="7" fontSize={value.length > 2 ? 11 : value.length > 1 ? 13 : 15} fill={ink} textAnchor="middle">
              {value}
            </text>
            <text y="14.5" fontSize={unit.length > 5 ? 4.2 : 5} fill={ink} textAnchor="middle">
              {unit}
            </text>
          </>
        )}
      </g>
      {coin.holed && <circle r="5" fill="none" stroke={ring} strokeWidth="0.8" />}
    </svg>
  )
}
