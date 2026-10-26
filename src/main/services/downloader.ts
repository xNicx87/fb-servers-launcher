import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import https from 'node:https'
import AdmZip from 'adm-zip'
import { DownloadProgress } from '../../types'
import { verifyChecksum } from '../utils/hasher'

export type ProgressCallback = (progress: DownloadProgress) => void

interface ActiveDownload {
  patchId: string
  abortController: AbortController
  tempFilePath: string
}

class Downloader {
  private activeDownloads = new Map<string, ActiveDownload>()

  /**
   * Downloads a remote patch archive, validates its SHA-256 hash, and extracts it to targetDir.
   */
  public async downloadAndExtract(options: {
    patchId: string
    gameId: string
    name: string
    url: string
    sha256: string
    targetDir: string
    onProgress: ProgressCallback
  }): Promise<{ success: boolean; error?: string }> {
    const { patchId, gameId, name, url, sha256, targetDir, onProgress } = options

    const tempDir = path.join(targetDir, '.fb_tmp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFilePath = path.join(tempDir, `${patchId}_${Date.now()}.part`)
    const abortController = new AbortController()

    this.activeDownloads.set(patchId, {
      patchId,
      abortController,
      tempFilePath
    })

    const progress: DownloadProgress = {
      patchId,
      gameId,
      name,
      bytesReceived: 0,
      totalBytes: 0,
      percent: 0,
      speedBytesPerSec: 0,
      status: 'downloading'
    }

    onProgress(progress)

    try {
      // 1. Download file stream
      await this.streamToFile(url, tempFilePath, abortController.signal, (received, total, speed) => {
        progress.bytesReceived = received
        progress.totalBytes = total
        progress.percent = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0
        progress.speedBytesPerSec = speed
        onProgress(progress)
      })

      // 2. Verify Checksum
      progress.status = 'verifying'
      progress.speedBytesPerSec = 0
      onProgress(progress)

      if (sha256 && sha256.length === 64) {
        const isValid = await verifyChecksum(tempFilePath, sha256)
        if (!isValid) {
          throw new Error('La verificación de integridad SHA-256 ha fallado. El archivo descargado puede estar corrupto.')
        }
      }

      // 3. Extract or place in destination
      progress.status = 'extracting'
      onProgress(progress)

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }

      const isZip = tempFilePath.endsWith('.zip') || url.endsWith('.zip')
      if (isZip) {
        const zip = new AdmZip(tempFilePath)
        zip.extractAllTo(targetDir, true)
      } else {
        // Direct single file placement
        const destFileName = path.basename(new URL(url).pathname)
        fs.copyFileSync(tempFilePath, path.join(targetDir, destFileName))
      }

      // 4. Cleanup temp file
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
      } catch (err) {
        // ignore cleanup error
      }

      progress.status = 'completed'
      progress.percent = 100
      onProgress(progress)

      this.activeDownloads.delete(patchId)
      return { success: true }
    } catch (err: any) {
      if (fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath) } catch {}
      }
      this.activeDownloads.delete(patchId)

      progress.status = 'error'
      progress.error = err?.message || String(err)
      onProgress(progress)

      return { success: false, error: progress.error }
    }
  }

  public cancel(patchId: string): boolean {
    const active = this.activeDownloads.get(patchId)
    if (active) {
      active.abortController.abort()
      if (fs.existsSync(active.tempFilePath)) {
        try { fs.unlinkSync(active.tempFilePath) } catch {}
      }
      this.activeDownloads.delete(patchId)
      return true
    }
    return false
  }

  private streamToFile(
    urlStr: string,
    destPath: string,
    signal: AbortSignal,
    onProgress: (received: number, total: number, speed: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(destPath)
      const protocol = urlStr.startsWith('https') ? https : http

      let received = 0
      let total = 0
      let lastTime = Date.now()
      let lastReceived = 0
      let currentSpeed = 0

      const req = protocol.get(urlStr, { signal }, (res) => {
        // Handle HTTP redirects (301, 302, 307)
        if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          fileStream.close()
          fs.unlinkSync(destPath)
          this.streamToFile(res.headers.location, destPath, signal, onProgress)
            .then(resolve)
            .catch(reject)
          return
        }

        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          fileStream.close()
          reject(new Error(`Servidor HTTP respondió con código de error: ${res.statusCode}`))
          return
        }

        total = parseInt(res.headers['content-length'] || '0', 10)

        res.on('data', (chunk) => {
          received += chunk.length
          const now = Date.now()
          const elapsedSec = (now - lastTime) / 1000

          if (elapsedSec >= 0.5) {
            currentSpeed = Math.round((received - lastReceived) / elapsedSec)
            lastTime = now
            lastReceived = received
            onProgress(received, total, currentSpeed)
          }
        })

        res.pipe(fileStream)

        fileStream.on('finish', () => {
          fileStream.close()
          onProgress(received, total, 0)
          resolve()
        })
      })

      req.on('error', (err) => {
        fileStream.close()
        reject(err)
      })

      signal.addEventListener('abort', () => {
        req.destroy()
        fileStream.close()
        reject(new Error('Descarga cancelada por el usuario'))
      })
    })
  }
}

export const downloader = new Downloader()
