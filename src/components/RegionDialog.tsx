import { useEffect, useRef } from 'react'
import { Check, MapPin, X } from 'lucide-react'
import { PRESETS, UNITS, type CustomFactors, type Lang, type PresetId, type UnitId } from '../lib/conventions'
import type { Strings } from '../i18n/strings'
import { fmt, reportUrl } from '../lib/format'
import { Badge, IconButton } from './ui'

const EDITABLE: UnitId[] = ['rial', 'santim', 'doro']

interface Props {
  open: boolean
  onClose: () => void
  preset: PresetId
  onPreset: (p: PresetId) => void
  custom: CustomFactors
  onCustom: (c: CustomFactors) => void
  lang: Lang
  t: Strings
}

export function RegionDialog({ open, onClose, preset, onPreset, custom, onCustom, lang, t }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const options = (Object.keys(PRESETS) as Exclude<PresetId, 'custom'>[]).map((id) => ({ id, ...PRESETS[id] }))

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="region-title"
      className="m-auto mb-0 w-full max-w-lg rounded-t-[28px] border border-line bg-surface p-0 text-ink shadow-pop sm:mb-auto sm:rounded-[28px]"
    >
      <div className="max-h-[85dvh] overflow-y-auto p-5 sm:p-6">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 id="region-title" className="flex items-center gap-2 text-[18px] font-semibold">
            <MapPin size={18} className="text-brand" />
            {t.regionTitle}
          </h2>
          <IconButton label={t.done} onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <p className="mb-4 text-[13.5px] text-ink-2">{t.regionHint}</p>

        <div role="radiogroup" aria-labelledby="region-title" className="space-y-2">
          {options.map((o) => {
            const active = preset === o.id
            const doro = o.overrides.doro?.factor ?? UNITS.doro.factor
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onPreset(o.id)}
                className={`btn-press flex w-full items-center gap-3 rounded-[18px] border p-3.5 text-start ${active ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong'}`}
              >
                <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-brand bg-brand text-brand-ink' : 'border-line-strong'}`}>
                  {active && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold">{o.names[lang]}</span>
                  <span className="block truncate text-[12.5px] text-ink-3">{o.cities[lang]}</span>
                </span>
                <span className="shrink-0 text-end text-[12px] text-ink-2">
                  {UNITS.doro.names[lang]}: <span dir="ltr" className="tabular inline-block font-semibold">{doro ? `${fmt(doro, lang)} DH` : '—'}</span>
                </span>
              </button>
            )
          })}

          <div className={`rounded-[18px] border p-3.5 ${preset === 'custom' ? 'border-brand bg-brand-soft' : 'border-line'}`}>
            <button type="button" role="radio" aria-checked={preset === 'custom'} onClick={() => onPreset('custom')} className="flex w-full items-center gap-3 text-start">
              <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${preset === 'custom' ? 'border-brand bg-brand text-brand-ink' : 'border-line-strong'}`}>
                {preset === 'custom' && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="flex-1">
                <span className="block text-[14.5px] font-semibold">{t.custom}</span>
                <span className="block text-[12.5px] text-ink-3">{t.customHint}</span>
              </span>
            </button>
            {preset === 'custom' && (
              <div className="enter mt-3 grid grid-cols-3 gap-2">
                {EDITABLE.map((id) => (
                  <label key={id} className="block">
                    <span className="mb-1 block text-[12px] text-ink-2">{t.perUnit(UNITS[id].names[lang])}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      dir="ltr"
                      value={custom[id] ?? UNITS[id].factor ?? ''}
                      placeholder="—"
                      onChange={(e) => onCustom({ ...custom, [id]: e.target.value === '' ? null : Number(e.target.value) })}
                      className="tabular w-full rounded-xl border border-line-strong bg-surface px-3 py-2 text-[15px] outline-none focus:border-brand"
                    />
                  </label>
                ))}
                <button type="button" onClick={() => onCustom({})} className="col-span-3 justify-self-start text-[12.5px] text-ink-3 underline underline-offset-4 hover:text-ink">
                  {t.reset}
                </button>
              </div>
            )}
          </div>
        </div>

        <a
          href={reportUrl('doro', preset === 'custom' ? 'my city' : PRESETS[preset].names.en)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-2 rounded-2xl bg-warn-soft p-3 text-[13px] text-warn hover:underline"
        >
          <Badge>{t.unverified}</Badge>
          {t.unverifiedHint} {t.report} →
        </a>
      </div>
    </dialog>
  )
}
