import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { LauncherSettings } from '../../types'

const defaultSettings: LauncherSettings = {
  language: 'es',
  theme: 'dark',
  customGamePaths: {},
  discordRpcEnabled: true,
  autoUpdateLauncher: true,
  preferredCdn: 'default'
}

class ConfigStore {
  private configPath: string
  private settings: LauncherSettings

  constructor() {
    const configDir = path.join(os.homedir(), '.config', 'fb-servers')
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    this.configPath = path.join(configDir, 'settings.json')
    this.settings = this.load()
  }

  private load(): LauncherSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8')
        return { ...defaultSettings, ...JSON.parse(data) }
      }
    } catch (err) {
      console.warn('Failed to load settings file, using defaults:', err)
    }
    return { ...defaultSettings }
  }

  public getSettings(): LauncherSettings {
    return { ...this.settings }
  }

  public saveSettings(partial: Partial<LauncherSettings>): boolean {
    try {
      this.settings = { ...this.settings, ...partial }
      fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('Failed to save settings:', err)
      return false
    }
  }

  public getGameCustomPath(gameId: string): string | undefined {
    return this.settings.customGamePaths[gameId]
  }

  public setGameCustomPath(gameId: string, customPath: string): boolean {
    this.settings.customGamePaths[gameId] = customPath
    return this.saveSettings({ customGamePaths: this.settings.customGamePaths })
  }
}

export const configStore = new ConfigStore()
