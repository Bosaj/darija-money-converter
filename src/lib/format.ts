import type { Lang, ResolvedUnit } from './conventions'
import { NUMBER_LOCALE } from '../i18n/strings'

const cache = new Map<string, Intl.NumberFormat>()

function nf(lang: Lang, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = lang + JSON.stringify(opts)
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(NUMBER_LOCALE[lang], opts)
    cache.set(key, f)
  }
  return f
}

/** Money-style: up to 2 decimals for ≥ 1, 3 significant digits below 1 (0.005 M). */
export function fmt(n: number, lang: Lang): string {
  if (n === 0) return '0'
  if (Math.abs(n) >= 1) return nf(lang, { maximumFractionDigits: 2 }).format(n)
  return nf(lang, { maximumSignificantDigits: 3 }).format(n)
}

export function fmtDirham(n: number, lang: Lang): string {
  return nf(lang, { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n)
}

export function unitName(unit: ResolvedUnit, lang: Lang): string {
  return unit.def.names[lang]
}

/** Secondary label: the other script, so visitors and locals both recognise the unit. */
export function unitAltName(unit: ResolvedUnit, lang: Lang): string {
  return lang === 'ar' ? unit.def.names.latin : unit.def.names.ar
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

export const REPO_URL = 'https://github.com/Bosaj/darija-money-converter'

export function reportUrl(unitLabel: string, regionLabel: string): string {
  const params = new URLSearchParams({
    template: 'regional-value.yml',
    title: `Regional value: ${unitLabel} in ${regionLabel}`,
    labels: 'data,regional-value',
  })
  return `${REPO_URL}/issues/new?${params}`
}
