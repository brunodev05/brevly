import { useState } from 'react'
import { Copy, Trash2, Check, ExternalLink, MousePointerClick } from 'lucide-react'
import type { Link } from '../types'

interface Props {
  link: Link
  onDelete: (shortCode: string) => void
}

export function LinkCard({ link, onDelete }: Props) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(link.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Remover o link "${link.shortCode}"?`)) return
    setDeleting(true)
    onDelete(link.shortCode)
  }

  const domain = (() => {
    try { return new URL(link.url).hostname.replace('www.', '') }
    catch { return link.url }
  })()

  return (
    <div className={`glass glass-hover gradient-border rounded-2xl p-5 flex flex-col gap-4 shine transition-all duration-200 ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-100 truncate font-mono">{link.shortCode}</p>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{domain}</p>
        </div>
        <span className="shrink-0 inline-flex items-center text-xs font-mono font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg px-2.5 py-1">
          {link.accessCount} acessos
        </span>
      </div>

      <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-2.5 group">
        <span className="text-xs text-violet-400 font-medium truncate flex-1 font-mono">
          {link.shortUrl}
        </span>
        <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            title="Copiar"
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
              copied
                ? 'text-emerald-400 bg-emerald-500/15'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60 transition-all duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-zinc-400">
            <span className="text-zinc-200 font-semibold">{link.accessCount}</span>{' '}
            acesso{link.accessCount !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200 disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remover
        </button>
      </div>
    </div>
  )
}
