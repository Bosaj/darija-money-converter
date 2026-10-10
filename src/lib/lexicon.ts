import { normalize } from './normalize'
import { UNITS, UNIT_IDS, type UnitId } from './conventions'

export type Token =
  | { kind: 'num'; value: number } // additive number word: 1..999, 2000 handled as mag
  | { kind: 'mag'; value: number; count?: number; plural?: boolean; santimDefault?: boolean } // ألف / آلاف / مليون / مليار (count: built-in multiplier, e.g. مليونين = 2)
  | { kind: 'hundred' } // مية (can multiply a preceding 1..9)
  | { kind: 'half' }
  | { kind: 'quarter' } // ربع — 4 or 1/4, resolved by context
  | { kind: 'unit'; unit: UnitId }
  | { kind: 'and' }
  | { kind: 'skip' }

const NUMBERS: Record<number, string[]> = {
  0: ['صفر', 'zero', 'sifr', 'zéro'],
  1: ['واحد', 'وحده', 'وحد', 'wahed', 'wa7ed', 'wahd', 'wa7d', 'un', 'une', 'one'],
  2: ['جوج', 'زوج', 'joj', 'jouj', 'zouj', 'zoj', 'deux', 'two'],
  3: ['تلاته', 'تلات', 'تلت', 'ثلاثه', 'ثلاث', 'tlata', 'tlat', 'tlt', 'tlta', 'trois', 'three'],
  4: ['ربعه', 'اربعه', 'reb3a', 'rb3a', 'rab3a', 'rebaa', 'quatre', 'four'],
  5: ['خمسه', 'خمس', 'khamsa', 'khmsa', 'khams', 'khms', 'khems', 'cinq', 'five'],
  6: ['سته', 'ست', 'setta', 'stta', 'sta', 'sett', 'six'],
  7: ['سبعه', 'سبع', 'seb3a', 'sb3a', 'seb3', 'sb3', 'sept', 'seven'],
  8: ['تمنيه', 'تمن', 'ثمانيه', 'tmenya', 'tmnya', 'tmen', 'tmn', 'huit', 'eight'],
  9: ['تسعود', 'تسعه', 'تسع', 'tes3oud', 'ts3oud', 'tes3a', 'ts3a', 'tes3', 'ts3', 'neuf', 'nine'],
  10: ['عشره', 'عشر', '3achra', '3chra', '3ashra', '3ashr', '3achr', 'dix', 'ten'],
  11: ['حضاش', 'حداش', 'حضاشر', '7dach', 'hdach', 'hdash', 'onze', 'eleven'],
  12: ['طناش', 'طناشر', 'tnach', 'tnash', 'douze', 'twelve'],
  13: ['تلطاش', 'تلطاشر', 'teltach', 'tltach', 'treize'],
  14: ['ربعطاش', 'ربعطاشر', 'reb3tach', 'rb3tach', 'quatorze'],
  15: ['خمسطاش', 'خمسطاشر', 'khamstach', 'khmstach', 'quinze'],
  16: ['سطاش', 'سطاشر', 'settach', 'sttach', 'stach', 'seize'],
  17: ['سبعطاش', 'سبعطاشر', 'seb3tach', 'sb3tach'],
  18: ['تمنطاش', 'تمنطاشر', 'tmentach', 'tmntach'],
  19: ['تسعطاش', 'تسعطاشر', 'tes3tach', 'ts3tach'],
  20: ['عشرين', '3echrin', '3chrin', '3ichrin', '3eshrin', '3achrin', 'vingt', 'twenty'],
  30: ['تلاتين', 'ثلاثين', 'tlatin', 'tlatine', 'trente', 'thirty'],
  40: ['ربعين', 'اربعين', 'reb3in', 'rb3in', 'quarante', 'forty'],
  50: ['خمسين', 'khamsin', 'khmsin', 'cinquante', 'fifty'],
  60: ['ستين', 'settin', 'sttin', 'stin', 'soixante', 'sixty'],
  70: ['سبعين', 'seb3in', 'sb3in', 'seventy'],
  80: ['تمانين', 'ثمانين', 'tmanin', 'eighty'],
  90: ['تسعين', 'tes3in', 'ts3in', 'ninety'],
  200: ['ميتين', 'ميتان', 'mitin', 'mitine', 'miatin', 'myatin'],
  300: ['تلتميه', 'teltmya', 'tltmya', 'tlatmya'],
  400: ['ربعميه', 'reb3mya', 'rb3mya'],
  500: ['خمسميه', 'khamsmya', 'khmsmya', 'khemsmya'],
  600: ['ستميه', 'settmya', 'sttmya', 'stmya'],
  700: ['سبعميه', 'seb3mya', 'sb3mya'],
  800: ['تمنميه', 'tmenmya', 'tmnmya'],
  900: ['تسعميه', 'tes3mya', 'ts3mya'],
}

const LEXICON = new Map<string, Token>()

function add(words: string[], token: Token) {
  for (const w of words) LEXICON.set(normalize(w), token)
}

for (const [value, words] of Object.entries(NUMBERS)) add(words, { kind: 'num', value: Number(value) })
add(['ميه', 'مايه', 'مائه', 'مياه', 'mya', 'mia', 'miya', 'meya', 'cent', 'hundred'], { kind: 'hundred' })
add(['الف', 'alf', 'mille', 'thousand'], { kind: 'mag', value: 1e3 })
add(['الاف', 'alaf', 'alaaf', 'thousands'], { kind: 'mag', value: 1e3, plural: true })
add(['الفين', 'alfin', 'alfine', 'alfain'], { kind: 'mag', value: 1e3, count: 2 })
add(['مليون', 'ملاين', 'ملايين', 'melyoun', 'mlyoun', 'melyon', 'mlyon', 'million', 'millions', 'melyun'], { kind: 'mag', value: 1e6, santimDefault: true })
add(['مليونين', 'melyounin', 'mlyounin'], { kind: 'mag', value: 1e6, count: 2, santimDefault: true })
add(['مليار', 'ملايير', 'mlyar', 'melyar', 'milliard', 'milliards', 'billion'], { kind: 'mag', value: 1e9, santimDefault: true })
add(['مليارين', 'mlyarin'], { kind: 'mag', value: 1e9, count: 2, santimDefault: true })
add(['نص', 'نصف', 'nss', 'nos', 'ness', 'nes', 'nous', 'demi', 'half'], { kind: 'half' })
add(['ربع', 'reb3', 'rb3', 'rob3', 'quart', 'quarter'], { kind: 'quarter' })
add(['و', 'w', 'ou', 'et', 'and', '&', '+'], { kind: 'and' })
add(['د', 'ديال', 'dyal', 'dial', 'd', 'dl', 'de', 'du', 'des', 'of', 'the', 'ب', 'b', 'bi', 'ال', 'l', 'شحال', 'بشحال', 'ch7al', 'chhal', 'bch7al', 'bchhal', 'فيه', 'fih', 'هو', 'هي', 'غير', 'ghir', 'only', 'seulement', 'prix', 'price', 'ثمن', 'taman', '=', '?', '؟', 'a', 'à', 'en'], { kind: 'skip' })

for (const id of UNIT_IDS) add(UNITS[id].aliases, { kind: 'unit', unit: id })

/* Multi-word unit names ("ريال سعودي", "dollar canadien") win over single words, so they never clash with the Moroccan rial/franc. */
const PHRASES = new Map<string, Token>()
const MAX_PHRASE = 3

function phraseWord(w: string): string {
  return /[؀-ۿ]/.test(w) ? w.replace(/^(?:و|ب|ل)?(?:ال)?/, '') : w
}
for (const id of UNIT_IDS)
  for (const p of UNITS[id].phrases ?? []) PHRASES.set(normalize(p).split(/\s+/).map(phraseWord).join(' '), { kind: 'unit', unit: id })

/** Longest multi-word unit name starting at `words[i]`. */
export function lookupPhrase(words: string[], i: number): { token: Token; len: number } | undefined {
  for (let len = Math.min(MAX_PHRASE, words.length - i); len >= 2; len--) {
    const hit = PHRASES.get(words.slice(i, i + len).map(phraseWord).join(' '))
    if (hit) return { token: hit, len }
  }
  return undefined
}

const AR_PREFIXES = ['وبال', 'وال', 'بال', 'دال', 'ودال', 'وب', 'ول', 'ال', 'و', 'ب', 'د', 'ل']
const LATIN_PREFIXES = ['wdl', 'bdl', 'dl', 'w', 'b', 'l', 'd']

/** Look up a single (already normalized) token, peeling Darija clitics: و ب ال د ل. */
export function lookup(word: string): Token | undefined {
  const direct = LEXICON.get(word)
  if (direct) return direct
  const isArabic = /[؀-ۿ]/.test(word)
  for (const p of isArabic ? AR_PREFIXES : LATIN_PREFIXES) {
    if (word.length > p.length + 1 && word.startsWith(p)) {
      const hit = LEXICON.get(word.slice(p.length))
      if (hit && hit.kind !== 'skip' && hit.kind !== 'and') return hit
    }
  }
  return undefined
}

/** True when a token is a clitic-prefixed "و…" (e.g. "ونص", "wnss"), which matters for ربع = 1/4. */
export function hasAndPrefix(word: string): boolean {
  return (word.startsWith('و') || word.startsWith('w')) && !LEXICON.has(word)
}
