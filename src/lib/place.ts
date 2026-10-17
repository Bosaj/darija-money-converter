import type { ForeignId, PresetId } from './conventions.js'

/**
 * Offline place detection: the browser's coordinates are matched against a
 * built-in city list and rough country boxes. Nothing leaves the device.
 */

export interface City {
  name: string
  ar: string
  lat: number
  lon: number
  preset: Exclude<PresetId, 'custom'>
}

export const CITIES: City[] = [
  // North (Tanger–Tétouan–Al Hoceïma)
  { name: 'Tangier', ar: 'طنجة', lat: 35.7595, lon: -5.834, preset: 'north' },
  { name: 'Tetouan', ar: 'تطوان', lat: 35.5785, lon: -5.3684, preset: 'north' },
  { name: 'Chefchaouen', ar: 'الشاون', lat: 35.1688, lon: -5.2636, preset: 'north' },
  { name: 'Larache', ar: 'العرائش', lat: 35.1932, lon: -6.1557, preset: 'north' },
  { name: 'Asilah', ar: 'أصيلة', lat: 35.465, lon: -6.034, preset: 'north' },
  { name: 'Ksar El Kebir', ar: 'القصر الكبير', lat: 35.0017, lon: -5.9093, preset: 'north' },
  { name: 'Fnideq', ar: 'الفنيدق', lat: 35.849, lon: -5.357, preset: 'north' },
  { name: "M'diq", ar: 'المضيق', lat: 35.6858, lon: -5.3253, preset: 'north' },
  { name: 'Al Hoceima', ar: 'الحسيمة', lat: 35.2517, lon: -3.9372, preset: 'rif' },
  { name: 'Ouazzane', ar: 'وزان', lat: 34.7967, lon: -5.58, preset: 'north' },
  // Oriental
  { name: 'Oujda', ar: 'وجدة', lat: 34.6814, lon: -1.9086, preset: 'oriental' },
  { name: 'Berkane', ar: 'بركان', lat: 34.92, lon: -2.32, preset: 'oriental' },
  { name: 'Nador', ar: 'الناظور', lat: 35.1681, lon: -2.9335, preset: 'rif' },
  { name: 'Zaio', ar: 'زايو', lat: 34.9405, lon: -2.7325, preset: 'rif' },
  { name: 'Imzouren', ar: 'إمزورن', lat: 35.1448, lon: -3.8505, preset: 'rif' },
  { name: 'Taourirt', ar: 'تاوريرت', lat: 34.4073, lon: -2.8973, preset: 'oriental' },
  { name: 'Jerada', ar: 'جرادة', lat: 34.3117, lon: -2.1636, preset: 'oriental' },
  { name: 'Saidia', ar: 'السعيدية', lat: 35.085, lon: -2.239, preset: 'oriental' },
  { name: 'Driouch', ar: 'الدريوش', lat: 34.976, lon: -3.392, preset: 'rif' },
  { name: 'Guercif', ar: 'جرسيف', lat: 34.2257, lon: -3.3536, preset: 'oriental' },
  { name: 'Figuig', ar: 'فجيج', lat: 32.109, lon: -1.229, preset: 'oriental' },
  { name: 'Bouarfa', ar: 'بوعرفة', lat: 32.53, lon: -1.965, preset: 'oriental' },
  // Rest of Morocco
  { name: 'Casablanca', ar: 'الدار البيضاء', lat: 33.5731, lon: -7.5898, preset: 'general' },
  { name: 'Rabat', ar: 'الرباط', lat: 34.0209, lon: -6.8416, preset: 'general' },
  { name: 'Salé', ar: 'سلا', lat: 34.0331, lon: -6.7985, preset: 'general' },
  { name: 'Kenitra', ar: 'القنيطرة', lat: 34.261, lon: -6.5802, preset: 'general' },
  { name: 'Mohammedia', ar: 'المحمدية', lat: 33.6866, lon: -7.383, preset: 'general' },
  { name: 'Fes', ar: 'فاس', lat: 34.0181, lon: -5.0078, preset: 'general' },
  { name: 'Meknes', ar: 'مكناس', lat: 33.8935, lon: -5.5473, preset: 'general' },
  { name: 'Ifrane', ar: 'إفران', lat: 33.5228, lon: -5.1106, preset: 'general' },
  { name: 'Taza', ar: 'تازة', lat: 34.21, lon: -4.01, preset: 'general' },
  { name: 'Khemisset', ar: 'الخميسات', lat: 33.824, lon: -6.066, preset: 'general' },
  { name: 'Marrakech', ar: 'مراكش', lat: 31.6295, lon: -7.9811, preset: 'general' },
  { name: 'El Jadida', ar: 'الجديدة', lat: 33.2316, lon: -8.5007, preset: 'general' },
  { name: 'Settat', ar: 'سطات', lat: 33.001, lon: -7.6166, preset: 'general' },
  { name: 'Khouribga', ar: 'خريبكة', lat: 32.8811, lon: -6.9063, preset: 'general' },
  { name: 'Beni Mellal', ar: 'بني ملال', lat: 32.3373, lon: -6.3498, preset: 'general' },
  { name: 'Safi', ar: 'آسفي', lat: 32.2994, lon: -9.2372, preset: 'general' },
  { name: 'Essaouira', ar: 'الصويرة', lat: 31.5085, lon: -9.7595, preset: 'general' },
  { name: 'Agadir', ar: 'أكادير', lat: 30.4278, lon: -9.5981, preset: 'general' },
  { name: 'Tiznit', ar: 'تيزنيت', lat: 29.6974, lon: -9.7316, preset: 'general' },
  { name: 'Ouarzazate', ar: 'ورزازات', lat: 30.9189, lon: -6.8934, preset: 'general' },
  { name: 'Errachidia', ar: 'الرشيدية', lat: 31.9314, lon: -4.4246, preset: 'general' },
  { name: 'Guelmim', ar: 'كلميم', lat: 28.987, lon: -10.0574, preset: 'general' },
  { name: 'Laayoune', ar: 'العيون', lat: 27.1253, lon: -13.1625, preset: 'general' },
  { name: 'Dakhla', ar: 'الداخلة', lat: 23.6848, lon: -15.958, preset: 'general' },
]

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180
  const dLat = (bLat - aLat) * rad
  const dLon = (bLon - aLon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function nearestCity(lat: number, lon: number): { city: City; km: number } {
  let best = CITIES[0]!
  let bestKm = Infinity
  for (const c of CITIES) {
    const km = distanceKm(lat, lon, c.lat, c.lon)
    if (km < bestKm) {
      best = c
      bestKm = km
    }
  }
  return { city: best, km: bestKm }
}

/** Rough boxes, checked in order (smaller countries first), for the home currency of people abroad. */
const COUNTRIES: { code: string; currency: ForeignId; box: [number, number, number, number] }[] = [
  { code: 'CH', currency: 'chf', box: [45.8, 47.9, 5.9, 10.5] },
  { code: 'BE', currency: 'eur', box: [49.5, 51.5, 2.5, 6.4] },
  { code: 'NL', currency: 'eur', box: [50.7, 53.6, 3.3, 7.2] },
  { code: 'AE', currency: 'aed', box: [22.6, 26.1, 51.5, 56.4] },
  { code: 'FR', currency: 'eur', box: [41.3, 51.1, -5.2, 9.6] },
  { code: 'ES', currency: 'eur', box: [36, 43.8, -9.4, 3.4] },
  { code: 'IT', currency: 'eur', box: [36.6, 47.1, 6.6, 18.6] },
  { code: 'DE', currency: 'eur', box: [47.2, 55.1, 5.8, 15.1] },
  { code: 'GB', currency: 'gbp', box: [49.9, 58.7, -8.2, 1.8] },
  { code: 'SA', currency: 'sar', box: [16.3, 32.2, 34.5, 55.7] },
  // southern Canada (Québec–Ontario corridor) sits inside the US box, so it is checked first
  { code: 'CA', currency: 'cad', box: [45, 47.5, -79.5, -70.5] },
  { code: 'CA', currency: 'cad', box: [43.3, 45, -80.5, -76.2] },
  { code: 'CA', currency: 'cad', box: [49, 72, -141, -52.6] },
  { code: 'US', currency: 'usd', box: [24.5, 49.4, -125, -66.9] },
  { code: 'CA', currency: 'cad', box: [41.7, 72, -141, -52.6] },
]

export function countryFor(lat: number, lon: number): { code: string; currency: ForeignId } | null {
  for (const c of COUNTRIES) {
    const [s, n, w, e] = c.box
    if (lat >= s && lat <= n && lon >= w && lon <= e) return { code: c.code, currency: c.currency }
  }
  return null
}

export type Place =
  | { kind: 'morocco'; city: City; km: number }
  | { kind: 'abroad'; country: string | null; currency: ForeignId | null }

/** Within ~120 km of a listed Moroccan city counts as Morocco. */
export function placeFor(lat: number, lon: number): Place {
  const { city, km } = nearestCity(lat, lon)
  if (km <= 120) return { kind: 'morocco', city, km }
  const c = countryFor(lat, lon)
  return { kind: 'abroad', country: c?.code ?? null, currency: c?.currency ?? null }
}

/** No-permission hint from the time zone (e.g. Europe/Paris → EUR). */
export function timezoneCurrency(tz = Intl.DateTimeFormat().resolvedOptions().timeZone): ForeignId | null {
  if (!tz) return null
  if (tz === 'Europe/London') return 'gbp'
  if (tz === 'Europe/Zurich') return 'chf'
  if (tz === 'Asia/Riyadh') return 'sar'
  if (tz === 'Asia/Dubai') return 'aed'
  if (/^America\/(Toronto|Vancouver|Montreal|Edmonton|Winnipeg|Halifax)/.test(tz)) return 'cad'
  if (tz.startsWith('America/')) return 'usd'
  if (tz.startsWith('Europe/')) return 'eur'
  return null
}

export function locate(timeout = 10_000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'))
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout, maximumAge: 10 * 60_000 })
  })
}
