import { spawn, ChildProcess } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { GameDefinition } from '../../types'
import { isWindows, isLinux } from '../utils/paths'
import { configStore } from './configStore'

type GameStatusCallback = (data: { gameId: string; isRunning: boolean }) => void

export class GameRunner {
  private activeProcesses = new Map<string, ChildProcess>()
  private statusListeners: GameStatusCallback[] = []

  public onStatusChange(listener: GameStatusCallback) {
    this.statusListeners.push(listener)
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener)
    }
  }

  private notifyStatus(gameId: string, isRunning: boolean) {
    for (const listener of this.statusListeners) {
      listener({ gameId, isRunning })
    }
  }

  public isRunning(gameId: string): boolean {
    return this.activeProcesses.has(gameId)
  }

  public async launch(
    game: GameDefinition,
    gamePath: string,
    withMods: boolean = true
  ): Promise<{ success: boolean; pid?: number; error?: string }> {
    if (this.isRunning(game.id)) {
      return { success: false, error: 'El juego ya se encuentra en ejecución' }
    }

    try {
      if (isWindows) {
        return this.launchWindows(game, gamePath, withMods)
      } else if (isLinux) {
        return this.launchLinux(game, gamePath, withMods)
      } else {
        return { success: false, error: 'Sistema operativo no compatible' }
      }
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) }
    }
  }

  private launchWindows(
    game: GameDefinition,
    gamePath: string,
    withMods: boolean
  ): { success: boolean; pid?: number; error?: string } {
    const targetExe = (withMods && game.executables.mod_loader)
      ? game.executables.mod_loader
      : game.executables.game

    const fullExe = path.join(gamePath, targetExe)

    if (!fs.existsSync(fullExe)) {
      // Fallback to base game executable
      const baseExe = path.join(gamePath, game.executables.game)
      if (!fs.existsSync(baseExe)) {
        return { success: false, error: `No se encontró el ejecutable: ${fullExe}` }
      }
    }

    const child = spawn(fullExe, [], {
      cwd: gamePath,
      detached: true,
      stdio: 'ignore'
    })

    child.unref()

    this.activeProcesses.set(game.id, child)
    this.notifyStatus(game.id, true)

    child.on('exit', () => {
      this.activeProcesses.delete(game.id)
      this.notifyStatus(game.id, false)
    })

    return { success: true, pid: child.pid }
  }

  private launchLinux(
    game: GameDefinition,
    gamePath: string,
    withMods: boolean
  ): { success: boolean; pid?: number; error?: string } {
    // If the game is associated with Steam, launch via Steam applaunch protocol
    if (game.steam_appid) {
      console.log(`Lanzando juego via Steam Proton AppLaunch: ${game.steam_appid}`)

      const child = spawn('steam', ['-applaunch', game.steam_appid], {
        detached: true,
        stdio: 'ignore'
      })

      child.unref()
      this.activeProcesses.set(game.id, child)
      this.notifyStatus(game.id, true)

      child.on('exit', () => {
        this.activeProcesses.delete(game.id)
        this.notifyStatus(game.id, false)
      })

      return { success: true, pid: child.pid }
    }

    // Direct Wine fallback
    const targetExe = (withMods && game.executables.mod_loader)
      ? game.executables.mod_loader
      : game.executables.game
    const fullExe = path.join(gamePath, targetExe)

    const wineBinary = configStore.getSettings().winePath || 'wine'

    const child = spawn(wineBinary, [fullExe], {
      cwd: gamePath,
      detached: true,
      stdio: 'ignore'
    })

    child.unref()
    this.activeProcesses.set(game.id, child)
    this.notifyStatus(game.id, true)

    child.on('exit', () => {
      this.activeProcesses.delete(game.id)
      this.notifyStatus(game.id, false)
    })

    return { success: true, pid: child.pid }
  }
}

export const gameRunner = new GameRunner()
