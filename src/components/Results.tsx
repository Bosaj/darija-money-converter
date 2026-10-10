import { useState } from 'react'
import { AlertTriangle, ArrowLeftRight, Coins, Globe2, Loader2, MapPin, Share2, Volume2, MessageCircle } from 'lucide-react'
import type { Lang, PresetId, ResolvedUnits, UnitId } from '../lib/conventions'
import { FOREIGN_IDS, LOCAL_IDS, type ForeignId } from '../lib/conventions'
import type { RateState } from '../lib/rates'
import type { Segment } from '../lib/parse'
import type { Phrase } from '../lib/convert'
import type { Strings } from '../i18n/strings'
import { fmt, fmtDirham, reportUrl, unitAltName, unitName } from '../lib/format'
import { Badge, Card, CardTitle, CopyButton, IconButton } from './ui'
import { canSpeak, speak } from '../hooks'

/* ---------- What the parser understood ---------- */

export function Interpretation({ segments, multiplier = 1, units, lang, t }: { segments: Segment[]; multiplier?: number; units: ResolvedUnits; lang: Lang; t: Strings }) {
  return (
    <div className="enter flex flex-wrap items-center gap-1.5 text-[13px]" aria-live="polite">
      <span className="text-ink-3">{t.understood}</span>
      {multiplier !== 1 && (
        <span className="tabular rounded-lg bg-accent-soft px-2 py-1 font-semibold text-accent">
          {fmt(multiplier, lang)} ×
        </span>
      )}
      {segments.map((s, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="text-ink-3">+</span>}
          <span className="tabular rounded-lg bg-surface-2 px-2 py-1 font-medium text-ink">
            {fmt(s.amount / multiplier, lang)} {unitName(units[s.unit], lang)}
          </span>
          {s.implied && <Badge tone="muted">{t.implied}</Badge>}
        </span>
      ))}
    </div>
  )
}

export function Problem({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="enter flex items-start gap-3 rounded-2xl bg-warn-soft p-3.5 text-[13.5px] text-warn" role="status">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p>{children}</p>
        {action}
      </div>
    </div>
  )
}

/* ---------- Big Dirham result ---------- */

interface HeroProps {
  dirham: number | null
  lang: Lang
  t: Strings
  onShare: () => Promise<void>
  foreignNote?: boolean
}

export function ResultHero({ dirham, lang, t, onShare, foreignNote }: HeroProps) {
  const [sharing, setSharing] = useState(false)
  const text = dirham === null ? '—' : fmtDirham(dirham, lang)
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-brand p-5 text-brand-ink sm:p-6">
      <div className="zellige !opacity-[0.12]" style={{ color: 'var(--brand-ink)' }} aria-hidden />
      <div className="relative flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium opacity-80">{t.inDirham}</p>
          <p key={text} className={`pop tabular mt-1 whitespace-nowrap font-semibold leading-[1.05] tracking-tight ${text.length > 10 ? 'text-[28px] sm:text-[44px]' : text.length > 7 ? 'text-[34px] sm:text-[50px]' : 'text-[40px] sm:text-[56px]'}`} aria-live="polite">
            {text}
            <span className="ms-2 text-[18px] font-medium opacity-80 sm:text-[24px]">{lang === 'ar' ? 'درهم' : 'DH'}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <CopyButton text={dirham === null ? '' : `${text} DH`} label={t.copy} copiedLabel={t.copied} className="!bg-white/15 !text-brand-ink hover:!bg-white/25" />
          <IconButton
            label={sharing ? t.sharing : t.share}
            disabled={dirham === null || sharing}
            onClick={async () => {
              setSharing(true)
              try {
                await onShare()
              } finally {
                setSharing(false)
              }
            }}
            className="!bg-white/15 !text-brand-ink hover:!bg-white/25 disabled:opacity-50"
          >
            {sharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
          </IconButton>
        </div>
      </div>
      {foreignNote && <p className="relative mt-2 text-[12px] opacity-80">≈ {t.rateNote}</p>}
    </div>
  )
}

/* ---------- Say it like a local ---------- */

export function SayIt({ phrases, units, lang, t }: { phrases: Phrase[]; units: ResolvedUnits; lang: Lang; t: Strings }) {
  if (!phrases.length) return null
  return (
    <Card className="enter">
      <CardTitle icon={<MessageCircle size={18} />} title={t.sayIt} hint={t.sayItHint} />
      <ul className="space-y-2.5">
        {phrases.map((p) => (
          <li key={p.unit} className="group flex items-center gap-3 rounded-[18px] border border-line bg-surface-2 p-3 ps-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11.5px] font-medium uppercase tracking-wide text-ink-3">{unitName(units[p.unit], lang)}</span>
                {!units[p.unit].verified && <Badge>{t.unverified}</Badge>}
              </div>
              <p dir="rtl" lang="ar" className="text-[17px] font-semibold leading-snug text-ink ltr:text-left sm:text-[19px]">{p.ar}</p>
              <p dir="ltr" lang="ar-Latn" className="mt-0.5 text-[13.5px] italic text-ink-2 rtl:text-right">{p.latin}</p>
            </div>
            <div className="flex shrink-0 gap-0.5">
              {canSpeak && (
                <IconButton label={t.speak} onClick={() => speak(p.ar, 'ar-MA')}>
                  <Volume2 size={18} />
                </IconButton>
              )}
              <CopyButton text={p.ar} label={t.copy} copiedLabel={t.copied} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ---------- Every unit ---------- */

interface EquivalentsProps {
  values: Record<UnitId, number | null> | null
  units: ResolvedUnits
  lang: Lang
  t: Strings
  preset: PresetId
  presetLabel: string
  onOpenRegion: () => void
}

export function Equivalents({ values, units, lang, t, presetLabel, onOpenRegion }: EquivalentsProps) {
  return (
    <Card>
      <CardTitle
        icon={<ArrowLeftRight size={18} />}
        title={t.equivalents}
        action={
          <button type="button" onClick={onOpenRegion} className="btn-press inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 text-[12.5px] font-medium text-ink-2 hover:border-line-strong hover:text-ink">
            <MapPin size={14} />
            {presetLabel}
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-2.5">
        {LOCAL_IDS.map((id) => {
          const u = units[id]
          const v = values?.[id] ?? null
          const unavailable = u.factor === null
          return (
            <div key={id} className={`relative flex min-h-[92px] flex-col justify-between rounded-[18px] border border-line p-3.5 ${unavailable ? 'bg-transparent' : 'bg-surface-2'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{unitName(u, lang)}</p>
                  <p className="truncate text-[11.5px] text-ink-3">{unitAltName(u, lang)}</p>
                </div>
                {!unavailable && !u.verified && (
                  <a href={reportUrl(u.def.names.en, presetLabel)} target="_blank" rel="noreferrer" title={t.unverifiedHint} className="shrink-0">
                    <Badge>{u.note === 'custom' ? t.custom : t.unverified}</Badge>
                  </a>
                )}
              </div>
              {unavailable ? (
                <button type="button" onClick={onOpenRegion} className="mt-2 self-start text-[12.5px] text-ink-3 underline decoration-dotted underline-offset-4 hover:text-brand">
                  {t.notInRegion}
                </button>
              ) : (
                <p className="tabular mt-2 truncate text-[20px] font-semibold text-ink" title={v === null ? '' : String(v)}>
                  {v === null ? '—' : fmt(v, lang)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function EmptyHint({ t }: { t: Strings }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-4 text-[13.5px] text-ink-3">
      <Coins size={20} className="shrink-0 text-accent" />
      <p>{t.tagline}</p>
    </div>
  )
}

/* ---------- Foreign currencies ---------- */

function ago(ms: number, lang: Lang): string {
  const rtf = new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar' : lang, { numeric: 'auto' })
  const mins = Math.round((ms - Date.now()) / 60_000)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 48) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(hours / 24), 'day')
}

interface ForeignProps {
  values: Record<UnitId, number | null> | null
  units: ResolvedUnits
  rates: RateState
  shown: ForeignId[]
  onToggle: (id: ForeignId) => void
  lang: Lang
  t: Strings
}

export function ForeignCurrencies({ values, units, rates, shown, onToggle, lang, t }: ForeignProps) {
  const status =
    rates.source === 'live'
      ? t.rateLive(ago(rates.updated, lang))
      : rates.source === 'cache'
        ? t.rateCache(ago(rates.updated, lang))
        : t.rateSnapshot(new Date(rates.updated).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang, { day: 'numeric', month: 'short', year: 'numeric' }))
  return (
    <Card>
      <CardTitle icon={<Globe2 size={18} />} title={t.foreign} hint={status} />
      <div className="grid grid-cols-2 gap-2.5">
        {shown.map((id) => {
          const u = units[id]
          const v = values?.[id] ?? null
          return (
            <div key={id} className="flex min-h-[92px] flex-col justify-between rounded-[18px] border border-line bg-surface-2 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{unitName(u, lang)}</p>
                  <p dir="ltr" className="tabular truncate text-[11.5px] text-ink-3 rtl:text-right">
                    1 {u.def.symbol} = {u.factor ? fmt(u.factor, lang) : '—'} DH
                  </p>
                </div>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">{u.def.symbol.length <= 2 ? u.def.symbol : u.def.code?.slice(0, 1)}</span>
              </div>
              <p className="tabular mt-2 truncate text-[20px] font-semibold text-ink">{v === null ? '—' : fmt(v, lang)}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-4">
        <p className="mb-2 text-[12px] text-ink-3">{t.moreCurrencies}</p>
        <div className="flex flex-wrap gap-1.5">
          {FOREIGN_IDS.map((id) => {
            const on = shown.includes(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(id)}
                className={`btn-press min-h-9 rounded-full border px-3 text-[12.5px] font-semibold ${on ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-2 hover:border-line-strong'}`}
              >
                {units[id].def.code}
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-3 text-[11.5px] text-ink-3">
        {t.rateNote}{' '}
        <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
          {t.ratesBy}
        </a>
      </p>
    </Card>
  )
}
