import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/* Speech-to-text (Web Speech API)                                     */
/* ------------------------------------------------------------------ */

export const STT_LANGS = [
  { id: 'ar-MA', label: 'الدارجة', hint: 'Darija / Moroccan Arabic' },
  { id: 'ar-SA', label: 'العربية', hint: 'Standard Arabic' },
  { id: 'fr-FR', label: 'Français', hint: 'French' },
  { id: 'en-US', label: 'English', hint: 'English' },
] as const
export type SttLang = (typeof STT_LANGS)[number]['id']

export type SttError = 'permission' | 'silence' | 'network' | 'mic' | 'language' | 'unknown'

interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
}
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: RecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}
type RecognitionCtor = new () => Recognition

export function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function mapSttError(code: string): SttError {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'permission'
  if (code === 'no-speech') return 'silence'
  if (code === 'network') return 'network'
  if (code === 'audio-capture') return 'mic'
  if (code === 'language-not-supported') return 'language'
  return 'unknown'
}

/**
 * Dictation with live interim text and a microphone level meter.
 * `onText(text, final)` fires on every partial and on the final result.
 */
export function useDictation(onText: (text: string, final: boolean) => void) {
  const ctor = recognitionCtor()
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<SttError | null>(null)
  const [level, setLevel] = useState(0)
  const rec = useRef<Recognition | null>(null)
  const meter = useRef<{ stream: MediaStream; ctx: AudioContext; raf: number } | null>(null)
  const cb = useRef(onText)
  cb.current = onText

  const stopMeter = useCallback(() => {
    const m = meter.current
    meter.current = null
    if (!m) return
    cancelAnimationFrame(m.raf)
    m.stream.getTracks().forEach((t) => t.stop())
    void m.ctx.close()
    setLevel(0)
  }, [])

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const v of data) sum += ((v - 128) / 128) ** 2
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4))
        if (meter.current) meter.current.raf = requestAnimationFrame(tick)
      }
      meter.current = { stream, ctx, raf: requestAnimationFrame(tick) }
    } catch {
      /* the meter is decoration; recognition may still work */
    }
  }, [])

  const stop = useCallback(() => {
    rec.current?.stop()
  }, [])

  const start = useCallback(
    (lang: SttLang) => {
      if (!ctor) return
      rec.current?.abort()
      const r = new ctor()
      r.lang = lang
      r.continuous = false
      r.interimResults = true
      r.maxAlternatives = 1
      r.onresult = (e) => {
        let text = ''
        let final = true
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i]![0]!.transcript
          if (!e.results[i]!.isFinal) final = false
        }
        cb.current(text.trim(), final)
      }
      r.onerror = (e) => {
        if (e.error !== 'aborted') setError(mapSttError(e.error))
      }
      r.onend = () => {
        setListening(false)
        stopMeter()
      }
      rec.current = r
      setError(null)
      setListening(true)
      try {
        r.start()
        void startMeter()
      } catch {
        setListening(false)
        setError('unknown')
      }
    },
    [ctor, startMeter, stopMeter],
  )

  useEffect(() => () => {
    rec.current?.abort()
    stopMeter()
  }, [stopMeter])

  return { supported: Boolean(ctor), listening, error, level, start, stop, clearError: () => setError(null) }
}

/* ------------------------------------------------------------------ */
/* Text-to-speech                                                      */
/* ------------------------------------------------------------------ */

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Arabic voices, best first: Moroccan (ar-MA), then other Arabic, natural/online voices first. */
export function rankVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const score = (v: SpeechSynthesisVoice) => (v.lang.toLowerCase() === 'ar-ma' ? 100 : 0) + (/natural|online|neural/i.test(v.name) ? 10 : 0) + (v.localService ? 0 : 1)
  return voices.filter((v) => v.lang.toLowerCase().startsWith('ar')).sort((a, b) => score(b) - score(a))
}

export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => (canSpeak ? speechSynthesis.getVoices() : []))
  useEffect(() => {
    if (!canSpeak) return
    const update = () => setVoices(speechSynthesis.getVoices())
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])
  return voices
}

export interface SpeakOptions {
  voiceURI?: string | null
  rate?: number
  lang?: string
}

export interface VoicePrefs {
  voiceURI: string | null
  rate: number
  stt: SttLang | null
}
export const VOICE_KEY = 'dmc:voice'
export const DEFAULT_VOICE: VoicePrefs = { voiceURI: null, rate: 0.95, stt: null }

export function readVoicePrefs(): VoicePrefs {
  try {
    return { ...DEFAULT_VOICE, ...(JSON.parse(localStorage.getItem(VOICE_KEY) ?? 'null') ?? {}) }
  } catch {
    return DEFAULT_VOICE
  }
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!canSpeak || !text) return
  const prefs = readVoicePrefs()
  const { rate = prefs.rate, lang = 'ar-MA' } = opts
  // the saved voice is an Arabic one: use it for Arabic only, pick a matching voice for French/English
  const voiceURI = opts.voiceURI ?? (lang.startsWith('ar') ? prefs.voiceURI : null)
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voices = speechSynthesis.getVoices()
  const chosen = (voiceURI && voices.find((v) => v.voiceURI === voiceURI)) || (lang.startsWith('ar') ? rankVoices(voices)[0] : voices.find((v) => v.lang.startsWith(lang.split('-')[0]!)))
  u.voice = chosen ?? null
  u.lang = chosen?.lang ?? lang
  u.rate = rate
  speechSynthesis.speak(u)
}
