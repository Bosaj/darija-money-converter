import { useRef } from 'react'
import { Mic, MicOff, X } from 'lucide-react'
import type { Lang, ResolvedUnits, UnitId } from '../lib/conventions'
import type { Strings } from '../i18n/strings'
import { EXAMPLES } from '../i18n/strings'
import { unitName } from '../lib/format'
import { useDictation } from '../hooks'

const CHIP_UNITS: UnitId[] = ['rial', 'dirham', 'santim', 'doro']
const SPEECH_LANG: Record<Lang, string> = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-US' }

interface Props {
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  defaultUnit: UnitId
  onDefaultUnit: (u: UnitId) => void
  units: ResolvedUnits
  lang: Lang
  t: Strings
}

export function AmountInput({ value, onChange, onCommit, defaultUnit, onDefaultUnit, units, lang, t }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const dictation = useDictation(onChange)

  return (
    <div>
      <label htmlFor="amount" className="mb-2 block text-[13px] font-medium text-ink-2">
        {t.inputLabel}
      </label>
      <div
        className={`flex items-center gap-1.5 rounded-[22px] border bg-surface-2 p-1.5 ps-4 transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:shadow-[0_0_0_4px_var(--brand-soft)] ${
          dictation.listening ? 'border-warn' : 'border-line-strong'
        }`}
      >
        <input
          ref={input}
          id="amount"
          dir="auto"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          value={value}
          placeholder={t.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (onCommit(), input.current?.blur())}
          onBlur={onCommit}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[20px] font-medium text-ink outline-none placeholder:text-ink-3 placeholder:font-normal sm:text-[22px]"
        />
        {value && (
          <button
            type="button"
            aria-label={t.clear}
            title={t.clear}
            onClick={() => {
              onChange('')
              input.current?.focus()
            }}
            className="btn-press grid size-10 place-items-center rounded-full text-ink-3 hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
        {dictation.supported && (
          <button
            type="button"
            aria-label={dictation.listening ? t.listening : t.listen}
            title={dictation.listening ? t.listening : t.listen}
            aria-pressed={dictation.listening}
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start(SPEECH_LANG[lang]))}
            className={`btn-press grid size-12 place-items-center rounded-[16px] ${
              dictation.listening ? 'pulse-ring bg-warn text-white' : 'bg-brand text-brand-ink hover:bg-brand-hover'
            }`}
          >
            {dictation.listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] text-ink-3">{t.defaultUnit}</span>
        <div role="radiogroup" aria-label={t.defaultUnit} className="flex flex-wrap gap-1.5">
          {CHIP_UNITS.filter((u) => units[u].factor !== null).map((u) => {
            const active = u === defaultUnit
            return (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onDefaultUnit(u)}
                className={`btn-press min-h-9 rounded-full border px-3.5 text-[13px] font-medium ${
                  active ? 'border-brand bg-brand text-brand-ink' : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink'
                }`}
              >
                {unitName(units[u], lang)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 -mx-5 sm:-mx-6">
        <div className="flex items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:px-6">
          <span className="shrink-0 text-[12.5px] text-ink-3">{t.examples}</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              dir="auto"
              onClick={() => {
                onChange(ex)
                setTimeout(onCommit, 0)
              }}
              className="btn-press shrink-0 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-2 hover:border-brand hover:text-brand"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
