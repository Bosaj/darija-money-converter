/**
 * Spell whole numbers the way they are said in Moroccan Darija, in Arabic
 * script and in Latin "Arabizi" (for visitors). Every word produced here is
 * also understood by the parser (see lexicon.ts) — tests round-trip them.
 */

export type Script = 'ar' | 'latin'

interface Words {
  ones: string[] // 0..19
  tens: string[] // index = tens digit (2..9)
  hundreds: string[] // index = hundreds digit (1..9)
  counted: string[] // short count form used before plural nouns, 3..10
  thousand: string
  twoThousand: string
  thousands: string
  million: string
  twoMillion: string
  mlyar: string
  twoMlyar: string
  of: string // "د" in "خمسة د المليون"
  and: string
}

const AR: Words = {
  ones: ['صفر', 'واحد', 'جوج', 'تلاتة', 'ربعة', 'خمسة', 'ستة', 'سبعة', 'تمنية', 'تسعود', 'عشرة',
    'حضاش', 'طناش', 'تلطاش', 'ربعطاش', 'خمسطاش', 'سطاش', 'سبعطاش', 'تمنطاش', 'تسعطاش'],
  tens: ['', '', 'عشرين', 'تلاتين', 'ربعين', 'خمسين', 'ستين', 'سبعين', 'تمانين', 'تسعين'],
  hundreds: ['', 'مية', 'ميتين', 'تلتمية', 'ربعمية', 'خمسمية', 'ستمية', 'سبعمية', 'تمنمية', 'تسعمية'],
  counted: ['', '', '', 'تلت', 'ربع', 'خمس', 'ست', 'سبع', 'تمن', 'تسع', 'عشر'],
  thousand: 'ألف',
  twoThousand: 'ألفين',
  thousands: 'آلاف',
  million: 'مليون',
  twoMillion: 'جوج د المليون',
  mlyar: 'مليار',
  twoMlyar: 'جوج د المليار',
  of: 'د',
  and: 'و',
}

const LATIN: Words = {
  ones: ['zero', 'wahed', 'jouj', 'tlata', 'reb3a', 'khamsa', 'setta', 'seb3a', 'tmenya', 'tes3oud', '3achra',
    'hdach', 'tnach', 'teltach', 'reb3tach', 'khamstach', 'settach', 'seb3tach', 'tmentach', 'tes3tach'],
  tens: ['', '', '3echrin', 'tlatin', 'reb3in', 'khamsin', 'settin', 'seb3in', 'tmanin', 'tes3in'],
  hundreds: ['', 'mya', 'mitin', 'teltmya', 'reb3mya', 'khamsmya', 'settmya', 'seb3mya', 'tmenmya', 'tes3mya'],
  counted: ['', '', '', 'tlt', 'reb3', 'khams', 'sett', 'seb3', 'tmen', 'tes3', '3ashr'],
  thousand: 'alf',
  twoThousand: 'alfin',
  thousands: 'alaf',
  million: 'melyoun',
  twoMillion: 'jouj dlmelyoun',
  mlyar: 'mlyar',
  twoMlyar: 'jouj dlmlyar',
  of: 'dl',
  and: 'w',
}

const WORDS: Record<Script, Words> = { ar: AR, latin: LATIN }

function below1000(n: number, w: Words): string[] {
  const parts: string[] = []
  const h = Math.floor(n / 100)
  const rest = n % 100
  if (h) parts.push(w.hundreds[h]!)
  if (rest) {
    if (rest < 20) parts.push(w.ones[rest]!)
    else {
      const t = Math.floor(rest / 10)
      const o = rest % 10
      // Darija puts the unit first: "خمسة و عشرين" (25)
      parts.push(o ? `${w.ones[o]} ${w.and} ${w.tens[t]}` : w.tens[t]!)
    }
  }
  return parts
}

function group(n: number, w: Words, one: string, two: string, plural: string | null, ofForm: boolean): string {
  if (n === 1) return one
  if (n === 2) return two
  if (n <= 10) {
    if (plural) return `${w.counted[n]} ${plural}` // تلت آلاف
    if (ofForm) return `${w.ones[n]} ${w.of === 'dl' ? `dl${one}` : `${w.of} ال${one}`}` // خمسة د المليون
  }
  return `${below1000(n, w).join(` ${w.and} `)} ${one}`
}

/** Spell a non-negative integer. Supports up to 999 milliards. */
export function spellNumber(value: number, script: Script = 'ar'): string {
  const w = WORDS[script]
  const n = Math.round(Math.abs(value))
  if (n === 0) return w.ones[0]!
  const mlyar = Math.floor(n / 1e9)
  const million = Math.floor((n % 1e9) / 1e6)
  const thousand = Math.floor((n % 1e6) / 1e3)
  const rest = n % 1e3
  const parts: string[] = []
  if (mlyar) parts.push(group(mlyar, w, w.mlyar, w.twoMlyar, null, true))
  if (million) parts.push(group(million, w, w.million, w.twoMillion, null, true))
  if (thousand) parts.push(group(thousand, w, w.thousand, w.twoThousand, w.thousands, false))
  if (rest) parts.push(...below1000(rest, w))
  return parts.join(` ${w.and} `)
}

/**
 * Number + noun with Darija agreement: 1 → "درهم", 2..10 → plural
 * ("جوج دراهم", "خمس دراهم"), 11+ → singular ("عشرين درهم").
 */
export function spellCount(value: number, singular: string, plural: string, script: Script = 'ar'): string {
  const w = WORDS[script]
  const n = Math.round(Math.abs(value))
  if (n === 1) return script === 'ar' ? `${singular} واحد` : `${singular} wahed`
  if (n === 2) return `${w.ones[2]} ${plural}`
  if (n >= 3 && n <= 10) return `${w.counted[n]} ${plural}`
  return `${spellNumber(n, script)} ${singular}`
}
