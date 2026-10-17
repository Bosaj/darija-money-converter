// End-to-end voice check for Hsabli: fake microphone (Web Speech recognition) and fake speaker
// (speechSynthesis), every interface language and every mic language.
// Run: npm run dev, then URL=http://localhost:5173/ npm run e2e:voice (CHROME=<path> to use a local Chrome).
import { chromium } from 'playwright'

const B = process.env.URL ?? 'http://localhost:5191/'
const browser = await chromium.launch({ executablePath: process.env.CHROME, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] })
const results = []
const errors = []
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)

const mock = () => {
  window.__spoken = []
  window.__recLangs = []
  const voices = [
    { name: 'Microsoft Jamal Online (Natural) - Arabic (Morocco)', lang: 'ar-MA', localService: false, default: false, voiceURI: 'jamal' },
    { name: 'Microsoft Hamed - Arabic (Saudi)', lang: 'ar-SA', localService: true, default: false, voiceURI: 'hamed' },
    { name: 'Microsoft Denise Online (Natural) - French (France)', lang: 'fr-FR', localService: false, default: false, voiceURI: 'denise' },
    { name: 'Microsoft Aria Online (Natural) - English (United States)', lang: 'en-US', localService: false, default: true, voiceURI: 'aria' },
  ]
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text
      this.lang = ''
      this.voice = null
      this.rate = 1
    }
  }
  const synth = {
    getVoices: () => voices,
    speak: (u) => {
      window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice?.name ?? null })
      setTimeout(() => u.onend?.(), 5)
    },
    cancel() {},
    pause() {},
    resume() {},
    speaking: false,
    pending: false,
    addEventListener() {},
    removeEventListener() {},
  }
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
  class FakeRecognition {
    constructor() {
      window.__rec = this
    }
    start() {
      window.__recLangs.push(this.lang)
    }
    stop() {
      this.onend?.()
    }
    abort() {
      this.onend?.()
    }
  }
  window.SpeechRecognition = FakeRecognition
  window.webkitSpeechRecognition = FakeRecognition
  window.__say = (text, final = true) => {
    const res = [{ transcript: text, confidence: 0.92 }]
    res.isFinal = final
    window.__rec.onresult?.({ resultIndex: 0, results: [res] })
    if (final) window.__rec.onend?.()
  }
  window.__fail = (code) => {
    window.__rec.onerror?.({ error: code })
    window.__rec.onend?.()
  }
}

const STR = {
  ar: { listen: 'قول الثمن بالصوت', read: 'قرا النتيجة بالصوت', speak: 'سمع', perm: 'خاصك تسمح للميكرو' },
  fr: { listen: 'Dicter le prix', read: 'Lire le résultat à voix haute', speak: 'Écouter', perm: 'Autorisez le micro' },
  en: { listen: 'Say the price', read: 'Read the result aloud', speak: 'Listen', perm: 'Allow the microphone' },
}
const SAY = {
  'ar-MA': ['عشرين ألف ريال', 1000],
  'ar-SA': ['عشرون ألف ريال', 1000],
  'fr-FR': ['vingt mille rials', 1000],
  'en-US': ['twenty thousand rials', 1000],
}
const DEFAULT_STT = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-US' }
const READ_LANG = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-US' }
const digits = (s) => Number(String(s).replace(/[^\d]/g, ''))

for (const lang of ['ar', 'fr', 'en']) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 1, permissions: ['microphone'] })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`${lang}: ${e}`))
  await page.addInitScript(mock)
  await page.addInitScript((l) => {
    localStorage.setItem('dmc:lang', JSON.stringify(l))
    localStorage.removeItem('dmc:voice')
  }, lang)
  await page.goto(B, { waitUntil: 'networkidle' })
  const s = STR[lang]

  // 1. typed text → result
  const input = page.locator('#amount')
  await input.fill('ميتين ريال')
  await page.waitForTimeout(400)
  const hero = page.locator('[aria-live="polite"].pop')
  check(`${lang}: text "ميتين ريال" → 10 DH`, digits(await hero.textContent()) === 10, await hero.textContent())

  // 2. mic in the interface's default language
  await input.fill('')
  await page.getByRole('button', { name: s.listen }).click()
  await page.waitForTimeout(200)
  const recLang = await page.evaluate(() => window.__recLangs.at(-1))
  check(`${lang}: mic starts in ${DEFAULT_STT[lang]}`, recLang === DEFAULT_STT[lang], recLang)
  const [phrase, expected] = SAY[DEFAULT_STT[lang]]
  await page.evaluate((p) => window.__say(p.split(' ')[0], false), phrase) // interim text shows up live
  await page.waitForTimeout(100)
  const interim = await input.inputValue()
  check(`${lang}: interim words appear while speaking`, interim.length > 0, interim)
  await page.evaluate((p) => window.__say(p, true), phrase)
  await page.waitForTimeout(500)
  check(`${lang}: spoken "${phrase}" → ${expected} DH`, digits(await hero.textContent()) === expected, `${await input.inputValue()} → ${await hero.textContent()}`)

  // 3. read the result aloud in the interface language
  await page.getByRole('button', { name: s.read }).click()
  await page.waitForTimeout(100)
  const spoken = await page.evaluate(() => window.__spoken.at(-1))
  check(`${lang}: read-aloud voice ${READ_LANG[lang]}`, spoken?.lang === READ_LANG[lang], JSON.stringify(spoken))

  // 4. "say it like a local" phrases are Darija in every language
  await page.getByRole('button', { name: s.speak }).first().click()
  await page.waitForTimeout(100)
  const darija = await page.evaluate(() => window.__spoken.at(-1))
  check(`${lang}: Darija phrase spoken with the Moroccan voice`, darija?.lang === 'ar-MA' && /[؀-ۿ]/.test(darija.text), JSON.stringify(darija))

  // 5. permission error is explained in the interface language
  await page.getByRole('button', { name: s.listen }).click()
  await page.evaluate(() => window.__fail('not-allowed'))
  await page.waitForTimeout(200)
  check(`${lang}: mic permission error message`, (await page.getByText(s.perm).count()) > 0)
  await ctx.close()
}

// 6. every mic language from the voice settings (Arabic interface)
{
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, permissions: ['microphone'] })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`stt: ${e}`))
  await page.addInitScript(mock)
  for (const stt of ['ar-MA', 'ar-SA', 'fr-FR', 'en-US']) {
    await page.addInitScript((v) => {
      localStorage.setItem('dmc:lang', JSON.stringify('ar'))
      localStorage.setItem('dmc:voice', JSON.stringify({ voiceURI: null, rate: 0.95, stt: v }))
    }, stt)
    await page.goto(B, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: STR.ar.listen }).click()
    const [phrase, expected] = SAY[stt]
    const recLang = await page.evaluate(() => window.__recLangs.at(-1))
    await page.evaluate((p) => window.__say(p, true), phrase)
    await page.waitForTimeout(400)
    const got = digits(await page.locator('[aria-live="polite"].pop').textContent())
    check(`mic ${stt}: "${phrase}" → ${expected} DH`, recLang === stt && got === expected, `rec=${recLang} got=${got}`)
  }
  await ctx.close()
}

await browser.close()
console.log(results.join('\n'))
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passed`)
console.log('page errors:', errors)
