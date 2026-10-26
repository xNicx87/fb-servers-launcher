import React from 'react'
import { Download, XCircle, CheckCircle2, AlertTriangle, ShieldCheck, HardDrive } from 'lucide-react'
import { DownloadProgress } from '../../../types'

interface DownloadsViewProps {
  downloads: Record<string, DownloadProgress>
  onCancel: (patchId: string) => void
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({ downloads, onCancel }) => {
  const downloadList = Object.values(downloads)

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 MB'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatSpeed = (bytesPerSec: number): string => {
    if (!bytesPerSec || bytesPerSec === 0) return '0 KB/s'
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`
    return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#121826] rounded-3xl p-6 border border-[#1f293d]">
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Download className="w-6 h-6 text-emerald-400" />
              Gestor de Descargas e Instalaciones
            </h2>
            <p className="text-xs text-gray-400">
              Seguimiento en tiempo real de parches, verificación de integridad y despliegue de archivos.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1a2336] text-gray-300">
            {downloadList.length} en cola
          </span>
        </div>

        {downloadList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <HardDrive className="w-12 h-12 text-gray-600 mx-auto stroke-1" />
            <p className="text-gray-400 text-sm font-medium">
              No hay descargas activas en este momento.
            </p>
            <p className="text-xs text-gray-500">
              Selecciona un parche en la biblioteca para iniciar la instalación automatizada.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {downloadList.map((item) => (
              <div
                key={item.patchId}
                className="bg-[#0e1424] p-5 rounded-2xl border border-[#1b253b] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">{item.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Juego: {item.gameId.toUpperCase()}</span>
                      <span>•</span>
                      <span>
                        {formatBytes(item.bytesReceived)} de {formatBytes(item.totalBytes)}
                      </span>
                      {item.status === 'downloading' && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            {formatSpeed(item.speedBytesPerSec)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    <div className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                      {item.status === 'downloading' && (
                        <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                          Descargando... {item.percent}%
                        </span>
                      )}
                      {item.status === 'verifying' && (
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verificando SHA-256
                        </span>
                      )}
                      {item.status === 'extracting' && (
                        <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                          Descomprimiendo e inyectando...
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Instalado con éxito
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Error en instalación
                        </span>
                      )}
                    </div>

                    {['downloading', 'verifying'].includes(item.status) && (
                      <button
                        onClick={() => onCancel(item.patchId)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-[#1a2336] transition-colors"
                        title="Cancelar descarga"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1b253b] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.status === 'completed'
                        ? 'bg-emerald-500'
                        : item.status === 'error'
                        ? 'bg-red-500'
                        : item.status === 'verifying'
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>

                {item.error && (
                  <p className="text-xs text-red-400 font-medium">
                    {item.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
