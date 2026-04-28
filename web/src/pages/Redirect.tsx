import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import { api } from '../api'

export function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!shortCode) {
      navigate('/', { replace: true })
      return
    }

    api
      .getLink(shortCode)
      .then(({ url }) => {
        window.location.href = url
      })
      .catch(() => {
        setError(true)
      })
  }, [shortCode, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Link2 className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-zinc-100 font-semibold">Link não encontrado</p>
          <p className="text-zinc-500 text-sm">
            O link <span className="font-mono text-zinc-300">/{shortCode}</span> não existe ou foi removido.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-primary text-white text-sm px-5 py-2.5"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500/30 rounded-2xl blur-md" />
        <div className="relative w-14 h-14 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-2xl flex items-center justify-center">
          <span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-zinc-100 font-semibold">Redirecionando...</p>
        <p className="text-zinc-500 text-sm">Aguarde um momento</p>
      </div>
    </div>
  )
}
