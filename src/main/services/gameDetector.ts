import fs from 'node:fs'
import path from 'node:path'
import { GameDefinition } from '../../types'
import { configStore } from './configStore'
import { getSteamCommonPaths, expandPathTokens, isWindows } from '../utils/paths'

export class GameDetector {
  /**
   * Scans the system to detect if a specific game is installed.
   */
  public detectGame(game: GameDefinition): { found: boolean; path?: string } {
    // 1. Check custom path configured by user
    const customPath = configStore.getGameCustomPath(game.id)
    if (customPath && this.validateGameDirectory(customPath, game)) {
      return { found: true, path: customPath }
    }

    // 2. Check Steam standard libraries
    const steamPaths = getSteamCommonPaths()
    for (const steamCommon of steamPaths) {
      // Check exact name and variants
      const candidateNames = [
        game.name,
        game.subtitle ? `${game.name} ${game.subtitle}` : '',
        game.id === 'pes2021' ? 'eFootball PES 2021' : '',
        game.id === 'pes2021' ? 'eFootball PES 2021 SEASON UPDATE' : '',
        game.id === 'fifa23' ? 'FIFA 23' : '',
        game.id === 'fifa23' ? 'EA SPORTS FIFA 23' : ''
      ].filter(Boolean)

      for (const name of candidateNames) {
        const fullDir = path.join(steamCommon, name)
        if (this.validateGameDirectory(fullDir, game)) {
          return { found: true, path: fullDir }
        }
      }
    }

    // 3. Check OS default paths defined in manifest
    const defaultList = isWindows ? game.default_paths.windows : game.default_paths.linux
    for (const raw of defaultList) {
      const expanded = expandPathTokens(raw)
      if (this.validateGameDirectory(expanded, game)) {
        return { found: true, path: expanded }
      }
    }

    return { found: false }
  }

  /**
   * Verifies if the folder contains the primary executable
   */
  public validateGameDirectory(dirPath: string, game: GameDefinition): boolean {
    if (!dirPath || !fs.existsSync(dirPath)) return false

    const mainExe = game.executables.game
    const fullExePath = path.join(dirPath, mainExe)

    if (fs.existsSync(fullExePath)) return true

    // Check case-insensitively on Linux
    try {
      const files = fs.readdirSync(dirPath)
      return files.some((f) => f.toLowerCase() === mainExe.toLowerCase())
    } catch {
      return false
    }
  }

  /**
   * Resolves the save / option file directory for the game
   */
  public resolveSaveDirectory(game: GameDefinition): string {
    const rawPath = isWindows ? game.save_paths.windows : game.save_paths.linux
    const expanded = expandPathTokens(rawPath)

    if (!fs.existsSync(expanded)) {
      try {
        fs.mkdirSync(expanded, { recursive: true })
      } catch (err) {
        console.warn(`Could not create save directory: ${expanded}`, err)
      }
    }
    return expanded
  }
}

export const gameDetector = new GameDetector()
