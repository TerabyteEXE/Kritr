# Kritr Windows release checklist

1. Test the app with `npm start`.
2. Add a few songs and at least one music folder.
3. Quit from the tray, relaunch, and confirm the library returns.
4. Confirm the last track and playback position return.
5. Test mini mode, remembered window position, shuffle/repeat, search and favorites.
6. Test Play/Pause, Previous and Next media keys.
7. Test Start with Windows, Start Minimized and Close to Tray.
8. Run `npm run dist` (or double-click `build-installer.bat`).
9. Install `dist/Kritr-Setup-0.9.0.exe` on a clean Windows account/VM.
10. Test uninstall. Kritr intentionally leaves user library/settings data unless manually removed.

## Before a public V1

The installer is currently unsigned. Windows SmartScreen may warn users about an unknown publisher. For a polished public release, obtain a Windows code-signing certificate and configure electron-builder signing before publishing V1.
