import { History as HistoryIcon, Trash2 } from 'lucide-react'
import type { Lang } from '../lib/conventions'
import type { Strings } from '../i18n/strings'
import { fmtDirham } from '../lib/format'
import { Card, CardTitle, IconButton } from './ui'

export interface HistoryEntry {
  text: string
  dirham: number
  at: number
}

export function History({ items, onPick, onClear, lang, t }: { items: HistoryEntry[]; onPick: (text: string) => void; onClear: () => void; lang: Lang; t: Strings }) {
  if (!items.length) return null
  return (
    <Card>
      <CardTitle
        icon={<HistoryIcon size={18} />}
        title={t.history}
        action={
          <IconButton label={t.clearHistory} onClick={onClear}>
            <Trash2 size={17} />
          </IconButton>
        }
      />
      <ul className="-mx-2">
        {items.map((h) => (
          <li key={h.at}>
            <button type="button" onClick={() => onPick(h.text)} className="btn-press flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-2.5 text-start hover:bg-surface-2">
              <span dir="auto" className="truncate text-[14.5px] text-ink">{h.text}</span>
              <span className="tabular shrink-0 text-[13.5px] font-semibold text-brand">{fmtDirham(h.dirham, lang)} DH</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
