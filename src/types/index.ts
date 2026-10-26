export interface GameExecutable {
  game: string
  mod_loader?: string
  settings?: string
  game_trial?: string
}

export interface PatchInfo {
  id: string
  name: string
  version: string
  category: 'core' | 'rosters' | 'content' | 'audio'
  required: boolean
  description: string
  download_url: string
  size_bytes: number
  sha256: string
  target_type: 'game_root' | 'save_folder' | 'sider_content' | 'frosty_profile'
  launch_via?: string
  launch_args?: string
  installed?: boolean
  local_version?: string
}

export interface GameDefinition {
  id: string
  name: string
  subtitle: string
  steam_appid: string
  executables: GameExecutable
  default_paths: {
    windows: string[]
    linux: string[]
  }
  save_paths: {
    windows: string
    linux: string
  }
  patches: PatchInfo[]
  installedPath?: string
  isInstalled: boolean
  isRunning: boolean
  activeProton?: string
}

export interface DownloadProgress {
  patchId: string
  gameId: string
  name: string
  bytesReceived: number
  totalBytes: number
  percent: number
  speedBytesPerSec: number
  status: 'idle' | 'downloading' | 'verifying' | 'extracting' | 'completed' | 'error'
  error?: string
}

export interface LauncherSettings {
  language: string
  theme: 'dark' | 'light'
  customGamePaths: Record<string, string>
  protonPath?: string
  winePath?: string
  discordRpcEnabled: boolean
  autoUpdateLauncher: boolean
  preferredCdn: string
}

export interface LauncherSystemInfo {
  platform: 'win32' | 'linux' | 'darwin'
  arch: string
  osRelease: string
  isWineOrProtonDetected: boolean
  steamInstalled: boolean
  availableProtons: string[]
}

export interface FbServersApi {
  getSystemInfo: () => Promise<LauncherSystemInfo>
  getGames: () => Promise<GameDefinition[]>
  detectGame: (gameId: string) => Promise<{ found: boolean; path?: string }>
  setGamePath: (gameId: string, path: string) => Promise<boolean>
  browseForDirectory: () => Promise<string | null>
  browseForFile: (filters: { name: string; extensions: string[] }[]) => Promise<string | null>
  installPatch: (gameId: string, patchId: string) => Promise<boolean>
  cancelDownload: (patchId: string) => Promise<boolean>
  launchGame: (gameId: string, withMods: boolean) => Promise<{ success: boolean; pid?: number; error?: string }>
  getSettings: () => Promise<LauncherSettings>
  saveSettings: (settings: Partial<LauncherSettings>) => Promise<boolean>
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => () => void
  onGameStatusChange: (callback: (data: { gameId: string; isRunning: boolean }) => void) => () => void
}

declare global {
  interface Window {
    fbApi: FbServersApi
  }
}
