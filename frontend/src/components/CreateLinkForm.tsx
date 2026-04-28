import { useState } from 'react'
import { Link2, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import { api } from '../api'
import type { Link } from '../types'

interface Props {
  onCreated: (link: Link) => void
}

export function CreateLinkForm({ onCreated }: Props) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const link = await api.createLink({
        url,
        name: name.trim() || undefined,
        customCode: customCode.trim() || undefined,
      })
      onCreated(link)
      setUrl('')
      setName('')
      setCustomCode('')
      setShowAdvanced(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass gradient-border rounded-2xl p-6 sm:p-8 shine">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/30 rounded-xl blur-sm" />
          <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Novo link encurtado</h2>
          <p className="text-xs text-zinc-500">Cole a URL longa e gere um link compacto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL input — main field */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/url-muito-longa-aqui"
            required
            className="input-field pl-11 text-base py-4"
          />
        </div>

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 group"
        >
          <span className={`transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`}>›</span>
          <span>Opções avançadas</span>
          <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
            (nome, código personalizado)
          </span>
        </button>

        {/* Advanced fields */}
        {showAdvanced && (
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Nome / descrição</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Landing Page Produto"
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Código personalizado
                <span className="ml-1.5 text-zinc-600 font-normal">letras, números, - e _</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-mono select-none">
                  brevly/
                </span>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="meu-link"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]+"
                  className="input-field pl-16"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !url}
          className="btn-primary w-full flex items-center justify-center gap-2 text-white"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Encurtando...
            </>
          ) : (
            <>
              Encurtar link
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
