import raw from '../data/conventions.json'

export const UNIT_IDS = ['dirham', 'rial', 'santim', 'million', 'mlyar', 'doro'] as const
export type UnitId = (typeof UNIT_IDS)[number]

export type PresetId = 'general' | 'oriental' | 'north' | 'custom'
export type Lang = 'ar' | 'fr' | 'en'

export interface UnitDef {
  factor: number | null
  verified: boolean
  symbol: string
  names: { ar: string; latin: string; fr: string; en: string }
  plural: { ar: string; latin: string }
  aliases: string[]
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

export function resolveUnits(preset: PresetId, custom: CustomFactors = {}): ResolvedUnits {
  const base = preset === 'custom' ? PRESETS[DEFAULT_PRESET] : PRESETS[preset]
  const out = {} as ResolvedUnits
  for (const id of UNIT_IDS) {
    const def = UNITS[id]
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
    out[id] = { id, factor: factor && factor > 0 ? factor : null, verified, note, def }
  }
  return out
}
