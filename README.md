# FB Servers Launcher (PES & FIFA)

**FB Servers Launcher** es una solución de escritorio completa, moderna y multiplataforma (Windows y Linux / Steam Deck) diseñada para automatizar la gestión, descarga, verificación e inyección de parches, mods y servidores comunitarios para títulos de fútbol: **eFootball PES** (PES 2021 / 2020) y **EA SPORTS FIFA** (FIFA 23 / FC 24).

Inspirado en la ingeniería de launchers comunitarios como CB Servers y Heroic Games Launcher.

---

## 🚀 Características Principales

* **Multiplataforma Nativo:**
  * **Windows:** Detección de bibliotecas de Steam, rutas de EA Desktop y arranque nativo con Sider / Frosty.
  * **Linux & Steam Deck (Bazzite / SteamOS):** Detección de Proton / Wine, compatdata prefixes (`~/.local/share/Steam/steamapps/compatdata/...`) y lanzamiento mediante `steam -applaunch`.
* **Automatización Integral de Mods:**
  * **PES (eFootball PES 2021 / 2020):**
    * Inyección en memoria mediante **Sider 7.2**.
    * Configuración automática de `sider.ini` y carpetas `livecpk` (Kits, Estadios, Caras, Balones, Pancartas).
    * Despliegue de **Option Files** (`EDIT00000000`) en la carpeta de guardado del perfil de usuario (`Documents/KONAMI/...`).
  * **FIFA (FIFA 23 / 22):**
    * Instalación y actualización automática de bases de datos de plantillas (`Squads*`).
    * Compatibilidad con argumentos de datos de mods (`-dataPath ModData`).
* **Verificación Criptográfica Estricta:**
  * Cada paquete se compara byte a byte mediante **SHA-256** contra el manifiesto central antes de ser inyectado.
* **Gestor de Descargas por Streaming:**
  * Medidor de velocidad en tiempo real (MB/s, KB/s), cálculo de porcentajes, soporte de cancelación y limpieza automática de archivos temporales (`.part`).
* **Arquitectura de Manifiestos Remotos:**
  * Lee el catálogo central (`manifest.json`) alojado en CDN o repositorio GitHub, permitiendo actualizar versiones de parches sin necesidad de recompilar el launcher.

---

## 🛠️ Stack Tecnológico

* **Núcleo / Proceso Principal:** Electron 34 + Node.js 24 + TypeScript (strict mode).
* **Frontend:** React 19 + Vite 6 + Tailwind CSS + Lucide Icons.
* **Empaquetado Multiplataforma:** `electron-builder` (genera instaladores `.exe` y portables para Windows; `.AppImage` y `.deb` para Linux).
* **Compresión / Extracción:** `adm-zip` para despliegue atómico de archivos `.zip`.

---

## 📁 Estructura del Código

```
fb-servers-launcher/
├── index.html                      # Punto de entrada HTML del frontend
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                  # Configuración de compilación con vite-plugin-electron
├── tailwind.config.js              # Tema gamer oscuro con acentos esmeralda/dorado
├── electron-builder.yml            # Configuración de empaquetado para Windows y Linux
├── server-manifest-sample/
│   └── manifest.json               # Manifiesto central con definición de parches y hashes
└── src/
    ├── types/
    │   └── index.ts                # Interfaces compartidas (Game, Patch, Manifest, Settings)
    ├── preload/
    │   └── index.ts                # Context bridge seguro (window.fbApi)
    ├── main/
    │   ├── index.ts                # Ciclo de vida de la ventana Electron
    │   ├── ipc/
    │   │   └── handlers.ts         # Controladores IPC type-safe
    │   ├── services/
    │   │   ├── configStore.ts      # Persistencia de configuración local (~/.config/fb-servers)
    │   │   ├── downloader.ts       # Descargador streaming con control de velocidad y SHA-256
    │   │   ├── gameDetector.ts     # Escáner de bibliotecas Steam y rutas de disco (Win/Linux)
    │   │   ├── modInjector.ts      # Configurador de Sider (sider.ini) y Option Files
    │   │   ├── patchManager.ts     # Coordinador de estados de parches y dependencias
    │   │   └── runner.ts           # Motor de arranque (ejecución nativa Windows / Steam Proton Linux)
    │   └── utils/
    │       ├── hasher.ts           # Funciones de hashing SHA-256
    │       └── paths.ts            # Resolvedor de rutas según el SO y búsqueda de Proton
    └── renderer/
        └── src/
            ├── App.tsx             # Componente raíz con navegación y estado reactivo
            ├── main.tsx
            ├── index.css
            └── components/
                ├── Sidebar.tsx     # Barra lateral con estado de plataforma (Proton/Windows)
                ├── GameCard.tsx    # Tarjeta de juego interactiva
                ├── GameDetailView.tsx # Centro de control de mods, parches y ejecución
                ├── DownloadsView.tsx  # Monitor de descargas en tiempo real
                └── SettingsView.tsx   # Configuración de rutas y Proton
```

---

## 🚀 Instrucciones de Ejecución y Compilación

### 1. Ejecutar en Modo Desarrollo
```bash
npm run dev
```

### 2. Compilar el Código TypeScript y Frontend
```bash
npm run build:electron
```

### 3. Generar Instaladores Finales

#### Para Linux (AppImage y .deb):
```bash
npx electron-builder --linux
```

#### Para Windows (Instalador NSIS y Portable .exe):
```bash
npx electron-builder --win
```
*(Nota: Para empaquetar para Windows desde Linux se utiliza Wine con electron-builder de forma transparente).*
