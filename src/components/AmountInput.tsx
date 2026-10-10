import { useRef, useState } from 'react'
import { AlertCircle, Mic, MicOff, Settings2, Volume2, X } from 'lucide-react'
import type { Lang, ResolvedUnits, UnitId } from '../lib/conventions'
import type { Strings } from '../i18n/strings'
import { EXAMPLES } from '../i18n/strings'
import { unitName } from '../lib/format'
import { canSpeak, rankVoices, speak, STT_LANGS, useDictation, useVoices, type SttLang, type VoicePrefs } from '../hooks'

const CHIP_UNITS: UnitId[] = ['rial', 'dirham', 'santim', 'doro', 'eur', 'usd']
const DEFAULT_STT: Record<Lang, SttLang> = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-US' }

interface Props {
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  defaultUnit: UnitId
  onDefaultUnit: (u: UnitId) => void
  units: ResolvedUnits
  lang: Lang
  t: Strings
  voice: VoicePrefs
  onVoice: (v: VoicePrefs) => void
}

function VoiceSettings({ voice, onVoice, lang, t, onClose }: { voice: VoicePrefs; onVoice: (v: VoicePrefs) => void; lang: Lang; t: Strings; onClose: () => void }) {
  const voices = rankVoices(useVoices())
  const stt = voice.stt ?? DEFAULT_STT[lang]
  return (
    <div role="dialog" aria-label={t.voiceSettings} className="enter absolute end-0 top-[calc(100%+8px)] z-30 w-[min(340px,calc(100vw-40px))] rounded-[22px] border border-line bg-surface p-4 shadow-pop">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-semibold">{t.voiceSettings}</p>
        <button type="button" aria-label={t.done} onClick={onClose} className="btn-press grid size-9 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <p className="mb-1.5 text-[12px] font-medium text-ink-3">{t.micLang}</p>
      <div role="radiogroup" aria-label={t.micLang} className="mb-4 grid grid-cols-2 gap-1.5">
        {STT_LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={stt === l.id}
            onClick={() => onVoice({ ...voice, stt: l.id })}
            className={`btn-press rounded-xl border px-3 py-2 text-start ${stt === l.id ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong'}`}
          >
            <span className="block text-[13.5px] font-semibold">{l.label}</span>
            <span className="block text-[11px] text-ink-3">{l.hint}</span>
          </button>
        ))}
      </div>
      {canSpeak && (
        <>
          <label className="mb-1.5 block text-[12px] font-medium text-ink-3" htmlFor="tts-voice">
            {t.ttsVoice}
          </label>
          <select
            id="tts-voice"
            value={voice.voiceURI ?? ''}
            onChange={(e) => onVoice({ ...voice, voiceURI: e.target.value || null })}
            className="mb-3 min-h-10 w-full rounded-xl border border-line-strong bg-surface-2 px-2 text-[13px]"
          >
            <option value="">{t.autoVoice}</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          {voices.length === 0 && <p className="mb-3 rounded-xl bg-warn-soft p-2.5 text-[12px] text-warn">{t.noArabicVoice}</p>}
          <label className="mb-3 flex items-center gap-3 text-[12px] font-medium text-ink-3">
            {t.speed}
            <input type="range" min={0.6} max={1.3} step={0.05} value={voice.rate} onChange={(e) => onVoice({ ...voice, rate: Number(e.target.value) })} className="flex-1 accent-[var(--brand)]" />
            <span className="tabular w-9 text-end text-ink">{voice.rate.toFixed(2)}×</span>
          </label>
          <button
            type="button"
            onClick={() => speak('عشرين ألف ريال، يعني ألف درهم', { voiceURI: voice.voiceURI, rate: voice.rate })}
            className="btn-press inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-[13px] font-semibold hover:border-brand hover:text-brand"
          >
            <Volume2 size={15} /> {t.testVoice}
          </button>
        </>
      )}
    </div>
  )
}

export function AmountInput({ value, onChange, onCommit, defaultUnit, onDefaultUnit, units, lang, t, voice, onVoice }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState(false)
  const [askedUnsupported, setAskedUnsupported] = useState(false)
  const dictation = useDictation((text, final) => {
    onChange(text)
    if (final) setTimeout(onCommit, 0)
  })
  const stt = voice.stt ?? DEFAULT_STT[lang]
  const sttLabel = STT_LANGS.find((l) => l.id === stt)?.label

  return (
    <div>
      <label htmlFor="amount" className="mb-2 block text-[13px] font-medium text-ink-2">
        {t.inputLabel}
      </label>
      <div className="relative">
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
            placeholder={dictation.listening ? t.listening : t.placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (onCommit(), input.current?.blur())}
            onBlur={onCommit}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[20px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3 sm:text-[22px]"
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
          <button
            type="button"
            aria-label={t.voiceSettings}
            title={t.voiceSettings}
            aria-expanded={settings}
            onClick={() => setSettings((v) => !v)}
            className="btn-press grid size-10 place-items-center rounded-full text-ink-3 hover:bg-surface hover:text-ink"
          >
            <Settings2 size={17} />
          </button>
          <button
            type="button"
            aria-label={dictation.listening ? t.listening : `${t.listen} (${sttLabel})`}
            title={dictation.supported ? `${t.listen} · ${sttLabel}` : t.sttUnsupported}
            aria-pressed={dictation.listening}
            onClick={() => (!dictation.supported ? setAskedUnsupported(true) : dictation.listening ? dictation.stop() : dictation.start(stt))}
            className={`btn-press relative grid size-12 place-items-center rounded-[16px] disabled:opacity-40 ${dictation.listening ? 'bg-warn text-white' : 'bg-brand text-brand-ink hover:bg-brand-hover'}`}
          >
            {dictation.listening && (
              <span aria-hidden className="absolute inset-0 rounded-[16px] border-2 border-warn transition-transform duration-75" style={{ transform: `scale(${1 + dictation.level * 0.45})`, opacity: 0.6 }} />
            )}
            {dictation.listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
        {settings && <VoiceSettings voice={voice} onVoice={onVoice} lang={lang} t={t} onClose={() => setSettings(false)} />}
      </div>

      {(dictation.error || (askedUnsupported && !dictation.supported)) && (
        <p role="status" className="enter mt-2 flex items-center gap-2 text-[12.5px] text-warn">
          <AlertCircle size={14} className="shrink-0" />
          {dictation.supported ? t.sttError[dictation.error!] : t.sttUnsupported}
        </p>
      )}

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

      <div className="-mx-5 mt-4 sm:-mx-6">
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
