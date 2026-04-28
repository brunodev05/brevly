import { useEffect, useState } from 'react'
import { Link2, Download, Zap, TrendingUp } from 'lucide-react'
import { api } from '../api'
import type { Link } from '../types'
import { CreateLinkForm } from '../components/CreateLinkForm'
import { LinkCard } from '../components/LinkCard'

export function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.getLinks()
      .then(setLinks)
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(link: Link) {
    setLinks((prev) => [link, ...prev])
  }

  async function handleDelete(shortCode: string) {
    try {
      await api.deleteLink(shortCode)
      setLinks((prev) => prev.filter((l) => l.shortCode !== shortCode))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover link')
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const { url } = await api.exportLinks()
      window.open(url, '_blank')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao gerar CSV')
    } finally {
      setExporting(false)
    }
  }

  const totalAccesses = links.reduce((sum, l) => sum + l.accessCount, 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-xl blur-md opacity-40" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Link2 size={18} className="text-white" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight gradient-text">brevly</span>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">link shortener</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {links.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-zinc-300 font-medium">{links.length}</span> links
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-zinc-300 font-medium">{totalAccesses}</span> acessos
                </span>
              </div>
            )}
            {links.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-all duration-200"
              >
                {exporting ? (
                  <span className="w-3.5 h-3.5 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {exporting ? 'Gerando...' : 'Baixar CSV'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3 py-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="gradient-text">Encurte.</span>{' '}
            <span className="text-zinc-100">Compartilhe.</span>{' '}
            <span className="text-zinc-400">Acompanhe.</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Crie links curtos, rastreie acessos em tempo real e exporte relatórios em CSV.
          </p>
        </div>

        <CreateLinkForm onCreated={handleCreated} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              Seus links
              {links.length > 0 && (
                <span className="ml-2 normal-case tracking-normal text-zinc-600">({links.length})</span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-2xl h-36 animate-pulse" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center space-y-3 gradient-border">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-sm font-medium">Nenhum link criado ainda</p>
              <p className="text-zinc-600 text-xs">Crie seu primeiro link encurtado acima</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
