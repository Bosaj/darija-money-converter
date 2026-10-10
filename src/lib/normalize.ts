const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'

/**
 * Canonical form used for both lexicon keys and user input, so spelling
 * variants (أ/إ/آ, ة/ه, ى/ي, harakat, tatweel, Eastern digits, é/e) match.
 */
export function normalize(text: string): string {
  let s = text.toLowerCase().normalize('NFD')
  // Latin accents, harakat, hamza/madda marks and tatweel
  s = s.replace(/[̀-ًͯ-ٰٟـ]/g, '')
  s = s.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)))
  s = s.replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
  s = s.replace(/٫/g, '.').replace(/٬/g, ',').replace(/،/g, ' ')
  s = s.replace(/ٱ/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  return s.normalize('NFC')
}
