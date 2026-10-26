import React from 'react'
import { Settings, Folder, Terminal, Radio, Shield, Save } from 'lucide-react'
import { LauncherSettings, LauncherSystemInfo } from '../../../types'

interface SettingsViewProps {
  settings: LauncherSettings
  systemInfo: LauncherSystemInfo | null
  onSave: (partial: Partial<LauncherSettings>) => void
  onBrowseGamePath: (gameId: string) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  systemInfo,
  onSave,
  onBrowseGamePath
}) => {
  const isLinux = systemInfo?.platform === 'linux'

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#121826] rounded-3xl p-6 border border-[#1f293d] space-y-6">
        <div className="border-b border-[#1f293d] pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            Ajustes de FB Servers Launcher
          </h2>
          <p className="text-xs text-gray-400">
            Configuración de rutas de instalación, entornos de compatibilidad y servicios de red.
          </p>
        </div>

        {/* Game Paths Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Folder className="w-4 h-4 text-emerald-400" />
            Rutas de Juegos en Disco
          </h3>

          <div className="space-y-3">
            {/* PES 2021 */}
            <div className="bg-[#0e1424] p-4 rounded-2xl border border-[#1b253b] space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Directorio eFootball PES 2021 Season Update
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings.customGamePaths['pes2021'] || 'Detección automática por defecto'}
                  className="flex-1 bg-[#151c2e] border border-[#25324d] rounded-xl px-3 py-2 text-xs text-gray-300"
                />
                <button
                  onClick={() => onBrowseGamePath('pes2021')}
                  className="px-4 py-2 bg-[#1b253b] hover:bg-[#23314d] text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Examinar
                </button>
              </div>
            </div>

            {/* FIFA 23 */}
            <div className="bg-[#0e1424] p-4 rounded-2xl border border-[#1b253b] space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Directorio EA SPORTS FIFA 23
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings.customGamePaths['fifa23'] || 'Detección automática por defecto'}
                  className="flex-1 bg-[#151c2e] border border-[#25324d] rounded-xl px-3 py-2 text-xs text-gray-300"
                />
                <button
                  onClick={() => onBrowseGamePath('fifa23')}
                  className="px-4 py-2 bg-[#1b253b] hover:bg-[#23314d] text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Examinar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Linux / Proton Settings */}
        {isLinux && (
          <div className="space-y-4 pt-2 border-t border-[#1f293d]">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              Capa de Compatibilidad Linux (Proton & Wine)
            </h3>

            <div className="bg-[#0e1424] p-4 rounded-2xl border border-[#1b253b] space-y-3">
              <p className="text-xs text-gray-400">
                Selecciona la versión de Proton para ejecutar ejecutables de Windows (Sider, Mods, Exes de juego):
              </p>

              <select
                value={settings.protonPath || ''}
                onChange={(e) => onSave({ protonPath: e.target.value })}
                className="w-full bg-[#151c2e] border border-[#25324d] rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Proton Oficial de Steam (Automático)</option>
                {systemInfo?.availableProtons.map((proton) => (
                  <option key={proton} value={proton}>
                    {proton}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Network & Discord Integration */}
        <div className="space-y-4 pt-2 border-t border-[#1f293d]">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            Integración de Comunidad y Red
          </h3>

          <div className="bg-[#0e1424] p-4 rounded-2xl border border-[#1b253b] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Discord Rich Presence</h4>
                <p className="text-[11px] text-gray-400">
                  Muestra tu estado de juego, parches instalados y servidor en tu perfil de Discord.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.discordRpcEnabled}
                onChange={(e) => onSave({ discordRpcEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#1b253b] pt-3">
              <div>
                <h4 className="text-xs font-bold text-white">Verificación Criptográfica Estricta</h4>
                <p className="text-[11px] text-gray-400">
                  Comprueba cada bloque con SHA-256 antes de permitir la inyección de mods en el juego.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Forzado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
