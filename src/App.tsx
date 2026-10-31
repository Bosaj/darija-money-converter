import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, MapPin, Moon, Sun, SunMoon, WifiOff } from 'lucide-react'
import { DEFAULT_PRESET, isForeign, PRESETS, resolveUnits, type CustomFactors, type ForeignId, type FrancMode, type Lang, type PresetId, type UnitId } from './lib/conventions'
import { fetchRates, initialRates, REFRESH_MS, STALE_MS, type RateState } from './lib/rates'
import { locate, placeFor, timezoneCurrency } from './lib/place'
import { parseAmount } from './lib/parse'
import { fromDirham, sayIt, toDirham } from './lib/convert'
import { fmt, fmtDirham, REPO_URL, unitName } from './lib/format'
import { shareCard } from './lib/shareCard'
import { STRINGS } from './i18n/strings'
import { DEFAULT_VOICE, speak, useInstallPrompt, useOnline, useStored, VOICE_KEY, type VoicePrefs } from './hooks'
import { AmountInput } from './components/AmountInput'
import { EmptyHint, Equivalents, ForeignCurrencies, Interpretation, Problem, ResultHero, SayIt } from './components/Results'
import { SoukKit } from './components/SoukKit'
import { Backdrop } from './components/Backdrop'
import { CoinLogo } from './components/CoinLogo'
import { RegionDialog, type PlaceStatus } from './components/RegionDialog'
import { History, type HistoryEntry } from './components/History'
import { Card, GithubMark, IconButton } from './components/ui'

type Theme = 'system' | 'light' | 'dark'
const THEME_NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
const LANGS: { id: Lang; label: string }[] = [
  { id: 'ar', label: 'ع' },
  { id: 'fr', label: 'FR' },
  { id: 'en', label: 'EN' },
]

function initialLang(): Lang {
  const n = typeof navigator === 'undefined' ? 'ar' : navigator.language.toLowerCase()
  if (n.startsWith('fr')) return 'fr'
  if (n.startsWith('en')) return 'en'
  return 'ar'
}

function initialText(): string {
  try {
    return new URLSearchParams(location.search).get('q') ?? 'عشرين ألف ريال'
  } catch {
    return 'عشرين ألف ريال'
  }
}

export default function App() {
  const [lang, setLang] = useStored<Lang>('dmc:lang', initialLang())
  const [theme, setTheme] = useStored<Theme>('dmc:theme', 'system')
  const [preset, setPreset] = useStored<PresetId>('dmc:preset', DEFAULT_PRESET)
  const [custom, setCustom] = useStored<CustomFactors>('dmc:custom', {})
  const [franc, setFranc] = useStored<FrancMode>('dmc:franc', 'santim')
  const [defaultUnit, setDefaultUnit] = useStored<UnitId>('dmc:unit', 'rial')
  const [history, setHistory] = useStored<HistoryEntry[]>('dmc:history', [])
  const [text, setText] = useState(initialText)
  const [regionOpen, setRegionOpen] = useState(false)
  const [rates, setRates] = useState<RateState>(initialRates)
  const [shownForeign, setShownForeign] = useStored<ForeignId[]>('dmc:foreign', (() => {
    // no-permission hint: put the time zone's currency first (Europe/Paris → EUR, America/Toronto → CAD …)
    const tz = timezoneCurrency()
    return tz && !['eur', 'usd'].includes(tz) ? [tz, 'eur', 'usd'] : ['eur', 'usd']
  })())
  const [voice, setVoice] = useStored<VoicePrefs>(VOICE_KEY, DEFAULT_VOICE)
  const [place, setPlace] = useState<PlaceStatus>({ state: 'idle' })
  const [city, setCity] = useStored<string | null>('dmc:city', null)
  const online = useOnline()
  const install = useInstallPrompt()
  const t = STRINGS[lang]

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = lang === 'ar' ? 'حسبلي · محول الفلوس بالدارجة' : `${t.appName} · Darija Money Converter`
  }, [lang, t.appName])

  useEffect(() => {
    if (theme === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme
  }, [theme])

  // Live exchange rates: refresh when stale and online; keep the cached/snapshot value otherwise
  useEffect(() => {
    if (!online || (rates.source === 'live' && Date.now() - rates.updated < STALE_MS)) return
    let cancelled = false
    fetchRates().then((r) => !cancelled && r && setRates(r))
    return () => {
      cancelled = true
    }
  }, [online]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep rates live: refresh every 15 min while the tab is visible and online
  useEffect(() => {
    if (!online) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') fetchRates().then((r) => r && setRates(r))
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [online])

  const detectPlace = useCallback(async () => {
    setPlace({ state: 'locating' })
    try {
      const pos = await locate()
      const found = placeFor(pos.coords.latitude, pos.coords.longitude)
      if (found.kind === 'morocco') {
        setPreset(found.city.preset)
        const name = lang === 'ar' ? found.city.ar : found.city.name
        setCity(name)
        setPlace({ state: 'done', message: `${t.placeIn(name)} · ${PRESETS[found.city.preset].names[lang]}` })
      } else if (found.currency) {
        const cur = found.currency
        setShownForeign((list) => [cur, ...list.filter((x) => x !== cur)])
        setDefaultUnit(cur)
        setCity(null)
        setPlace({ state: 'done', message: t.placeAbroad(units[cur].def.names[lang]) })
      } else {
        setCity(null)
        setPlace({ state: 'done', message: t.placeAbroadUnknown })
      }
    } catch (err) {
      const denied = (err as GeolocationPositionError)?.code === 1
      setPlace({ state: 'error', message: denied ? t.placeDenied : t.placeError })
    }
  }, [lang, t, setPreset, setCity, setShownForeign, setDefaultUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  const units = useMemo(() => resolveUnits(preset, custom, rates.rates, franc), [preset, custom, rates, franc])
  const effectiveUnit: UnitId = units[defaultUnit].factor === null ? 'rial' : defaultUnit
  const parsed = useMemo(() => (text.trim() ? parseAmount(text, effectiveUnit) : null), [text, effectiveUnit])
  const conversion = useMemo(() => (parsed ? toDirham(parsed.segments, units) : null), [parsed, units])
  const dirham = conversion?.dirham ?? null
  const values = useMemo(() => (dirham === null ? null : fromDirham(dirham, units)), [dirham, units])
  const phrases = useMemo(() => (dirham === null ? [] : sayIt(dirham, units)), [dirham, units])
  const presetLabel = preset === 'custom' ? t.custom : PRESETS[preset].names[lang]

  // Shareable URL: ?q=<phrase>
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(location.href)
      if (text.trim()) url.searchParams.set('q', text.trim())
      else url.searchParams.delete('q')
      window.history.replaceState(null, "", url)
    }, 400)
    return () => clearTimeout(id)
  }, [text])

  const latest = useRef({ text, dirham })
  latest.current = { text, dirham }
  const commit = useCallback(() => {
    const { text: q, dirham: d } = latest.current
    if (!q.trim() || d === null) return
    setHistory((h) => [{ text: q.trim(), dirham: d, at: Date.now() }, ...h.filter((x) => x.text !== q.trim())].slice(0, 8))
  }, [setHistory])

  // Also save after a pause in typing
  useEffect(() => {
    if (dirham === null) return
    const id = setTimeout(commit, 1800)
    return () => clearTimeout(id)
  }, [text, dirham, commit])

  const onShare = useCallback(async () => {
    if (dirham === null || !values) return
    const lines = (['rial', 'eur', 'usd'] as const)
      .filter((u) => values[u] !== null)
      .map((u) => ({ label: `${unitName(units[u], 'ar')}${isForeign(u) ? ` ${units[u].def.symbol}` : ''}`, value: fmt(values[u]!, 'en') }))
    await shareCard(
      { input: text.trim(), dirhamText: fmtDirham(dirham, 'en'), lines, phrase: phrases[0]?.ar, url: location.host || 'darija-money-converter' },
      t.appName,
    )
  }, [dirham, values, units, text, phrases, t.appName])

  const missing = conversion?.missing ?? []

  return (
    <div className="min-h-dvh">
      <Backdrop lang={lang} />
      <div className="relative">
        <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <CoinLogo size={48} label={lang === 'ar' ? 'حسبلي' : 'HSABLI'} />
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t.appName}</h1>
              <p className="hidden truncate text-[12.5px] text-ink-3 sm:block">{t.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRegionOpen(true)}
              className="btn-press hidden min-h-11 items-center gap-1.5 rounded-2xl border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-2 shadow-card hover:text-ink sm:inline-flex"
            >
              <MapPin size={15} className="text-brand" />
              {city ? `${city} · ${presetLabel}` : presetLabel}
            </button>
            <div role="radiogroup" aria-label={t.language} className="flex rounded-2xl border border-line bg-surface p-1 shadow-card">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={lang === l.id}
                  onClick={() => setLang(l.id)}
                  className={`btn-press min-h-9 min-w-9 rounded-xl px-2 text-[13px] font-semibold ${lang === l.id ? 'bg-brand text-brand-ink' : 'text-ink-2 hover:text-ink'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <IconButton label={t.theme} tone="soft" onClick={() => setTheme(THEME_NEXT[theme])} className="!bg-surface shadow-card">
              {theme === 'system' ? <SunMoon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </div>
        </header>
      </div>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 space-y-4 lg:col-span-7">
          <Card>
            <AmountInput
              value={text}
              onChange={setText}
              onCommit={commit}
              defaultUnit={effectiveUnit}
              onDefaultUnit={setDefaultUnit}
              units={units}
              lang={lang}
              t={t}
              voice={voice}
              onVoice={setVoice}
            />
            <div className="mt-5 space-y-3">
              {parsed && <Interpretation segments={parsed.segments} multiplier={parsed.multiplier} units={units} lang={lang} t={t} />}
              {text.trim() && !parsed && <Problem>{t.notUnderstood}</Problem>}
              {missing.length > 0 && (
                <Problem
                  action={
                    <button type="button" onClick={() => setRegionOpen(true)} className="mt-1.5 font-semibold underline underline-offset-4">
                      {t.changeRegion}
                    </button>
                  }
                >
                  {t.missingUnit(unitName(units[missing[0]!], lang))}
                </Problem>
              )}
              <ResultHero
                dirham={dirham}
                lang={lang}
                t={t}
                onShare={onShare}
                foreignNote={Boolean(parsed?.segments.some((x) => isForeign(x.unit)))}
                onRead={() => {
                  if (dirham === null) return
                  // Darija in the Arabic interface; French or English voices otherwise
                  if (lang === 'ar') {
                    const said = phrases.find((x) => x.unit === 'dirham')?.ar
                    if (said) speak(`${text.trim()}، ${STRINGS.ar.means} ${said}`)
                  } else speak(t.readOut(fmt(dirham, lang)), { lang: lang === 'fr' ? 'fr-FR' : 'en-US' })
                }}
              />
              {!text.trim() && <EmptyHint t={t} />}
            </div>
          </Card>
          <div className="hidden lg:block">
            <SoukKit dirham={dirham} lang={lang} t={t} />
          </div>
          <div className="hidden lg:block">
            <History items={history} onPick={setText} onClear={() => setHistory([])} lang={lang} t={t} />
          </div>
        </div>

        <div className="min-w-0 space-y-4 lg:col-span-5">
          <SayIt phrases={phrases} units={units} lang={lang} t={t} />
          <Equivalents values={values} units={units} lang={lang} t={t} preset={preset} presetLabel={presetLabel} onOpenRegion={() => setRegionOpen(true)} />
          <ForeignCurrencies
            values={values}
            units={units}
            rates={rates}
            shown={shownForeign}
            onToggle={(id) => setShownForeign((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
            lang={lang}
            t={t}
          />
          <div className="lg:hidden">
            <SoukKit dirham={dirham} lang={lang} t={t} />
          </div>
          <div className="lg:hidden">
            <History items={history} onPick={setText} onClear={() => setHistory([])} lang={lang} t={t} />
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex flex-col gap-3 border-t border-line pt-5 text-[12.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1">
              {online ? <span className="size-1.5 rounded-full bg-brand" /> : <WifiOff size={13} />}
              {t.offline}
            </span>
            {install && (
              <button type="button" onClick={install} className="btn-press inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 font-medium text-brand-ink hover:bg-brand-hover">
                <Download size={13} />
                {t.install}
              </button>
            )}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 hover:bg-surface-2 hover:text-ink">
              <GithubMark size={13} />
              {t.source}
            </a>
          </div>
        </div>
      </footer>

      <RegionDialog
        place={place}
        onDetect={detectPlace}
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        preset={preset}
        onPreset={setPreset}
        custom={custom}
        franc={franc}
        onFranc={setFranc}
        onCustom={setCustom}
        lang={lang}
        t={t}
      />
    </div>
  )
}
