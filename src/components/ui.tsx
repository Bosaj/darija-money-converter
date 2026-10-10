import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyText } from '../lib/format'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[28px] border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>{children}</section>
  )
}

export function CardTitle({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>}
        <div>
          <h2 className="text-[15px] font-semibold leading-tight text-ink">{title}</h2>
          {hint && <p className="mt-0.5 text-[13px] text-ink-3">{hint}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'ghost' | 'soft' | 'brand' }

export function IconButton({ label, tone = 'ghost', className = '', children, ...rest }: IconButtonProps) {
  const tones = {
    ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
    soft: 'bg-surface-2 text-ink-2 hover:text-ink border border-line',
    brand: 'bg-brand text-brand-ink hover:bg-brand-hover',
  }
  return (
    <button type="button" aria-label={label} title={label} className={`btn-press grid size-11 shrink-0 place-items-center rounded-2xl ${tones[tone]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function CopyButton({ text, label, copiedLabel, className = '' }: { text: string; label: string; copiedLabel: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <IconButton
      label={done ? copiedLabel : label}
      className={className}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        }
      }}
    >
      <span className="relative size-[18px]">
        <Copy size={18} className={`absolute inset-0 transition-[opacity,transform,filter] duration-200 ${done ? 'scale-50 opacity-0 blur-[2px]' : ''}`} />
        <Check size={18} className={`absolute inset-0 text-brand transition-[opacity,transform,filter] duration-200 ${done ? '' : 'scale-50 opacity-0 blur-[2px]'}`} />
      </span>
    </IconButton>
  )
}

export function Badge({ children, tone = 'warn' }: { children: ReactNode; tone?: 'warn' | 'brand' | 'muted' }) {
  const tones = {
    warn: 'bg-warn-soft text-warn',
    brand: 'bg-brand-soft text-brand',
    muted: 'bg-surface-2 text-ink-3',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>
}

/** GitHub mark (lucide no longer ships brand icons). */
export function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
