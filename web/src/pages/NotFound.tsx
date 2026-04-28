import { useNavigate } from 'react-router-dom'
import { Link2, ArrowLeft } from 'lucide-react'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-8xl font-extrabold gradient-text">404</p>
        <div className="w-12 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full mx-auto" />
      </div>

      <div className="space-y-2">
        <p className="text-xl font-bold text-zinc-100">Página não encontrada</p>
        <p className="text-zinc-500 text-sm max-w-xs">
          O endereço que você digitou não existe ou o link encurtado foi removido.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Link2 size={16} className="text-white" />
        </div>
        <span className="text-base font-bold gradient-text">brevly</span>
      </div>

      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao início
      </button>
    </div>
  )
}
