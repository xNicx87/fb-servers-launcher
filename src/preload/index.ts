import { contextBridge, ipcRenderer } from 'electron'
import { FbServersApi, DownloadProgress } from '../types'

const api: FbServersApi = {
  getSystemInfo: () => ipcRenderer.invoke('fb:get-system-info'),
  getGames: () => ipcRenderer.invoke('fb:get-games'),
  detectGame: (gameId) => ipcRenderer.invoke('fb:detect-game', gameId),
  setGamePath: (gameId, path) => ipcRenderer.invoke('fb:set-game-path', gameId, path),
  browseForDirectory: () => ipcRenderer.invoke('fb:browse-directory'),
  browseForFile: (filters) => ipcRenderer.invoke('fb:browse-file', filters),
  installPatch: (gameId, patchId) => ipcRenderer.invoke('fb:install-patch', gameId, patchId),
  cancelDownload: (patchId) => ipcRenderer.invoke('fb:cancel-download', patchId),
  launchGame: (gameId, withMods) => ipcRenderer.invoke('fb:launch-game', gameId, withMods),
  getSettings: () => ipcRenderer.invoke('fb:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('fb:save-settings', settings),

  onDownloadProgress: (callback) => {
    const subscription = (_event: any, value: DownloadProgress) => callback(value)
    ipcRenderer.on('fb:download-progress', subscription)
    return () => {
      ipcRenderer.removeListener('fb:download-progress', subscription)
    }
  },

  onGameStatusChange: (callback) => {
    const subscription = (_event: any, value: { gameId: string; isRunning: boolean }) => callback(value)
    ipcRenderer.on('fb:game-status', subscription)
    return () => {
      ipcRenderer.removeListener('fb:game-status', subscription)
    }
  }
}

contextBridge.exposeInMainWorld('fbApi', api)
