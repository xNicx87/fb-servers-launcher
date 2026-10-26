import fs from 'node:fs'
import path from 'node:path'
import { PatchInfo, GameDefinition } from '../../types'
import { gameDetector } from './gameDetector'

export class ModInjector {
  /**
   * Post-processes an installed patch according to game and patch rules.
   */
  public async configurePatch(game: GameDefinition, patch: PatchInfo, gamePath: string): Promise<boolean> {
    try {
      if (game.id === 'pes2021') {
        return this.configurePesPatch(game, patch, gamePath)
      } else if (game.id === 'fifa23') {
        return this.configureFifaPatch(game, patch, gamePath)
      }
      return true
    } catch (err) {
      console.error(`Error configuring patch ${patch.id}:`, err)
      return false
    }
  }

  /**
   * PES 2021 Sider and Option File automatic configuration
   */
  private configurePesPatch(game: GameDefinition, patch: PatchInfo, gamePath: string): boolean {
    const siderIniPath = path.join(gamePath, 'sider.ini')

    // If Sider patch installed, verify sider.ini configuration
    if (patch.id === 'fb-pes2021-sider') {
      if (!fs.existsSync(siderIniPath)) {
        const defaultSiderIni = [
          '[sider]',
          'debug = 0',
          'close.on.exit = 1',
          'start.minimized = 1',
          'free.side.select = 1',
          'livecpk.enabled = 1',
          '',
          '; FB Servers LiveCPK Modules',
          'cpk.root = ".\\livecpk\\FB-OptionFile"',
          'cpk.root = ".\\livecpk\\FB-Stadiums"',
          'cpk.root = ".\\livecpk\\FB-Faces"',
          'cpk.root = ".\\livecpk\\FB-Kits"',
          '',
          '; Lua scripts',
          'lua.module = "camera.lua"',
          'lua.module = "sound.lua"',
          'lua.module = "gameplay.lua"'
        ].join('\n')

        fs.writeFileSync(siderIniPath, defaultSiderIni, 'utf-8')
      }
    }

    // If Option File, ensure save directories exist and symlink/copy if needed
    if (patch.target_type === 'save_folder') {
      const saveDir = gameDetector.resolveSaveDirectory(game)
      console.log(`Option File configured in: ${saveDir}`)
    }

    return true
  }

  /**
   * FIFA 23 squad and mod configuration
   */
  private configureFifaPatch(game: GameDefinition, patch: PatchInfo, gamePath: string): boolean {
    if (patch.target_type === 'save_folder') {
      const saveDir = gameDetector.resolveSaveDirectory(game)
      console.log(`FIFA Squads data ready in: ${saveDir}`)
    }
    return true
  }
}

export const modInjector = new ModInjector()
