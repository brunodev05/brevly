import { useEffect, useState } from 'react'
import { X, BarChart2, TrendingUp, Clock, ExternalLink, Download, MousePointerClick, Globe, Activity } from 'lucide-react'
import { api } from '../api'
import type { Link, LinkStats } from '../types'

interface Props {
  link: Link
  onClose: () => void
}

export function StatsModal({ link, onClose }: Props) {
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    api.getLinkStats(link.id, days)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [link.id, days])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const maxCount = stats ? Math.max(...stats.accessesByDay.map((d) => d.count), 1) : 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl glass gradient-border flex flex-col">
        {/* Header */}
        <div className="sticky top-0 glass z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">
                {link.name ?? link.shortCode}
              </p>
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400/70 hover:text-violet-300 font-mono truncate flex items-center gap-1 transition-colors"
              >
                {link.shortUrl}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">Carregando relatório...</p>
          </div>
        ) : stats ? (
          <div className="p-6 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-violet-500/15 to-violet-500/5 border border-violet-500/20 rounded-2xl p-4 text-center space-y-1">
                <MousePointerClick className="w-4 h-4 text-violet-400 mx-auto" />
                <p className="text-2xl font-bold text-zinc-100">{stats.totalAccesses}</p>
                <p className="text-[11px] text-zinc-500">Total de acessos</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/15 to-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-center space-y-1">
                <Activity className="w-4 h-4 text-blue-400 mx-auto" />
                <p className="text-2xl font-bold text-zinc-100">{stats.accessesInPeriod}</p>
                <p className="text-[11px] text-zinc-500">Últimos {days} dias</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center space-y-1">
                <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
                <p className="text-2xl font-bold text-zinc-100">
                  {stats.accessesByDay.length > 0
                    ? (stats.accessesInPeriod / stats.accessesByDay.length).toFixed(1)
                    : '0'}
                </p>
                <p className="text-[11px] text-zinc-500">Média / dia</p>
              </div>
            </div>

            {/* Period selector + export */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Acessos por dia</span>
              </div>
              <div className="flex items-center gap-2">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                      days === d
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
                <a
                  href={`/api/links/${link.id}/stats/export?days=${days}`}
                  download
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </a>
              </div>
            </div>

            {/* Bar chart */}
            {stats.accessesByDay.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl py-12 text-center space-y-2">
                <BarChart2 className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-500">Nenhum acesso neste período</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.accessesByDay.map((day) => (
                  <div key={day.date} className="flex items-center gap-3 group">
                    <span className="text-xs text-zinc-500 w-20 shrink-0 group-hover:text-zinc-300 transition-colors">
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <div className="flex-1 h-6 bg-zinc-900/60 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${(day.count / maxCount) * 100}%`,
                          background: `linear-gradient(90deg, #7c3aed, #6366f1)`,
                          boxShadow: '0 0 8px rgba(124, 58, 237, 0.4)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 w-6 text-right shrink-0">
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent accesses */}
            {stats.recentAccesses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300">Acessos recentes</span>
                </div>
                <div className="space-y-1.5">
                  {stats.recentAccesses.map((access, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/40 rounded-xl px-4 py-2.5 text-xs hover:border-zinc-700/60 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-zinc-600 shrink-0" />
                      <span className="text-zinc-400 shrink-0">
                        {new Date(access.accessedAt).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      {access.ip && (
                        <span className="font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded shrink-0">
                          {access.ip}
                        </span>
                      )}
                      {access.userAgent && (
                        <span className="text-zinc-600 truncate flex items-center gap-1">
                          <Globe className="w-3 h-3 shrink-0" />
                          {access.userAgent.slice(0, 50)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
