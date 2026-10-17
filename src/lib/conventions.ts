import raw from '../data/conventions.json' with { type: 'json' }
import type { MadRates } from './rates.js'

export const LOCAL_IDS = ['dirham', 'rial', 'santim', 'franc', 'million', 'mlyar', 'doro', 'mya'] as const
export const FOREIGN_IDS = ['eur', 'usd', 'gbp', 'cad', 'chf', 'sar', 'aed'] as const
export const UNIT_IDS = [...LOCAL_IDS, ...FOREIGN_IDS] as const
export type LocalId = (typeof LOCAL_IDS)[number]
export type ForeignId = (typeof FOREIGN_IDS)[number]
export type UnitId = LocalId | ForeignId

export type PresetId = 'general' | 'oriental' | 'rif' | 'north' | 'custom'
export type Lang = 'ar' | 'fr' | 'en'
/** What "franc" means: the santim (1/100 DH, the historical meaning) or a whole dirham (some French speakers). */
export type FrancMode = 'santim' | 'dirham'

export interface UnitDef {
  factor: number | null
  verified: boolean
  foreign?: boolean
  code?: string
  symbol: string
  names: { ar: string; latin: string; fr: string; en: string }
  plural: { ar: string; latin: string }
  aliases: string[]
  phrases?: string[] // multi-word names, e.g. "ريال سعودي"
  source: string
}

export interface Override {
  factor: number | null
  verified?: boolean
  note?: string
}

export interface PresetDef {
  names: Record<Lang, string>
  cities: Record<Lang, string>
  overrides: Partial<Record<UnitId, Override>>
}

/** A unit after the active preset is applied. `factor` = Dirham value of one unit. */
export interface ResolvedUnit {
  id: UnitId
  factor: number | null
  verified: boolean
  note?: string
  def: UnitDef
}

export type ResolvedUnits = Record<UnitId, ResolvedUnit>

export const UNITS = raw.units as Record<UnitId, UnitDef>
export const PRESETS = raw.presets as Record<Exclude<PresetId, 'custom'>, PresetDef>
export const DEFAULT_PRESET = raw.defaultPreset as Exclude<PresetId, 'custom'>

/** Custom preset: user-entered factors layered on top of the general preset. */
export type CustomFactors = Partial<Record<UnitId, number | null>>

export const isForeign = (id: UnitId): id is ForeignId => (FOREIGN_IDS as readonly string[]).includes(id)

export function resolveUnits(preset: PresetId, custom: CustomFactors = {}, rates?: MadRates, franc: FrancMode = 'santim'): ResolvedUnits {
  const base = preset === 'custom' ? PRESETS[DEFAULT_PRESET] : PRESETS[preset]
  const out = {} as ResolvedUnits
  for (const id of UNIT_IDS) {
    const def = UNITS[id]
    if (isForeign(id)) {
      out[id] = { id, factor: rates?.[id] ?? null, verified: true, def }
      continue
    }
    const override = base.overrides[id]
    let factor = override ? override.factor : def.factor
    let verified = override?.verified ?? def.verified
    let note = override?.note
    if (preset === 'custom' && id in custom) {
      const value = custom[id]
      factor = value === undefined ? factor : value
      verified = false
      note = 'custom'
    }
    if (id === 'franc' && franc === 'dirham') {
      factor = 1
      verified = false
      note = 'franc-dirham'
    }
    out[id] = { id, factor: factor && factor > 0 ? factor : null, verified, note, def }
  }
  return out
}
