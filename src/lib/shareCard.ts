/**
 * Render a 1080×1350 price card (Instagram/WhatsApp friendly) and share it via
 * the Web Share API, falling back to a PNG download.
 */
export interface CardData {
  input: string
  dirhamText: string
  lines: { label: string; value: string }[]
  phrase?: string
  url: string
}

const W = 1080
const H = 1350
const FONT = "'Readex Pro Variable', 'Segoe UI', Tahoma, sans-serif"

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  for (const rot of [0, Math.PI / 4]) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot)
    ctx.strokeRect(-r, -r, r * 2, r * 2)
    ctx.restore()
  }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number, size: number, weight: number) {
  let s = size
  do {
    ctx.font = `${weight} ${s}px ${FONT}`
    if (ctx.measureText(text).width <= max) break
    s -= 4
  } while (s > 24)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function renderCard(d: CardData): Promise<Blob> {
  const fonts = [`600 96px ${FONT}`, `400 40px ${FONT}`]
  await Promise.all(fonts.map((f) => document.fonts?.load(f, d.input + d.dirhamText + (d.phrase ?? '')).catch(() => null)))

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#13906c')
  bg.addColorStop(1, '#0a4f3d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 2
  for (let y = 0; y < H + 90; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < W + 90; x += 90) star(ctx, x, y, 20)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = 'rtl'

  // brand: the coin logo + name
  const coin = await loadImage('/favicon.svg').catch(() => null)
  if (coin) {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 10
    ctx.drawImage(coin, W / 2 - 300 - 48, 82, 96, 96)
    ctx.restore()
  }
  ctx.textAlign = 'left'
  ctx.direction = 'rtl'
  ctx.fillStyle = '#f2b847'
  ctx.font = `600 52px ${FONT}`
  ctx.direction = 'ltr'
  ctx.fillText('حسبلي', W / 2 - 230, 118)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = `400 28px ${FONT}`
  ctx.fillText('Darija Money Converter', W / 2 - 230, 168)
  ctx.textAlign = 'center'

  // input phrase
  ctx.direction = 'rtl'
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  fitText(ctx, d.input, W - 160, 64, 500)
  ctx.fillText(d.input, W / 2, 360)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = `400 56px ${FONT}`
  ctx.fillText('=', W / 2, 460)

  // dirham result panel
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.roundRect(90, 520, W - 180, 230, 48)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.direction = 'ltr'
  fitText(ctx, d.dirhamText, W - 260, 132, 600)
  ctx.fillText(d.dirhamText, W / 2, 625)
  ctx.font = `500 34px ${FONT}`
  ctx.fillStyle = '#f2b847'
  ctx.direction = 'rtl'
  ctx.fillText('درهم مغربي · MAD', W / 2, 712)

  // equivalents
  let y = 820
  for (const line of d.lines.slice(0, 3)) {
    ctx.font = `400 34px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.fillText(line.label, W / 2, y)
    ctx.font = `600 44px ${FONT}`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(line.value, W / 2, y + 52)
    y += 120
  }

  if (d.phrase) {
    ctx.fillStyle = '#f2b847'
    fitText(ctx, d.phrase, W - 180, 40, 500)
    ctx.fillText(d.phrase, W / 2, H - 150)
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = `400 28px ${FONT}`
  ctx.direction = 'ltr'
  ctx.fillText(d.url, W / 2, H - 70)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

export async function shareCard(d: CardData, title: string): Promise<void> {
  const blob = await renderCard(d)
  const file = new File([blob], 'hsabli-price.png', { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title, text: `${d.input} = ${d.dirhamText} DH` })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
