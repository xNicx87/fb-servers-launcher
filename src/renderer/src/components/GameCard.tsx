import React from 'react'
import { CheckCircle2, AlertCircle, Play, Layers } from 'lucide-react'
import { GameDefinition } from '../../../types'

interface GameCardProps {
  game: GameDefinition
  isSelected: boolean
  onSelect: () => void
  onQuickLaunch: () => void
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected,
  onSelect,
  onQuickLaunch
}) => {
  const isPes = game.id.includes('pes')

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
        isSelected
          ? 'border-emerald-500 bg-[#141c2e] shadow-xl shadow-emerald-500/10 scale-[1.02]'
          : 'border-[#1f293d] bg-[#121826] hover:border-gray-600 hover:scale-[1.01]'
      }`}
    >
      {/* Background Graphic / Banner */}
      <div
        className={`h-44 w-full relative overflow-hidden bg-gradient-to-br ${
          isPes
            ? 'from-blue-900 via-indigo-950 to-slate-950'
            : 'from-emerald-900 via-teal-950 to-slate-950'
        }`}
      >
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

        {/* Diagonal stripes texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {game.isInstalled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Instalado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              No detectado
            </span>
          )}
        </div>

        {/* Title inside card */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {game.subtitle || 'Edición Completa'}
          </p>
          <h3 className="text-xl font-black text-white drop-shadow-md">
            {game.name}
          </h3>
        </div>
      </div>

      {/* Card Body & Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 border-b border-[#1f293d] pb-3">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Parches disponibles
          </span>
          <span className="font-semibold text-gray-200">
            {game.patches.length} módulos
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {game.isInstalled ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickLaunch()
              }}
              disabled={game.isRunning}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all shadow-md ${
                game.isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{game.isRunning ? 'En ejecución...' : 'Jugar con FB Mods'}</span>
            </button>
          ) : (
            <button
              onClick={onSelect}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#1a2336] hover:bg-[#222e47] text-gray-200 transition-all text-center"
            >
              Configurar Ruta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
