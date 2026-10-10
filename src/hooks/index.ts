import { useCallback, useEffect, useRef, useState } from 'react'

/** State persisted to localStorage. Storage can be unavailable (private mode) — never throws. */
export function useStored<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable */
    }
  }, [key, value])
  return [value, setValue]
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt(): (() => Promise<void>) | null {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  if (!event) return null
  return async () => {
    await event.prompt()
    await event.userChoice
    setEvent(null)
  }
}

/* ---- Web Speech API (not in lib.dom for every browser) ---- */
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type RecognitionCtor = new () => SpeechRecognitionLike

function getRecognition(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** Dictation in Moroccan Arabic (falls back to the browser's Arabic model). */
export function useDictation(onText: (text: string) => void) {
  const ctor = getRecognition()
  const [listening, setListening] = useState(false)
  const rec = useRef<SpeechRecognitionLike | null>(null)
  const callback = useRef(onText)
  callback.current = onText

  const stop = useCallback(() => rec.current?.stop(), [])
  const start = useCallback(
    (lang: string) => {
      if (!ctor) return
      const r = new ctor()
      r.lang = lang
      r.interimResults = true
      r.maxAlternatives = 1
      r.onresult = (e) => {
        let text = ''
        for (let i = 0; i < e.results.length; i++) text += e.results[i]![0]!.transcript
        callback.current(text)
      }
      r.onend = () => setListening(false)
      r.onerror = () => setListening(false)
      rec.current = r
      setListening(true)
      r.start()
    },
    [ctor],
  )
  return { supported: Boolean(ctor), listening, start, stop }
}

/** Read text aloud with the best available Arabic / French / English voice. */
export function speak(text: string, lang: string) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  const voices = speechSynthesis.getVoices()
  const base = lang.split('-')[0]!
  u.voice = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base)) ?? null
  u.rate = 0.95
  speechSynthesis.speak(u)
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
