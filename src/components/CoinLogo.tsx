import { useId, useState } from 'react'

/**
 * Bimetallic coin (like the 10 DH piece): brass ring with reeded edge and
 * beading, nickel centre with an embossed zellige star, and the app name
 * struck around the ring. Tap to flip.
 */
export function CoinLogo({ size = 44, label = 'شحال؟', interactive = true }: { size?: number; label?: string; interactive?: boolean }) {
  const id = useId().replace(/:/g, '')
  const [spin, setSpin] = useState(0)
  const g = (name: string) => `${name}-${id}`

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
        <linearGradient id={g('star')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6f8" />
          <stop offset="0.5" stopColor="#b9c0c8" />
          <stop offset="1" stopColor="#8a939d" />
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

      <circle cx="256" cy="256" r="240" fill={`url(#${g('brass')})`} />
      <circle cx="256" cy="256" r="236" fill="none" stroke="#7a520e" strokeWidth="9" strokeDasharray="3 5" opacity="0.55" />
      <circle cx="256" cy="256" r="240" fill={`url(#${g('shine')})`} />
      <circle cx="256" cy="256" r="222" fill="none" stroke="#fff4c9" strokeWidth="3" opacity="0.75" />
      <circle cx="256" cy="256" r="218" fill="none" stroke="#8d6111" strokeWidth="2.5" opacity="0.8" />

      {/* struck inscription between rim and centre */}
      <text fontSize="38" fontWeight="700" fill="#7a520e" opacity="0.85" direction="ltr" style={{ fontFamily: 'var(--font-sans)' }}>
        <textPath href={`#${g('ring')}`} startOffset="0" textLength={1150} lengthAdjust="spacing">
          {`${label} · CHHAL · ${label} · DIRHAM ·`}
        </textPath>
      </text>
      <text fontSize="38" fontWeight="700" fill="#fff3c2" opacity="0.5" transform="translate(-1.5 -1.5)" direction="ltr" style={{ fontFamily: 'var(--font-sans)' }}>
        <textPath href={`#${g('ring')}`} startOffset="0" textLength={1150} lengthAdjust="spacing">
          {`${label} · CHHAL · ${label} · DIRHAM ·`}
        </textPath>
      </text>

      <circle cx="256" cy="256" r="160" fill="#6f5010" opacity="0.55" />
      <circle cx="256" cy="256" r="154" fill={`url(#${g('nickel')})`} />
      <circle cx="256" cy="256" r="154" fill="none" stroke="#5f6770" strokeWidth="3" />
      <circle cx="256" cy="256" r="146" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />

      {(
        [
          [4, '#3f464e', 0.45],
          [-3, '#fff', 0.8],
          [0, `url(#${g('star')})`, 1],
        ] as const
      ).map(([d, fill, op]) => (
        <g key={d} transform={`translate(${256 + d} ${256 + d})`} fill={fill} opacity={op}>
          <rect x="-82" y="-82" width="164" height="164" rx="10" />
          <rect x="-82" y="-82" width="164" height="164" rx="10" transform="rotate(45)" />
        </g>
      ))}
      <circle cx="256" cy="256" r="46" fill={`url(#${g('brass')})`} stroke="#6f4b0c" strokeWidth="3" />
      <circle cx="256" cy="256" r="46" fill={`url(#${g('shine')})`} />
      <circle cx="256" cy="256" r="24" fill="none" stroke="#7a520e" strokeWidth="5" opacity="0.7" />
      <circle cx="254" cy="254" r="24" fill="none" stroke="#fff3c2" strokeWidth="2" opacity="0.7" />

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
    <button
      type="button"
      aria-label="Flip the coin"
      onClick={() => setSpin((s) => s + 1)}
      className="coin-wrap shrink-0 rounded-full drop-shadow-[0_6px_10px_rgb(90_60_10/0.35)]"
      style={{ width: size, height: size }}
    >
      <span key={spin} className={`block ${spin ? 'coin-flip' : ''}`}>
        {coin}
      </span>
    </button>
  )
}
