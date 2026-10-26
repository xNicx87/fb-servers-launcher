import React from 'react'
import {
  Gamepad2,
  Download,
  Settings,
  ShieldCheck,
  Disc,
  Terminal,
  Cpu
} from 'lucide-react'
import { LauncherSystemInfo } from '../../../types'

interface SidebarProps {
  activeTab: 'games' | 'downloads' | 'settings'
  setActiveTab: (tab: 'games' | 'downloads' | 'settings') => void
  systemInfo: LauncherSystemInfo | null
  activeDownloadsCount: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  systemInfo,
  activeDownloadsCount
}) => {
  return (
    <aside className="w-64 bg-[#0d121f] border-r border-[#1a2336] flex flex-col justify-between p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-[#1a2336]/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Disc className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white">FB SERVERS</h1>
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
              PES & FIFA Launcher
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveTab('games')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'games'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#141b2d]'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Biblioteca de Juegos</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'downloads'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#141b2d]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4" />
              <span>Gestor de Parches</span>
            </div>
            {activeDownloadsCount > 0 && (
              <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {activeDownloadsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#141b2d]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes y Rutas</span>
          </button>
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="pt-4 border-t border-[#1a2336]/60">
        <div className="bg-[#121826] p-3 rounded-xl border border-[#1f293d] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Plataforma
            </span>
            <span className="font-semibold text-gray-200 uppercase">
              {systemInfo?.platform === 'win32' ? 'Windows x64' : 'Linux / Proton'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Integridad
            </span>
            <span className="text-emerald-400 font-medium">SHA-256 Activo</span>
          </div>

          {systemInfo?.platform === 'linux' && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Proton / Wine
              </span>
              <span className="text-gray-200 truncate max-w-[90px]">
                {systemInfo.availableProtons.length > 0 ? 'Detectado' : 'Estándar'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
