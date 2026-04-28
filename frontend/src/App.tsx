import { useEffect, useState } from 'react'
import { Link2, Search, Download, Zap, TrendingUp } from 'lucide-react'
import { api } from './api'
import type { Link } from './types'
import { CreateLinkForm } from './components/CreateLinkForm'
import { LinkCard } from './components/LinkCard'
import { StatsModal } from './components/StatsModal'

export function App() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)

  useEffect(() => {
    api.getLinks()
      .then(setLinks)
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(link: Link) {
    setLinks((prev) => [link, ...prev])
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteLink(id)
      setLinks((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover link')
    }
  }

  const filtered = links.filter((l) => {
    const q = search.toLowerCase()
    return (
      l.url.toLowerCase().includes(q) ||
      l.shortCode.toLowerCase().includes(q) ||
      (l.name ?? '').toLowerCase().includes(q)
    )
  })

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
                <Link2 className="w-4.5 h-4.5 text-white" size={18} />
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
              <a
                href="/api/links/export"
                download
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </a>
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

        {/* Create form */}
        <CreateLinkForm onCreated={handleCreated} />

        {/* Links list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              Seus links
              {links.length > 0 && (
                <span className="ml-2 normal-case tracking-normal text-zinc-600">({links.length})</span>
              )}
            </h2>
            {links.length > 3 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="input-field pl-9 py-2 text-xs w-48"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center space-y-3 gradient-border">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-sm font-medium">
                {search ? 'Nenhum link encontrado' : 'Nenhum link criado ainda'}
              </p>
              <p className="text-zinc-600 text-xs">
                {search ? 'Tente outro termo de busca' : 'Crie seu primeiro link encurtado acima'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                  onStats={setSelectedLink}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedLink && (
        <StatsModal link={selectedLink} onClose={() => setSelectedLink(null)} />
      )}
    </div>
  )
}
