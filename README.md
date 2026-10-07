# Kritr

Kritr is a compact 8/16-bit styled local music player by TerabyteEXE.

## Desktop app (recommended)

The Electron build is the real Kritr application. It adds:

- Persistent music library across restarts
- Add individual songs or whole music folders
- Automatic library rescanning
- Embedded metadata and album artwork
- Remembered last song and playback position
- Remembered window position and mini-player mode
- Windows media-key controls
- System tray playback controls
- Optional Windows startup
- Optional start minimized / close to tray
- Optional track-change notifications
- Windows audio-file associations in the installer
- NSIS `.exe` installer workflow

### First run in VS Code

Install Node.js, then open the Kritr folder and run:

```bash
npm install
npm start
```

### Build the Windows installer

On Windows:

```bash
npm install
npm run dist
```

The finished installer is created in `dist/` and is named similar to:

```text
Kritr-Setup-0.9.0.exe
```

A portable build is also available:

```bash
npm run dist:portable
```

## Music library data

Kritr does **not** copy your songs. The desktop app stores their file paths and metadata in Electron's per-user application data directory. Album art extracted from audio tags is cached there as well.

Removing a track from Kritr does not delete the original audio file.

## Web / GitHub Pages build

The HTML/CSS/JS frontend still works in a normal browser as a demo. Browser security means selected local songs cannot be restored after a full reload, so persistent libraries are an Electron-only feature.

## Development scripts

- `npm start` — run Kritr in Electron
- `npm run dev` — same as start
- `npm run pack` — create an unpacked desktop build
- `npm run dist` — create the Windows NSIS installer
- `npm run dist:portable` — create a portable Windows executable
