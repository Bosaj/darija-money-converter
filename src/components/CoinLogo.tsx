import { useId, useState } from 'react'

/** Interlaced Moroccan star (pentagram), centred on 0,0, radius 118. */
export const STAR = 'M0 -118 L69.4 95.5 L-112.2 -36.5 L112.2 -36.5 L-69.4 95.5 Z'
/** Short pieces redrawn on top so each line passes over, then under, like the flag's seal. */
export const WEAVE = ['M20.3 -55.5 L32.7 -17.4', 'M59 2.2 L26.7 25.7', 'M16.2 56.8 L-16.2 33.3', 'M-49 32.9 L-36.7 -5.1', 'M-46.5 -36.5 L-6.5 -36.5']

/**
 * Bimetallic coin in the spirit of the 10 DH piece: brass ring with a reeded
 * edge and struck inscription, nickel centre with a raised, green-enamelled,
 * interlaced Moroccan star. Tap to flip.
 */
export function CoinLogo({ size = 44, label = 'شحال؟', interactive = true }: { size?: number; label?: string; interactive?: boolean }) {
  const id = useId().replace(/:/g, '')
  const [spin, setSpin] = useState(0)
  const g = (name: string) => `${name}-${id}`
  const inscription = `${label} · CHHAL · ${label} · DIRHAM ·`

  const coin = (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-hidden className="block">
      <defs>
        <radialGradient id={g('brass')} cx="38%" cy="32%" r="78%">
          <stop offset="0" stopColor="#fff2b8" />
          <stop offset="0.28" stopColor="#f1cf62" />
          <stop offset="0.62" stopColor="#c9952a" />
          <stop offset="0.86" stopColor="#9a6a14" />
          <stop offset="1" stopColor="#d9b04a" />
        </radialGradient>
        <linearGradient id={g('shine')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#3a2504" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={g('nickel')} cx="36%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor="#e6e9ed" />
          <stop offset="0.65" stopColor="#a9b1ba" />
          <stop offset="0.9" stopColor="#7c858f" />
          <stop offset="1" stopColor="#c9ced4" />
        </radialGradient>
        <linearGradient id={g('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9dde2" />
          <stop offset="0.5" stopColor="#8a939d" />
          <stop offset="1" stopColor="#5b636c" />
        </linearGradient>
        <linearGradient id={g('enamel')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2bb36a" />
          <stop offset="0.55" stopColor="#0b7a3f" />
          <stop offset="1" stopColor="#065a2d" />
        </linearGradient>
        <path id={g('ring')} d="M256 256 m-186 0 a186 186 0 1 1 372 0 a186 186 0 1 1 -372 0" />
        <linearGradient id={g('sweep')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={g('clip')}>
          <circle cx="256" cy="256" r="240" />
        </clipPath>
      </defs>

      {/* brass ring, reeded edge, struck inscription */}
      <circle cx="256" cy="256" r="240" fill={`url(#${g('brass')})`} />
      <circle cx="256" cy="256" r="236" fill="none" stroke="#7a520e" strokeWidth="9" strokeDasharray="3 5" opacity="0.55" />
      <circle cx="256" cy="256" r="240" fill={`url(#${g('shine')})`} />
      <circle cx="256" cy="256" r="222" fill="none" stroke="#fff4c9" strokeWidth="3" opacity="0.75" />
      <circle cx="256" cy="256" r="218" fill="none" stroke="#8d6111" strokeWidth="2.5" opacity="0.8" />
      {(
        [
          ['#7a520e', 0.85, 0],
          ['#fff3c2', 0.5, -1.5],
        ] as const
      ).map(([fill, op, d]) => (
        <text key={fill} fontSize="38" fontWeight="700" fill={fill} opacity={op} transform={`translate(${d} ${d})`} direction="ltr" style={{ fontFamily: 'var(--font-sans)' }}>
          <textPath href={`#${g('ring')}`} startOffset="0" textLength={1150} lengthAdjust="spacing">
            {inscription}
          </textPath>
        </text>
      ))}

      {/* nickel centre */}
      <circle cx="256" cy="256" r="160" fill="#6f5010" opacity="0.55" />
      <circle cx="256" cy="256" r="154" fill={`url(#${g('nickel')})`} />
      <circle cx="256" cy="256" r="154" fill="none" stroke="#5f6770" strokeWidth="3" />
      <circle cx="256" cy="256" r="146" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />

      {/* raised interlaced star: cast shadow, top light, metal rim, green enamel, weave */}
      <g transform="translate(256 262)" fill="none" strokeLinejoin="miter" strokeMiterlimit={10}>
        <path d={STAR} stroke="#2f363d" strokeWidth="26" opacity="0.35" transform="translate(4 5)" />
        <path d={STAR} stroke="#fff" strokeWidth="26" opacity="0.7" transform="translate(-2.5 -2.5)" />
        <path d={STAR} stroke={`url(#${g('rim')})`} strokeWidth="26" />
        <path d={STAR} stroke={`url(#${g('enamel')})`} strokeWidth="15" />
        {WEAVE.map((d) => (
          <g key={d}>
            <path d={d} stroke={`url(#${g('rim')})`} strokeWidth="26" strokeLinecap="butt" />
            <path d={d} stroke={`url(#${g('enamel')})`} strokeWidth="15" strokeLinecap="butt" />
          </g>
        ))}
        <path d={STAR} stroke="#9ff0c2" strokeWidth="2" opacity="0.35" transform="translate(-2 -2)" />
      </g>

      {/* light sweep across the metal */}
      <g clipPath={`url(#${g('clip')})`}>
        <g className="coin-sweep">
          <rect x="-260" y="-60" width="170" height="640" fill={`url(#${g('sweep')})`} transform="rotate(20 256 256)" />
        </g>
      </g>
    </svg>
  )

  if (!interactive) return coin
  return (
    // the coin's embossed inscription is drawn several times; keep it out of the button so its name stays clean
    <span className="coin-wrap relative block shrink-0 rounded-full drop-shadow-[0_6px_10px_rgb(90_60_10/0.35)]" style={{ width: size, height: size }}>
      <span key={spin} className={`block ${spin ? 'coin-flip' : ''}`}>
        {coin}
      </span>
      <button type="button" aria-label="Flip the coin" onClick={() => setSpin((s) => s + 1)} className="absolute inset-0 rounded-full" />
    </span>
  )
}
