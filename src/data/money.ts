/**
 * Moroccan money through time, for the page background: every era from the Hassani rial (1882)
 * to the 2023–2024 dirham series, with its notes and coins.
 *
 * The pieces are drawn, not photographed. Real notes carry the King's portrait (reproduction
 * needs Bank Al-Maghrib's authorisation, Dahir of 1956) and the designs are protected, so each
 * drawing keeps what people recognise: colour, size ratio, value, metal and the main motif
 * (a landmark instead of the portrait). Sources: Wikipedia (Moroccan rial, franc and dirham),
 * Bank Al-Maghrib announcements, banknote catalogues (Pick numbers in comments).
 */

/** Line drawings in src/components/money/glyphs.tsx. */
export const MOTIFS = [
  'arch',
  'argan',
  'bee',
  'bridge',
  'crown',
  'dam',
  'falls',
  'fish',
  'fortress',
  'gate',
  'hexagram',
  'horse',
  'jewel',
  'kasbah',
  'lighthouse',
  'lily',
  'lute',
  'mechouar',
  'mosque',
  'olive',
  'oranges',
  'ornament',
  'palm',
  'rose',
  'sailship',
  'ship',
  'skyline',
  'solar',
  'star',
  'tent',
  'tower',
  'train',
  'turbine',
  'wheat',
] as const
export type Motif = (typeof MOTIFS)[number]

export type Metal = 'silver' | 'nickel' | 'alu' | 'brass' | 'bronze'
export type Unit = 'rial' | 'dirham' | 'mazuna' | 'centime' | 'franc' | 'santim'
export type Issuer = 'state' | 'bam'

export interface NoteDef {
  kind: 'note'
  id: string
  value: number
  unit: Unit
  year: number
  /** Size in mm (width × height). */
  size: [number, number]
  /** Main ink colour of the real note. */
  ink: string
  motif: Motif
  issuer: Issuer
  /** Red text stamped across a note re-used in a new currency (1960). */
  overprint?: string
  /** Clear polymer window (2019 commemorative 20 DH). */
  polymer?: boolean
}

export interface CoinDef {
  kind: 'coin'
  id: string
  /** Number shown on the coin; Hassani coins have no numeral, only a legend. */
  value?: number | string
  unit: Unit
  year: number
  /** Diameter in mm. */
  d: number
  /** Ring metal (the whole coin when there is no `center`). */
  metal: Metal
  /** Centre metal of a bimetallic coin. */
  center?: Metal
  motif?: Motif
  holed?: boolean
  /** Arabic legend and Hijri date, for coins without a numeral. */
  legend?: string
  date?: string
}

export type Piece = NoteDef | CoinDef

export interface Era {
  id: string
  from: number
  to: number | null
  name: { ar: string; fr: string; en: string }
  pieces: Piece[]
}

/** Unit words drawn on the pieces. */
export const UNIT_LABEL: Record<Unit, { ar: string; short: string }> = {
  rial: { ar: 'ريال', short: 'RIALS' },
  dirham: { ar: 'درهم', short: 'DH' },
  mazuna: { ar: 'موزونة', short: 'MAZ.' },
  centime: { ar: 'سنتيم', short: 'C' },
  franc: { ar: 'فرنك', short: 'F' },
  santim: { ar: 'سنتيم', short: 'S' },
}

export const ISSUER_LABEL: Record<Issuer, string> = {
  state: 'البنك المخزني المغربي',
  bam: 'بنك المغرب',
}

const note = (p: Omit<NoteDef, 'kind'>): NoteDef => ({ kind: 'note', ...p })
const coin = (p: Omit<CoinDef, 'kind'>): CoinDef => ({ kind: 'coin', ...p })

export const ERAS: Era[] = [
  {
    id: 'rial',
    from: 1882,
    to: 1920,
    name: { ar: 'الريال الحسني', fr: 'Rial hassani', en: 'Hassani rial' },
    pieces: [
      // Silver of Hassan I (1299 AH, struck in Paris) and bronze mazunas (1320 AH): date inside a Seal of Solomon
      coin({ id: 'rial-1', unit: 'rial', year: 1882, d: 37, metal: 'silver', motif: 'hexagram', legend: 'ريال', date: '١٢٩٩' }),
      note({ id: 'rial-4', value: 4, unit: 'rial', year: 1917, size: [120, 76], ink: '#9a7448', motif: 'ornament', issuer: 'state' }), // P1
      coin({ id: 'dirham-5', unit: 'dirham', year: 1882, d: 30, metal: 'silver', motif: 'hexagram', legend: '٥ دراهم', date: '١٢٩٩' }),
      note({ id: 'rial-20', value: 20, unit: 'rial', year: 1910, size: [170, 105], ink: '#7d6a3e', motif: 'ornament', issuer: 'state' }), // P2
      coin({ id: 'mazuna-10', unit: 'mazuna', year: 1902, d: 30, metal: 'bronze', motif: 'hexagram', legend: '١٠ موزونات', date: '١٣٢٠' }),
      coin({ id: 'dirham-1', unit: 'dirham', year: 1882, d: 20, metal: 'silver', motif: 'hexagram', legend: 'درهم', date: '١٢٩٩' }),
      coin({ id: 'dirham-2.5', unit: 'dirham', year: 1882, d: 25, metal: 'silver', motif: 'hexagram', legend: '٢½ درهم', date: '١٢٩٩' }),
      coin({ id: 'mazuna-5', unit: 'mazuna', year: 1902, d: 25, metal: 'bronze', motif: 'hexagram', legend: '٥ موزونات', date: '١٣٢٠' }),
    ],
  },
  {
    id: 'franc',
    from: 1921,
    to: 1959,
    name: { ar: 'الفرنك المغربي', fr: 'Franc marocain', en: 'Moroccan franc' },
    pieces: [
      note({ id: 'f-5000-1949', value: 5000, unit: 'franc', year: 1949, size: [180, 100], ink: '#8a5a5e', motif: 'fortress', issuer: 'state' }), // P48, view of Rabat
      coin({ id: 'c-25-1921', value: 25, unit: 'centime', year: 1921, d: 24, metal: 'nickel', motif: 'star', holed: true }),
      note({ id: 'f-100-1919', value: 100, unit: 'franc', year: 1919, size: [160, 100], ink: '#c0603a', motif: 'ornament', issuer: 'state' }), // P14
      coin({ id: 'f-20-1928', value: 20, unit: 'franc', year: 1928, d: 35, metal: 'silver', motif: 'star' }),
      note({ id: 'f-10-1944', value: 10, unit: 'franc', year: 1944, size: [130, 80], ink: '#4f7a62', motif: 'star', issuer: 'state' }), // P25, five-pointed star
      coin({ id: 'f-5-1946', value: 5, unit: 'franc', year: 1946, d: 31, metal: 'brass', motif: 'hexagram' }),
      note({ id: 'f-50-1949', value: 50, unit: 'franc', year: 1949, size: [140, 85], ink: '#8f8a3c', motif: 'gate', issuer: 'state' }), // P44, arched gateways
      coin({ id: 'f-2-1951', value: 2, unit: 'franc', year: 1951, d: 25, metal: 'alu', motif: 'star' }),
      note({ id: 'f-1000-1951', value: 1000, unit: 'franc', year: 1951, size: [170, 95], ink: '#6f7f6a', motif: 'skyline', issuer: 'state' }), // P47, city views
      coin({ id: 'f-200-1953', value: 200, unit: 'franc', year: 1953, d: 31, metal: 'silver', motif: 'star' }),
      coin({ id: 'f-50-1952', value: 50, unit: 'franc', year: 1952, d: 31, metal: 'brass', motif: 'hexagram' }),
    ],
  },
  {
    id: 'dirham-1960',
    from: 1960,
    to: 1986,
    name: { ar: 'أول درهم', fr: 'Premiers dirhams', en: 'First dirhams' },
    pieces: [
      note({ id: 'dh-100-1960', value: 100, unit: 'dirham', year: 1960, size: [180, 100], ink: '#6c7c74', motif: 'skyline', issuer: 'bam', overprint: '100 DIRHAMS' }), // P52, on 10,000 francs
      coin({ id: 'dh-1-1960', value: 1, unit: 'dirham', year: 1960, d: 28, metal: 'silver', motif: 'crown' }),
      note({ id: 'dh-5-1970', value: 5, unit: 'dirham', year: 1970, size: [140, 70], ink: '#55528a', motif: 'kasbah', issuer: 'bam' }), // P56, Aït Benhaddou
      coin({ id: 's-5-1974', value: 5, unit: 'santim', year: 1974, d: 17.5, metal: 'brass', motif: 'sailship' }),
      note({ id: 'dh-10-1970', value: 10, unit: 'dirham', year: 1970, size: [148, 72], ink: '#a3567c', motif: 'oranges', issuer: 'bam' }), // P57, orange packing
      coin({ id: 's-10-1974', value: 10, unit: 'santim', year: 1974, d: 20, metal: 'brass', motif: 'wheat' }),
      note({ id: 'dh-50-1985', value: 50, unit: 'dirham', year: 1985, size: [155, 75], ink: '#4f8a5c', motif: 'dam', issuer: 'bam' }), // P58, hydroelectric dam
      coin({ id: 's-1-1974', value: 1, unit: 'santim', year: 1974, d: 17, metal: 'alu', motif: 'fish' }),
      coin({ id: 'dh-5-1980', value: 5, unit: 'dirham', year: 1980, d: 29, metal: 'nickel', motif: 'crown' }),
      coin({ id: 's-20-1974', value: 20, unit: 'santim', year: 1974, d: 23, metal: 'brass', motif: 'jewel' }),
    ],
  },
  {
    id: 'dirham-1987',
    from: 1987,
    to: 2001,
    name: { ar: 'سلسلة 1987', fr: 'Série 1987', en: '1987 series' },
    pieces: [
      note({ id: 'dh-200-1991', value: 200, unit: 'dirham', year: 1991, size: [158, 75], ink: '#3c6fa8', motif: 'sailship', issuer: 'bam' }), // P66, conch, coral and dhow
      coin({ id: 'dh-10-1995', value: 10, unit: 'dirham', year: 1995, d: 27, metal: 'brass', center: 'nickel', motif: 'crown' }),
      note({ id: 'dh-10-1987', value: 10, unit: 'dirham', year: 1987, size: [143, 70], ink: '#b8574a', motif: 'lute', issuer: 'bam' }), // P60, lute
      coin({ id: 'dh-1-1987', value: 1, unit: 'dirham', year: 1987, d: 24, metal: 'nickel', motif: 'crown' }),
      note({ id: 'dh-50-1987', value: 50, unit: 'dirham', year: 1987, size: [148, 70], ink: '#4b8b57', motif: 'horse', issuer: 'bam' }), // P61, fantasia
      coin({ id: 's-20-1987', value: 20, unit: 'santim', year: 1987, d: 23, metal: 'brass', motif: 'star' }),
      note({ id: 'dh-100-1987', value: 100, unit: 'dirham', year: 1987, size: [153, 75], ink: '#9b6a3e', motif: 'rose', issuer: 'bam' }), // P62, desert rose
      coin({ id: 'dh-5-1987', value: 5, unit: 'dirham', year: 1987, d: 25, metal: 'nickel', center: 'brass', motif: 'crown' }),
      note({ id: 'dh-20-1996', value: 20, unit: 'dirham', year: 1996, size: [130, 68], ink: '#b06a45', motif: 'mosque', issuer: 'bam' }), // P67, Hassan II Mosque
      coin({ id: 's-10-1987', value: 10, unit: 'santim', year: 1987, d: 20, metal: 'brass', motif: 'star' }),
    ],
  },
  {
    id: 'dirham-2002',
    from: 2002,
    to: 2012,
    name: { ar: 'سلسلة 2002', fr: 'Série 2002', en: '2002 series' },
    pieces: [
      note({ id: 'dh-200-2002', value: 200, unit: 'dirham', year: 2002, size: [158, 78], ink: '#3f74a6', motif: 'lighthouse', issuer: 'bam' }), // P71, El Hank lighthouse
      coin({ id: 'dh-10-2002', value: 10, unit: 'dirham', year: 2002, d: 27, metal: 'brass', center: 'nickel', motif: 'crown' }),
      note({ id: 'dh-20-2005', value: 20, unit: 'dirham', year: 2005, size: [140, 70], ink: '#6c64a8', motif: 'gate', issuer: 'bam' }), // P68, Bab Chellah
      coin({ id: 'dh-2-2002', value: 2, unit: 'dirham', year: 2002, d: 26, metal: 'nickel', motif: 'crown' }),
      note({ id: 'dh-50-2002', value: 50, unit: 'dirham', year: 2002, size: [147, 70], ink: '#5f9448', motif: 'kasbah', issuer: 'bam' }), // P69, ksour
      coin({ id: 'dh-5-2002', value: 5, unit: 'dirham', year: 2002, d: 25, metal: 'nickel', center: 'brass', motif: 'crown' }),
      note({ id: 'dh-100-2002', value: 100, unit: 'dirham', year: 2002, size: [150, 78], ink: '#a8763e', motif: 'palm', issuer: 'bam' }), // P70, Green March
      coin({ id: 's-20-2002', value: 20, unit: 'santim', year: 2002, d: 23, metal: 'brass', motif: 'star' }),
      note({ id: 'dh-25-2012', value: 25, unit: 'dirham', year: 2012, size: [140, 70], ink: '#c48a2c', motif: 'star', issuer: 'bam' }), // P73, 25 years of Dar As-Sikkah
      coin({ id: 'dh-1-2002', value: 1, unit: 'dirham', year: 2002, d: 24, metal: 'nickel', motif: 'crown' }),
      note({ id: 'dh-50-2009', value: 50, unit: 'dirham', year: 2009, size: [147, 70], ink: '#2f6d50', motif: 'star', issuer: 'bam' }), // P72, 50 years of the central bank
    ],
  },
  {
    id: 'dirham-2013',
    from: 2013,
    to: 2023,
    name: { ar: 'سلسلة 2013', fr: 'Série 2013', en: '2013 series' },
    pieces: [
      note({ id: 'dh-200-2013', value: 200, unit: 'dirham', year: 2013, size: [151, 70], ink: '#4d63b8', motif: 'ship', issuer: 'bam' }), // P77, Tanger Med port
      coin({ id: 'dh-10-2011', value: 10, unit: 'dirham', year: 2011, d: 27, metal: 'brass', center: 'nickel', motif: 'rose' }), // Kalaat M'Gouna
      note({ id: 'dh-50-2013', value: 50, unit: 'dirham', year: 2013, size: [138, 70], ink: '#3e9c74', motif: 'falls', issuer: 'bam' }), // P75, Ouzoud Falls
      coin({ id: 'dh-5-2011', value: 5, unit: 'dirham', year: 2011, d: 25, metal: 'nickel', center: 'brass', motif: 'mosque' }), // Hassan II Mosque
      note({ id: 'dh-100-2013', value: 100, unit: 'dirham', year: 2013, size: [145, 70], ink: '#c27a4a', motif: 'tent', issuer: 'bam' }), // P76, Sahrawi tent and wind farm
      coin({ id: 's-10-2011', value: 10, unit: 'santim', year: 2011, d: 20, metal: 'brass', motif: 'bee' }), // bee and saffron
      note({ id: 'dh-20-2013', value: 20, unit: 'dirham', year: 2013, size: [131, 70], ink: '#6a4a96', motif: 'train', issuer: 'bam' }), // P74, train on the Hassan II bridge
      coin({ id: 'dh-0.5-2011', value: '½', unit: 'dirham', year: 2011, d: 21, metal: 'nickel', motif: 'fish' }),
      note({ id: 'dh-20-2019', value: 20, unit: 'dirham', year: 2019, size: [130, 70], ink: '#7a5aa8', motif: 'star', issuer: 'bam', polymer: true }), // P78, polymer, 20 years of reign
      coin({ id: 's-20-2011', value: 20, unit: 'santim', year: 2011, d: 23, metal: 'brass', motif: 'lily' }), // water lilies
      coin({ id: 'dh-1-2011', value: 1, unit: 'dirham', year: 2011, d: 24, metal: 'nickel', motif: 'crown' }),
    ],
  },
  {
    id: 'dirham-2023',
    from: 2023,
    to: null,
    name: { ar: 'السلسلة الجديدة', fr: 'Nouvelle série', en: 'New series' },
    pieces: [
      note({ id: 'dh-200-2024', value: 200, unit: 'dirham', year: 2024, size: [151, 70], ink: '#2f8fa0', motif: 'bridge', issuer: 'bam' }), // Mohammed VI Bridge
      coin({ id: 'dh-10-2023', value: 10, unit: 'dirham', year: 2023, d: 27, metal: 'brass', center: 'nickel', motif: 'train' }), // bridge and high-speed train
      note({ id: 'dh-100-2023', value: 100, unit: 'dirham', year: 2023, size: [144, 70], ink: '#a4513f', motif: 'mosque', issuer: 'bam' }), // Hassan II Mosque
      coin({ id: 'dh-5-2023', value: 5, unit: 'dirham', year: 2023, d: 25, metal: 'nickel', center: 'brass', motif: 'mechouar' }), // Place Mechouar, Laayoune
      note({ id: 'dh-50-2024', value: 50, unit: 'dirham', year: 2024, size: [137, 70], ink: '#5c9a3e', motif: 'falls', issuer: 'bam' }), // Ouzoud Falls
      coin({ id: 's-20-2023', value: 20, unit: 'santim', year: 2023, d: 23, metal: 'brass', motif: 'solar' }), // wind and solar
      note({ id: 'dh-20-2024', value: 20, unit: 'dirham', year: 2024, size: [130, 70], ink: '#7b55a6', motif: 'arch', issuer: 'bam' }), // Al Quaraouiyine
      coin({ id: 'dh-0.5-2023', value: '½', unit: 'dirham', year: 2023, d: 21, metal: 'nickel', motif: 'jewel' }), // jewellery
      coin({ id: 's-10-2023', value: 10, unit: 'santim', year: 2023, d: 20, metal: 'brass', motif: 'olive' }), // olives
      coin({ id: 'dh-1-2023', value: 1, unit: 'dirham', year: 2023, d: 24, metal: 'nickel', motif: 'crown' }),
    ],
  },
]

/** Era order on screen: today's money first, then from the oldest forward. */
export const ERA_SEQUENCE: number[] = [ERAS.length - 1, ...ERAS.slice(0, -1).map((_, i) => i)]

export const eraAtStep = (step: number): Era => ERAS[ERA_SEQUENCE[step % ERA_SEQUENCE.length] ?? ERAS.length - 1]!

