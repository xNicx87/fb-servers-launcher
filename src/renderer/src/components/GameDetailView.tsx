import React, { useState } from 'react'
import {
  Play,
  FolderOpen,
  Download,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  RotateCcw
} from 'lucide-react'
import { GameDefinition, PatchInfo } from '../../../types'

interface GameDetailViewProps {
  game: GameDefinition
  onLaunch: (withMods: boolean) => void
  onInstallPatch: (patchId: string) => void
  onBrowsePath: () => void
  isDownloading: (patchId: string) => boolean
}

export const GameDetailView: React.FC<GameDetailViewProps> = ({
  game,
  onLaunch,
  onInstallPatch,
  onBrowsePath,
  isDownloading
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const isPes = game.id.includes('pes')

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const filteredPatches = activeCategory === 'all'
    ? game.patches
    : game.patches.filter((p) => p.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Hero Banner Header */}
      <div
        className={`relative rounded-3xl overflow-hidden p-8 border border-[#1f293d] bg-gradient-to-r ${
          isPes
            ? 'from-blue-950 via-slate-900 to-[#121826]'
            : 'from-emerald-950 via-slate-900 to-[#121826]'
        }`}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
              FB Servers Compatible
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Steam AppID: {game.steam_appid}
            </span>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">
            {game.name}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            {isPes
              ? 'Gestor automatizado con inyección en vivo mediante Sider 7, Option Files con traspasos mundiales actualizados y estadios dinámicos.'
              : 'Gestor automatizado de plantillas desbloqueadas, torneos competitivos y paquetes gráficos comunitarios.'}
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {game.isInstalled ? (
              <>
                <button
                  onClick={() => onLaunch(true)}
                  disabled={game.isRunning}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{game.isRunning ? 'Juego en Ejecución' : 'Iniciar con FB Mods'}</span>
                </button>

                <button
                  onClick={() => onLaunch(false)}
                  disabled={game.isRunning}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#1a2336] hover:bg-[#25324d] text-gray-300 font-semibold text-sm transition-all border border-[#2b3954]"
                >
                  <span>Iniciar Vanilla</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-amber-300 text-sm">
                <Info className="w-5 h-5 flex-shrink-0" />
                <span>Juego no detectado automáticamente. Selecciona el directorio manualmente.</span>
              </div>
            )}

            <button
              onClick={onBrowsePath}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#141b2d] hover:bg-[#1c263f] text-gray-400 hover:text-white font-medium text-sm transition-all border border-[#1f293d]"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{game.installedPath ? 'Cambiar Carpeta' : 'Localizar Juego'}</span>
            </button>
          </div>

          {game.installedPath && (
            <p className="text-xs text-gray-400 truncate max-w-lg pt-1">
              <span className="font-semibold text-gray-300">Ruta:</span> {game.installedPath}
            </p>
          )}
        </div>
      </div>

      {/* Mods & Patches Section */}
      <div className="bg-[#121826] rounded-3xl p-6 border border-[#1f293d] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f293d] pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Catálogo de Parches Oficiales FB Servers
            </h3>
            <p className="text-xs text-gray-400">
              Instalación, verificación SHA-256 e inyección automática en un solo clic.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#0d121f] p-1 rounded-xl border border-[#1f293d]">
            {['all', 'core', 'rosters', 'content'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat === 'core' ? 'Motor / Sider' : cat === 'rosters' ? 'Plantillas' : 'Estadios'}
              </button>
            ))}
          </div>
        </div>

        {/* Patch List */}
        <div className="space-y-3">
          {filteredPatches.map((patch: PatchInfo) => {
            const downloading = isDownloading(patch.id)

            return (
              <div
                key={patch.id}
                className="bg-[#0e1424] hover:bg-[#121a2f] transition-all p-5 rounded-2xl border border-[#1b253b] flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-white text-base">{patch.name}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#1f2b45] text-emerald-300">
                      v{patch.version}
                    </span>
                    {patch.required && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{patch.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                    <span>Tamaño: {formatBytes(patch.size_bytes)}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Checksum verificado
                    </span>
                  </div>
                </div>

                {/* Install Button */}
                <div>
                  <button
                    onClick={() => onInstallPatch(patch.id)}
                    disabled={downloading || !game.isInstalled}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                      downloading
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed animate-pulse'
                        : !game.isInstalled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/10 active:scale-95'
                    }`}
                  >
                    {downloading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Instalando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Instalar Automáticamente</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
