import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { GameDefinition, PatchInfo, DownloadProgress } from '../../types'
import { downloader } from './downloader'
import { gameDetector } from './gameDetector'
import { modInjector } from './modInjector'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class PatchManager {
  private games: Map<string, GameDefinition> = new Map()

  constructor() {
    this.loadManifest()
  }

  public loadManifest(): void {
    try {
      // Manifest sample included with repository
      const candidatePaths = [
        path.resolve(__dirname, '../../server-manifest-sample/manifest.json'),
        path.resolve(process.cwd(), 'server-manifest-sample/manifest.json')
      ]

      for (const manifestPath of candidatePaths) {
        if (fs.existsSync(manifestPath)) {
          const raw = fs.readFileSync(manifestPath, 'utf-8')
          const data = JSON.parse(raw)
          for (const [id, game] of Object.entries(data.games as Record<string, GameDefinition>)) {
            this.games.set(id, game)
          }
          break
        }
      }
    } catch (err) {
      console.warn('Error reading manifest:', err)
    }
  }

  public getGames(): GameDefinition[] {
    const list: GameDefinition[] = []
    for (const game of this.games.values()) {
      const detection = gameDetector.detectGame(game)
      const gameCopy: GameDefinition = {
        ...game,
        isInstalled: detection.found,
        installedPath: detection.path,
        isRunning: false
      }
      list.push(gameCopy)
    }
    return list
  }

  public getGame(gameId: string): GameDefinition | undefined {
    return this.games.get(gameId)
  }

  public async installPatch(
    gameId: string,
    patchId: string,
    onProgress: (progress: DownloadProgress) => void
  ): Promise<boolean> {
    const game = this.games.get(gameId)
    if (!game) throw new Error(`Juego no encontrado: ${gameId}`)

    const patch = game.patches.find((p) => p.id === patchId)
    if (!patch) throw new Error(`Parche no encontrado: ${patchId}`)

    const detection = gameDetector.detectGame(game)
    if (!detection.found || !detection.path) {
      throw new Error(`El juego ${game.name} no está instalado o su ruta no es válida.`)
    }

    // Determine target installation directory
    let targetDir = detection.path
    if (patch.target_type === 'save_folder') {
      targetDir = gameDetector.resolveSaveDirectory(game)
    } else if (patch.target_type === 'sider_content') {
      targetDir = path.join(detection.path, 'content')
    }

    const downloadRes = await downloader.downloadAndExtract({
      patchId: patch.id,
      gameId: game.id,
      name: patch.name,
      url: patch.download_url,
      sha256: patch.sha256,
      targetDir,
      onProgress
    })

    if (!downloadRes.success) {
      throw new Error(downloadRes.error || 'Fallo durante la descarga del parche')
    }

    // Post-installation mod configuration
    await modInjector.configurePatch(game, patch, detection.path)
    return true
  }
}

export const patchManager = new PatchManager()
