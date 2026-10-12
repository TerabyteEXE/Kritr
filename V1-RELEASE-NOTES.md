# Kritr V1 Release Candidate

## V1 additions
- Higher-quality album artwork rendering and larger-cover selection.
- Stable window-state handling for normal/mini mode without animated bounds jumps.
- Six pets: Cat, Bunny, Slime, Fox, Frog, Anime Girl.
- Six additional V1 themes: Dreamcast, Neko Café, Arcade, Aqua OS, Terminal Green, Anime Night.
- Advanced Settings for album size, visualizer height, pet size, controls, spacing, borders, and status bar.
- Static launch website source with Download, Source and YouTube explanation links.
- Safe external-link bridge from Electron.
- Installer remains NSIS and preserves userData on upgrade/uninstall unless manually removed.

## Before building
Edit `js/release-config.js` and `website/config.js` with your real GitHub/website/YouTube URLs.

Then run `npm install`, `npm start`, and finally `npm run dist`.
