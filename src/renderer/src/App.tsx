import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { GameCard } from './components/GameCard'
import { GameDetailView } from './components/GameDetailView'
import { DownloadsView } from './components/DownloadsView'
import { SettingsView } from './components/SettingsView'
import {
  GameDefinition,
  DownloadProgress,
  LauncherSettings,
  LauncherSystemInfo
} from '../../types'
import { Layers, AlertCircle } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState<'games' | 'downloads' | 'settings'>('games')
  const [games, setGames] = useState<GameDefinition[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>('pes2021')
  const [downloads, setDownloads] = useState<Record<string, DownloadProgress>>({})
  const [settings, setSettings] = useState<LauncherSettings>({
    language: 'es',
    theme: 'dark',
    customGamePaths: {},
    discordRpcEnabled: true,
    autoUpdateLauncher: true,
    preferredCdn: 'default'
  })
  const [systemInfo, setSystemInfo] = useState<LauncherSystemInfo | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  // Initialize data from main process
  useEffect(() => {
    const init = async () => {
      try {
        if (window.fbApi) {
          const [sys, gms, stt] = await Promise.all([
            window.fbApi.getSystemInfo(),
            window.fbApi.getGames(),
            window.fbApi.getSettings()
          ])
          setSystemInfo(sys)
          setGames(gms)
          setSettings(stt)
          if (gms.length > 0) {
            setSelectedGameId(gms[0].id)
          }
        }
      } catch (err) {
        console.error('Error initializing FB Servers Launcher:', err)
      }
    }

    init()

    // Download progress listener
    const unbindProgress = window.fbApi?.onDownloadProgress((prog) => {
      setDownloads((prev) => ({
        ...prev,
        [prog.patchId]: prog
      }))
    })

    // Game status listener
    const unbindStatus = window.fbApi?.onGameStatusChange(({ gameId, isRunning }) => {
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, isRunning } : g))
      )
    })

    return () => {
      unbindProgress?.()
      unbindStatus?.()
    }
  }, [])

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0]

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleLaunch = async (withMods: boolean) => {
    if (!selectedGame) return
    try {
      const res = await window.fbApi.launchGame(selectedGame.id, withMods)
      if (res.success) {
        showNotification(`¡${selectedGame.name} iniciado correctamente!`)
      } else {
        showNotification(`Error al iniciar: ${res.error}`)
      }
    } catch (err: any) {
      showNotification(`Error: ${err?.message || err}`)
    }
  }

  const handleInstallPatch = async (patchId: string) => {
    if (!selectedGame) return
    setActiveTab('downloads')
    try {
      await window.fbApi.installPatch(selectedGame.id, patchId)
      showNotification('¡Parche instalado con éxito!')
      const updatedGames = await window.fbApi.getGames()
      setGames(updatedGames)
    } catch (err: any) {
      showNotification(`Error al instalar: ${err?.message || err}`)
    }
  }

  const handleCancelDownload = async (patchId: string) => {
    await window.fbApi.cancelDownload(patchId)
    setDownloads((prev) => {
      const copy = { ...prev }
      delete copy[patchId]
      return copy
    })
  }

  const handleBrowseGamePath = async (gameId: string) => {
    const dir = await window.fbApi.browseForDirectory()
    if (dir) {
      await window.fbApi.setGamePath(gameId, dir)
      const [updatedGames, updatedSettings] = await Promise.all([
        window.fbApi.getGames(),
        window.fbApi.getSettings()
      ])
      setGames(updatedGames)
      setSettings(updatedSettings)
      showNotification('Ruta actualizada correctamente')
    }
  }

  const handleSaveSettings = async (partial: Partial<LauncherSettings>) => {
    await window.fbApi.saveSettings(partial)
    const stt = await window.fbApi.getSettings()
    setSettings(stt)
    showNotification('Ajustes guardados')
  }

  const activeDownloadsList = Object.values(downloads).filter(
    (d) => d.status === 'downloading' || d.status === 'verifying' || d.status === 'extracting'
  )

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemInfo={systemInfo}
        activeDownloadsCount={activeDownloadsList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-16 px-8 border-b border-[#1a2336] flex items-center justify-between bg-[#0b0f19]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-semibold text-gray-200">FB SERVERS v1.0</span>
            <span>•</span>
            <span className="text-emerald-400">Canal Estable</span>
          </div>

          {notification && (
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{notification}</span>
            </div>
          )}
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'games' && (
            <div className="space-y-8">
              {/* Games Grid */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Juegos Compatibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((g) => (
                    <GameCard
                      key={g.id}
                      game={g}
                      isSelected={selectedGame?.id === g.id}
                      onSelect={() => setSelectedGameId(g.id)}
                      onQuickLaunch={() => {
                        setSelectedGameId(g.id)
                        handleLaunch(true)
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Game Detail View */}
              {selectedGame && (
                <GameDetailView
                  game={selectedGame}
                  onLaunch={handleLaunch}
                  onInstallPatch={handleInstallPatch}
                  onBrowsePath={() => handleBrowseGamePath(selectedGame.id)}
                  isDownloading={(patchId) => Boolean(downloads[patchId] && downloads[patchId].status === 'downloading')}
                />
              )}
            </div>
          )}

          {activeTab === 'downloads' && (
            <DownloadsView
              downloads={downloads}
              onCancel={handleCancelDownload}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              systemInfo={systemInfo}
              onSave={handleSaveSettings}
              onBrowseGamePath={handleBrowseGamePath}
            />
          )}
        </div>
      </main>
    </div>
  )
}
