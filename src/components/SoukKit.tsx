import { useMemo, useState } from 'react'
import { Check, GraduationCap, HandCoins, Shuffle, Store, Volume2, Wallet, X } from 'lucide-react'
import type { Lang } from '../lib/conventions'
import type { Strings } from '../i18n/strings'
import { breakdown, cheatSheet, offers, quizQuestion, SOUK_PHRASES, type Piece } from '../lib/souk'
import { fmt, fmtDirham } from '../lib/format'
import { canSpeak, speak, useStored } from '../hooks'
import { Card, CardTitle, CopyButton, IconButton } from './ui'

type Tab = 'haggle' | 'cash' | 'learn'

function Speak({ text, t }: { text: string; t: Strings }) {
  if (!canSpeak) return null
  return (
    <IconButton label={t.speak} onClick={() => speak(text, 'ar-MA')}>
      <Volume2 size={17} />
    </IconButton>
  )
}

/* ---------- haggle ---------- */

function Haggle({ dirham, lang, t }: { dirham: number | null; lang: Lang; t: Strings }) {
  const list = dirham ? offers(dirham) : []
  return (
    <div className="space-y-4">
      {list.length > 0 && (
        <div>
          <p className="mb-2 text-[12.5px] text-ink-3">{t.haggleIntro}</p>
          <ul className="space-y-2">
            {list.map((o) => (
              <li key={o.pct} className="flex items-center gap-3 rounded-[18px] border border-line bg-surface-2 p-3 ps-4">
                <span className="tabular grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">−{Math.round((1 - o.pct) * 100)}%</span>
                <div className="min-w-0 flex-1">
                  <p dir="rtl" lang="ar" className="text-[16.5px] font-semibold leading-snug ltr:text-left">
                    {o.ar}
                  </p>
                  <p dir="ltr" className="text-[12.5px] italic text-ink-2 rtl:text-right">
                    {o.latin} · <span className="tabular not-italic">{fmtDirham(o.dirham, lang)} DH</span>
                  </p>
                </div>
                <Speak text={o.ar} t={t} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="mb-2 text-[12.5px] text-ink-3">{t.usefulPhrases}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SOUK_PHRASES.map((p) => (
            <li key={p.ar} className="flex items-center gap-2 rounded-2xl border border-line p-2.5 ps-3.5">
              <div className="min-w-0 flex-1">
                <p dir="rtl" lang="ar" className="truncate text-[15px] font-semibold ltr:text-left">
                  {p.ar}
                </p>
                <p className="truncate text-[12px] text-ink-3">
                  <span dir="ltr" className="italic">
                    {p.latin}
                  </span>
                  {lang !== 'ar' && ` — ${lang === 'fr' ? p.fr : p.en}`}
                </p>
              </div>
              <Speak text={p.ar} t={t} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- cash ---------- */

const NOTE_COLOR: Record<number, string> = { 200: '#2d7f9a', 100: '#a8633a', 50: '#3f8a4f', 20: '#7d5aa6' }

function PieceChip({ p, lang, t }: { p: Piece; lang: Lang; t: Strings }) {
  const label = p.value >= 1 ? `${p.value}` : `${Math.round(p.value * 100)}`
  const unit = p.value >= 1 ? 'DH' : 'c'
  return (
    <li className="flex items-center gap-2.5" title={`${p.count} × ${fmt(p.value, lang)} DH (${p.kind === 'note' ? t.note : t.coin})`}>
      {p.kind === 'note' ? (
        <span
          className="relative grid h-11 w-[74px] place-items-center overflow-hidden rounded-lg text-[15px] font-bold text-white shadow-card"
          style={{ background: `linear-gradient(135deg, ${NOTE_COLOR[p.value]}, color-mix(in srgb, ${NOTE_COLOR[p.value]} 60%, #000))` }}
        >
          <span className="absolute inset-1 rounded-md border border-white/25" />
          <span className="absolute -end-3 -top-3 size-10 rounded-full bg-white/15" />
          <span className="tabular relative">
            {label} <span className="text-[10px] font-semibold opacity-80">{unit}</span>
          </span>
        </span>
      ) : (
        <span
          className="tabular grid size-11 place-items-center rounded-full text-[12.5px] font-bold shadow-card"
          style={{
            background:
              p.value >= 5
                ? 'radial-gradient(circle at 35% 30%, #fff 0%, #dfe3e8 30%, #9aa3ad 62%, #c9ced4 64%, #f1cf62 66%, #c9952a 84%, #8d6111 100%)'
                : p.value >= 1
                  ? 'radial-gradient(circle at 35% 30%, #fff 0%, #e6e9ed 35%, #a9b1ba 75%, #7c858f 100%)'
                  : 'radial-gradient(circle at 35% 30%, #fff2b8 0%, #f1cf62 35%, #c9952a 75%, #8d6111 100%)',
            color: '#3b2a08',
          }}
        >
          {label}
        </span>
      )}
      <span className="tabular text-[14px] font-semibold text-ink">× {p.count}</span>
    </li>
  )
}

function Cash({ dirham, lang, t }: { dirham: number | null; lang: Lang; t: Strings }) {
  const pieces = dirham ? breakdown(dirham) : []
  if (!pieces.length) return <p className="text-[13px] text-ink-3">{t.tagline}</p>
  return (
    <div>
      <p className="mb-3 text-[12.5px] text-ink-3">
        {t.cashIntro} <span className="tabular font-semibold text-ink">{fmtDirham(Math.round(dirham! * 20) / 20, lang)} DH</span>
      </p>
      <ul className="flex flex-wrap gap-x-5 gap-y-3">
        {pieces.map((p) => (
          <PieceChip key={p.value} p={p} lang={lang} t={t} />
        ))}
      </ul>
    </div>
  )
}

/* ---------- learn ---------- */

function Learn({ lang, t }: { lang: Lang; t: Strings }) {
  const rows = useMemo(() => cheatSheet(), [])
  const [q, setQ] = useState(() => quizQuestion())
  const [picked, setPicked] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useStored('dmc:quiz-best', 0)

  const pick = (c: number) => {
    if (picked !== null) return
    setPicked(c)
    if (c === q.answer) {
      const s = streak + 1
      setStreak(s)
      if (s > best) setBest(s)
      navigator.vibrate?.(12)
    } else setStreak(0)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[20px] border border-line bg-surface-2 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[12.5px] font-medium text-ink-3">{t.quiz}</p>
          <p className="tabular text-[12px] text-ink-3">{t.streak(streak, best)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p dir="rtl" lang="ar" className="text-[20px] font-bold leading-snug ltr:text-left">
              {q.ar}
            </p>
            <p dir="ltr" className="text-[12.5px] italic text-ink-2 rtl:text-right">
              {q.latin}
            </p>
          </div>
          <Speak text={q.ar} t={t} />
        </div>
        <p className="mt-3 mb-2 text-[13px] text-ink-2">{t.quizPrompt}</p>
        <div className="grid grid-cols-2 gap-2">
          {q.choices.map((c) => {
            const state = picked === null ? 'idle' : c === q.answer ? 'right' : c === picked ? 'wrong' : 'dim'
            return (
              <button
                key={c}
                type="button"
                onClick={() => pick(c)}
                disabled={picked !== null}
                className={`btn-press tabular flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border text-[15px] font-semibold ${
                  state === 'right'
                    ? 'border-brand bg-brand text-brand-ink'
                    : state === 'wrong'
                      ? 'border-warn bg-warn-soft text-warn'
                      : state === 'dim'
                        ? 'border-line text-ink-3'
                        : 'border-line-strong bg-surface hover:border-brand hover:text-brand'
                }`}
              >
                {state === 'right' && <Check size={16} />}
                {state === 'wrong' && <X size={16} />}
                {fmtDirham(c, lang)} DH
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <div className="enter mt-3 flex items-center justify-between gap-2">
            <p className={`text-[13.5px] font-medium ${picked === q.answer ? 'text-brand' : 'text-warn'}`} aria-live="polite">
              {picked === q.answer ? t.quizCorrect : t.quizWrong(`${fmtDirham(q.answer, lang)} DH`)}
            </p>
            <button
              type="button"
              onClick={() => {
                setQ(quizQuestion())
                setPicked(null)
              }}
              className="btn-press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-brand-ink hover:bg-brand-hover"
            >
              <Shuffle size={14} /> {t.quizNext}
            </button>
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-[12.5px] font-medium text-ink-3">{t.cheatSheet}</p>
        <ul className="divide-y divide-line rounded-[18px] border border-line">
          {rows.map((r) => (
            <li key={r.dirham} className="flex items-center gap-3 px-3.5 py-2">
              <span className="tabular w-20 shrink-0 text-[14px] font-semibold text-brand">{fmtDirham(r.dirham, lang)} DH</span>
              <span className="min-w-0 flex-1">
                <span dir="rtl" lang="ar" className="block truncate text-[14.5px] font-medium ltr:text-left">
                  {r.ar}
                </span>
                <span dir="ltr" className="block truncate text-[11.5px] italic text-ink-3 rtl:text-right">
                  {r.latin}
                </span>
              </span>
              <CopyButton text={r.ar} label={t.copy} copiedLabel={t.copied} className="!size-9" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function SoukKit({ dirham, lang, t }: { dirham: number | null; lang: Lang; t: Strings }) {
  const [tab, setTab] = useStored<Tab>('dmc:souk-tab', 'haggle')
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'haggle', label: t.tabHaggle, icon: <HandCoins size={15} /> },
    { id: 'cash', label: t.tabCash, icon: <Wallet size={15} /> },
    { id: 'learn', label: t.tabLearn, icon: <GraduationCap size={15} /> },
  ]
  return (
    <Card>
      <CardTitle icon={<Store size={18} />} title={t.soukKit} hint={t.soukHint} />
      <div role="tablist" aria-label={t.soukKit} className="mb-4 flex rounded-2xl bg-surface-2 p-1">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`btn-press inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold ${tab === x.id ? 'bg-surface text-ink shadow-card' : 'text-ink-2 hover:text-ink'}`}
          >
            {x.icon}
            {x.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" key={tab} className="enter">
        {tab === 'haggle' && <Haggle dirham={dirham} lang={lang} t={t} />}
        {tab === 'cash' && <Cash dirham={dirham} lang={lang} t={t} />}
        {tab === 'learn' && <Learn lang={lang} t={t} />}
      </div>
    </Card>
  )
}
