import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

export const isWindows = process.platform === 'win32'
export const isLinux = process.platform === 'linux'

/**
 * Resolves environmental tokens like %USERPROFILE%, %APPDATA%, %DOCUMENTS%, and ~
 */
export function expandPathTokens(rawPath: string): string {
  let expanded = rawPath

  if (isWindows) {
    const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default'
    const appData = process.env.APPDATA || path.join(userProfile, 'AppData', 'Roaming')
    const localAppData = process.env.LOCALAPPDATA || path.join(userProfile, 'AppData', 'Local')
    const documents = path.join(userProfile, 'Documents')

    expanded = expanded
      .replace(/%USERPROFILE%/gi, userProfile)
      .replace(/%APPDATA%/gi, appData)
      .replace(/%LOCALAPPDATA%/gi, localAppData)
      .replace(/%DOCUMENTS%/gi, documents)
  } else {
    const home = os.homedir()
    expanded = expanded.replace(/^~(?=$|\/|\\)/, home)
    expanded = expanded.replace(/%USERPROFILE%/gi, home)
    expanded = expanded.replace(/%DOCUMENTS%/gi, path.join(home, 'Documents'))
  }

  return path.normalize(expanded)
}

/**
 * Locates standard Steam installation directories across Windows and Linux
 */
export function getSteamCommonPaths(): string[] {
  const paths: string[] = []
  const home = os.homedir()

  if (isWindows) {
    const drives = ['C:', 'D:', 'E:', 'F:', 'G:']
    for (const drive of drives) {
      paths.push(
        path.join(drive, 'Program Files (x86)', 'Steam', 'steamapps', 'common'),
        path.join(drive, 'Program Files', 'Steam', 'steamapps', 'common'),
        path.join(drive, 'SteamLibrary', 'steamapps', 'common'),
        path.join(drive, 'Steam', 'steamapps', 'common')
      )
    }
  } else if (isLinux) {
    paths.push(
      path.join(home, '.local', 'share', 'Steam', 'steamapps', 'common'),
      path.join(home, '.steam', 'steam', 'steamapps', 'common'),
      path.join(home, '.steam', 'root', 'steamapps', 'common'),
      path.join(home, '.var', 'app', 'com.valvesoftware.Steam', 'data', 'Steam', 'steamapps', 'common') // Flatpak Steam
    )
  }

  return paths.filter((p) => fs.existsSync(p))
}

/**
 * Finds available Proton / GE-Proton runtimes on Linux
 */
export function findAvailableProtons(): string[] {
  if (!isLinux) return []
  const home = os.homedir()
  const protonDirs = [
    path.join(home, '.local', 'share', 'Steam', 'compatibilitytools.d'),
    path.join(home, '.steam', 'root', 'compatibilitytools.d'),
    path.join(home, '.local', 'share', 'Steam', 'steamapps', 'common'),
    '/usr/share/steam/compatibilitytools.d'
  ]

  const versions: string[] = []
  for (const dir of protonDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          if (/proton/i.test(file)) {
            versions.push(path.join(dir, file))
          }
        }
      } catch (err) {
        // ignore unreadable dirs
      }
    }
  }
  return Array.from(new Set(versions))
}
