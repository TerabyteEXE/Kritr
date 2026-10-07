const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("kritrDesktop", {
    isDesktop: true,

    library: {
        get: () => ipcRenderer.invoke("library:get"),
        addFiles: () => ipcRenderer.invoke("library:add-files"),
        addFolder: () => ipcRenderer.invoke("library:add-folder"),
        rescan: () => ipcRenderer.invoke("library:rescan"),
        removeTrack: id => ipcRenderer.invoke("library:remove-track", id),
        removeFolder: folder => ipcRenderer.invoke("library:remove-folder", folder),
        clear: () => ipcRenderer.invoke("library:clear")
    },

    playback: {
        get: () => ipcRenderer.invoke("playback:get"),
        save: state => ipcRenderer.invoke("playback:save", state)
    },

    prefs: {
        get: () => ipcRenderer.invoke("prefs:get"),
        set: patch => ipcRenderer.invoke("prefs:set", patch)
    },

    window: {
        setMode: mode => ipcRenderer.invoke("window:set-mode", mode),
        toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
        close: () => ipcRenderer.invoke("window:close"),
        show: () => ipcRenderer.invoke("window:show")
    },

    notify: payload => ipcRenderer.invoke("notification:show", payload),

    onPlayerCommand: callback => {
        const handler = (_event, command) => callback(command);
        ipcRenderer.on("player-command", handler);
        return () => ipcRenderer.removeListener("player-command", handler);
    },

    onLibraryChanged: callback => {
        const handler = (_event, library) => callback(library);
        ipcRenderer.on("library-changed", handler);
        return () => ipcRenderer.removeListener("library-changed", handler);
    }
});

// Electron 32+ no longer exposes File.path to the page. Capture dropped
// File objects in preload and convert them to real paths with webUtils.
window.addEventListener("drop", event => {
    try {
        const paths = [...(event.dataTransfer?.files || [])]
            .map(file => webUtils.getPathForFile(file))
            .filter(Boolean);
        if (paths.length) ipcRenderer.invoke("library:import-paths", paths);
    } catch (error) {
        console.warn("Kritr drop import failed:", error);
    }
}, true);
