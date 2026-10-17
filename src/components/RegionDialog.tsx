import { useEffect, useRef } from 'react'
import { Check, Loader2, LocateFixed, MapPin, X } from 'lucide-react'
import { PRESETS, UNITS, type CustomFactors, type FrancMode, type Lang, type PresetId, type UnitId } from '../lib/conventions'
import type { Strings } from '../i18n/strings'
import { fmt, reportUrl } from '../lib/format'
import { Badge, IconButton } from './ui'

const EDITABLE: UnitId[] = ['rial', 'santim', 'doro']

export interface PlaceStatus {
  state: 'idle' | 'locating' | 'done' | 'error'
  message?: string
}

interface Props {
  place: PlaceStatus
  onDetect: () => void
  open: boolean
  onClose: () => void
  preset: PresetId
  onPreset: (p: PresetId) => void
  custom: CustomFactors
  onCustom: (c: CustomFactors) => void
  franc: FrancMode
  onFranc: (f: FrancMode) => void
  lang: Lang
  t: Strings
}

export function RegionDialog({ place, onDetect, open, onClose, preset, onPreset, custom, onCustom, franc, onFranc, lang, t }: Props) {
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

        <div className="mb-4 rounded-[18px] border border-line bg-surface-2 p-3">
          <button
            type="button"
            onClick={onDetect}
            disabled={place.state === 'locating'}
            className="btn-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-[14px] font-semibold text-brand-ink hover:bg-brand-hover disabled:opacity-60"
          >
            {place.state === 'locating' ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            {place.state === 'locating' ? t.locating : t.detectPlace}
          </button>
          {place.message && (
            <p role="status" className={`enter mt-2 text-[13px] ${place.state === 'error' ? 'text-warn' : 'text-ink'}`}>
              {place.message}
            </p>
          )}
          <p className="mt-1.5 text-[11.5px] text-ink-3">{t.placePrivacy}</p>
        </div>

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
                  {o.overrides.mya?.factor ? (
                    <span className="block">
                      {UNITS.mya.names.ar}: <span dir="ltr" className="tabular inline-block font-semibold">{fmt(o.overrides.mya.factor, lang)} DH</span>
                    </span>
                  ) : null}
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

        <section aria-labelledby="franc-title" className="mt-4 rounded-[18px] border border-line p-3.5">
          <h3 id="franc-title" className="text-[14.5px] font-semibold">{t.francTitle}</h3>
          <p className="mt-1 text-[12.5px] text-ink-3">{t.francHint}</p>
          <div role="radiogroup" aria-labelledby="franc-title" className="mt-3 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface-2 p-1">
            {(['santim', 'dirham'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={franc === mode}
                onClick={() => onFranc(mode)}
                className={`btn-press min-h-10 rounded-xl px-3 text-[13px] font-semibold ${franc === mode ? 'bg-brand text-brand-ink shadow-card' : 'text-ink-2 hover:text-ink'}`}
              >
                {mode === 'santim' ? t.francSantim : t.francDirham}
                <span dir="ltr" className="tabular ms-1.5 font-normal opacity-80">{mode === 'santim' ? '0.01 DH' : '1 DH'}</span>
              </button>
            ))}
          </div>
          {franc === 'dirham' && <p className="enter mt-2 text-[12px] text-warn">{t.francReported}</p>}
        </section>

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
