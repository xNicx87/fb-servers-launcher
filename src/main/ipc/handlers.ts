import { ipcMain, dialog, BrowserWindow } from 'electron'
import os from 'node:os'
import fs from 'node:fs'
import { LauncherSystemInfo } from '../../types'
import { isLinux, isWindows, findAvailableProtons, getSteamCommonPaths } from '../utils/paths'
import { patchManager } from '../services/patchManager'
import { gameDetector } from '../services/gameDetector'
import { configStore } from '../services/configStore'
import { gameRunner } from '../services/runner'
import { downloader } from '../services/downloader'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // 1. System Information
  ipcMain.handle('fb:get-system-info', async (): Promise<LauncherSystemInfo> => {
    const protons = findAvailableProtons()
    const steamPaths = getSteamCommonPaths()

    return {
      platform: process.platform as 'win32' | 'linux' | 'darwin',
      arch: os.arch(),
      osRelease: os.release(),
      isWineOrProtonDetected: isLinux && protons.length > 0,
      steamInstalled: steamPaths.length > 0,
      availableProtons: protons
    }
  })

  // 2. Games list and detection
  ipcMain.handle('fb:get-games', async () => {
    return patchManager.getGames()
  })

  ipcMain.handle('fb:detect-game', async (_, gameId: string) => {
    const game = patchManager.getGame(gameId)
    if (!game) return { found: false }
    return gameDetector.detectGame(game)
  })

  ipcMain.handle('fb:set-game-path', async (_, gameId: string, customPath: string) => {
    return configStore.setGameCustomPath(gameId, customPath)
  })

  // 3. File and directory pickers
  ipcMain.handle('fb:browse-directory', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    return res.canceled ? null : res.filePaths[0]
  })

  ipcMain.handle('fb:browse-file', async (_, filters: { name: string; extensions: string[] }[]) => {
    const res = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters
    })
    return res.canceled ? null : res.filePaths[0]
  })

  // 4. Patch installation
  ipcMain.handle('fb:install-patch', async (_, gameId: string, patchId: string) => {
    try {
      return await patchManager.installPatch(gameId, patchId, (progress) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('fb:download-progress', progress)
        }
      })
    } catch (err: any) {
      console.error('Error installing patch:', err)
      throw err
    }
  })

  ipcMain.handle('fb:cancel-download', async (_, patchId: string) => {
    return downloader.cancel(patchId)
  })

  // 5. Game Launching
  ipcMain.handle('fb:launch-game', async (_, gameId: string, withMods: boolean) => {
    const game = patchManager.getGame(gameId)
    if (!game) return { success: false, error: 'Juego no encontrado' }

    const detection = gameDetector.detectGame(game)
    if (!detection.found || !detection.path) {
      return { success: false, error: 'Directorio del juego no encontrado. Configura la ruta en Ajustes.' }
    }

    return gameRunner.launch(game, detection.path, withMods)
  })

  // 6. Settings
  ipcMain.handle('fb:get-settings', async () => {
    return configStore.getSettings()
  })

  ipcMain.handle('fb:save-settings', async (_, partial) => {
    return configStore.saveSettings(partial)
  })

  // 7. Status Notifications
  gameRunner.onStatusChange((data) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('fb:game-status', data)
    }
  })
}
